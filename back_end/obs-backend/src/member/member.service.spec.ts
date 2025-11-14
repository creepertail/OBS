import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { MemberType } from './member-type.enum'; // 引入 MemberType 枚舉
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

// --- 模擬外部依賴 ---
// 模擬 bcrypt 函式庫，用於密碼加密和比對
jest.mock('bcrypt', () => ({
  hash: jest.fn((password, salt) => Promise.resolve(`hashed_${password}`)), // 讓 hash 根據輸入的密碼回傳一個可預測的加密值
  compare: jest.fn(),
}));

// 為了讓 TypeScript 能識別我們的模擬 Repository 物件，定義一個類型
type MockRepository = {
  findOne: jest.Mock;
  save: jest.Mock;
  create: jest.Mock;
  find: jest.Mock;
  delete: jest.Mock;
};

// 建立一個工廠函數來產生模擬的 Repository 實例
const createMockRepository = (): MockRepository => ({
  findOne: jest.fn(), // 模擬 findOne 方法
  save: jest.fn(),    // 模擬 save 方法
  create: jest.fn(),  // 模擬 create 方法
  find: jest.fn(),    // 模擬 find 方法
  delete: jest.fn(),  // 模擬 delete 方法
});

// --- MemberService 的測試套件 ---
describe('MemberService', () => {
  let service: MemberService; // 待測試的 MemberService 實例
  let repository: MockRepository; // 模擬的 MemberRepository 實例

  // 在每個測試案例 (it) 執行前，都會先執行這個區塊
  beforeEach(async () => {
    // 重置所有模擬函式，確保每個測試案例都是乾淨的狀態，互不影響
    jest.clearAllMocks();

    // 建立一個 NestJS 測試模組，用於提供 MemberService 及其模擬的依賴
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService, // 提供我們要測試的真實 MemberService
        {
          provide: getRepositoryToken(Member), // 當 MemberService 需要 MemberRepository 時
          useFactory: createMockRepository,    // 提供我們自定義的模擬 Repository
        },
        {
          provide: JwtService, // 當 MemberService 需要 JwtService 時
          useValue: {          // 提供一個簡單的模擬 JwtService
            signAsync: jest.fn().mockResolvedValue('mock.jwt.token'), // 模擬 signAsync 方法
          },
        },
      ],
    }).compile();

    // 從測試模組中取得 MemberService 的實例
    service = module.get<MemberService>(MemberService);
    // 同樣取得我們模擬的 Repository 的實例，以便在測試中控制它的行為
    repository = module.get<MockRepository>(getRepositoryToken(Member));

    // 模擬 private 方法 ensureUniqueFields
    // 因為 ensureUniqueFields 是 private 方法，需要這樣模擬
    jest.spyOn(service as any, 'ensureUniqueFields').mockResolvedValue(undefined);
  });

  // --- 基本測試：確認服務是否能被成功建立 ---
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- create 方法的測試套件 ---
  describe('create', () => {
    // 測試案例：成功建立新會員，並預期回傳的物件不包含密碼
    it('should create a new member and return it without the password', async () => {
      const createMemberDto: CreateMemberDto = {
        email: 'test@example.com',
        account: 'testuser',
        password: 'password123',
        phoneNumber: '0912345678',
        type: MemberType.User,
        username: 'Test User',
      };
      // Arrange (安排): 設定模擬物件的行為
      repository.findOne.mockReturnValue(null); // 模擬 findOne 回傳 null，表示帳號不存在
      repository.save.mockImplementation(member => Promise.resolve({ ...member, member_id: 'some-uuid' })); // 模擬 save 成功
      repository.create.mockImplementation(dto => dto); // 模擬 create 實例
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password'); // 模擬密碼加密

      // Act (行動): 呼叫被測試的方法
      const result = await service.create(createMemberDto);

      // Assert (斷言): 驗證結果
      expect(result.account).toEqual(createMemberDto.account);
      expect(result).not.toHaveProperty('password'); // 斷言：回傳結果不包含密碼
      expect(repository.save).toHaveBeenCalled(); // 斷言：save 方法被呼叫
    });

    // 測試案例：當帳號已存在時，預期拋出 ConflictException 錯誤
    it('should throw a ConflictException if the account already exists', async () => {
      const createMemberDto: CreateMemberDto = {
        email: 'test@example.com',
        account: 'testuser',
        password: 'password123',
        phoneNumber: '0912345678',
        type: MemberType.User,
        username: 'Test User',
      };
      // Arrange (安排): 設定模擬物件的行為
      repository.findOne.mockReturnValue(createMemberDto); // 模擬 findOne 找到已存在的會員

      // 重新 mock ensureUniqueFields，讓它拋出 ConflictException
      jest.spyOn(service as any, 'ensureUniqueFields').mockRejectedValue(new ConflictException('Account already exists'));

      // Act & Assert (行動與斷言): 預期呼叫 create 會拋出 ConflictException
      await expect(service.create(createMemberDto)).rejects.toThrow(ConflictException); // 斷言：拋出 ConflictException
    });
  });

  // --- login 方法的測試套件 ---
  describe('login', () => {
    // 測試案例：成功登入，回傳 access token 和不含密碼的會員資料
    it('should return an access token and member data without password on successful login', async () => {
      const loginDto = { account: 'test@example.com', password: 'password123' };
      const mockUser = { member_id: 'some-uuid', account: 'test@example.com', password: 'hashed_password', name: 'Test User', type: MemberType.User };
      // Arrange
      repository.findOne.mockReturnValue(Promise.resolve(mockUser)); // 模擬找到使用者
      (bcrypt.compare as jest.Mock).mockReturnValue(Promise.resolve(true)); // 模擬密碼比對成功

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { account: loginDto.account } });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
      expect(result).toHaveProperty('access_token'); // 斷言：結果包含 access_token
      expect(result.member).not.toHaveProperty('password'); // 斷言：回傳的會員資料不含密碼
    });

    // 測試案例：使用者不存在時，拋出 UnauthorizedException
    it('should throw an UnauthorizedException if user is not found', async () => {
      const loginDto = { account: 'not-exist@example.com', password: 'password123' };
      // Arrange
      repository.findOne.mockReturnValue(Promise.resolve(null)); // 模擬找不到使用者

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException); // 斷言：拋出 UnauthorizedException
    });

    // 測試案例：密碼不正確時，拋出 UnauthorizedException
    it('should throw an UnauthorizedException if password is incorrect', async () => {
      const loginDto = { account: 'test@example.com', password: 'wrong_password' };
      const mockUser = { member_id: 'some-uuid', account: 'test@example.com', password: 'hashed_password', type: MemberType.User };
      // Arrange
      repository.findOne.mockReturnValue(Promise.resolve(mockUser)); // 模擬找到使用者
      (bcrypt.compare as jest.Mock).mockReturnValue(Promise.resolve(false)); // 模擬密碼比對失敗

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException); // 斷言：拋出 UnauthorizedException
    });
  });

  // --- findAll 方法的測試套件 ---
  describe('findAll', () => {
    // 測試案例：成功回傳所有會員的陣列
    it('should return an array of members', async () => {
      const mockMembers = [{ member_id: 'uuid1', account: 'a1', name: 'n1', type: MemberType.User }];
      // Arrange
      repository.find.mockReturnValue(Promise.resolve(mockMembers)); // 模擬 find 方法回傳一個會員陣列

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockMembers); // 斷言：回傳結果與模擬資料相符
      expect(repository.find).toHaveBeenCalled(); // 斷言：find 方法被呼叫
    });
  });

  // --- findByID 方法的測試套件 ---
  describe('findByID', () => {
    // 測試案例：根據 ID 找到會員並回傳
    it('should return a member if found', async () => {
      const mockMember = { member_id: 'uuid1', account: 'a1', name: 'n1', type: MemberType.User };
      // Arrange
      repository.findOne.mockReturnValue(Promise.resolve(mockMember)); // 模擬 findOne 找到會員

      // Act
      const result = await service.findByID('uuid1');

      // Assert
      expect(result).toEqual(mockMember); // 斷言：回傳結果與模擬資料相符
      expect(repository.findOne).toHaveBeenCalledWith({ where: { member_id: 'uuid1' } }); // 斷言：findOne 方法被呼叫且參數正確
    });

    // 測試案例：根據 ID 找不到會員時，拋出 NotFoundException
    it('should throw a NotFoundException if member is not found', async () => {
      // Arrange
      repository.findOne.mockReturnValue(Promise.resolve(null)); // 模擬 findOne 找不到會員

      // Act & Assert
      await expect(service.findByID('non-existent-uuid')).rejects.toThrow(NotFoundException); // 斷言：拋出 NotFoundException
    });
  });

  // --- findMemberType 方法的測試套件 ---
  describe('findMemberType', () => {
    // 測試案例：根據 ID 找到會員並回傳其類型
    it('should return the member type if member is found', async () => {
      const mockMember = { member_id: 'uuid1', account: 'a1', name: 'n1', type: MemberType.Admin };
      // Arrange
      repository.findOne.mockReturnValue(Promise.resolve(mockMember)); // 模擬 findOne 找到會員

      // Act
      const result = await service.findMemberType('uuid1');

      // Assert
      expect(result).toEqual(MemberType.Admin); // 斷言：回傳的類型正確
    });

    // 測試案例：根據 ID 找不到會員時，拋出 NotFoundException
    it('should throw a NotFoundException if member is not found', async () => {
      // Arrange
      repository.findOne.mockReturnValue(Promise.resolve(null)); // 模擬 findOne 找不到會員

      // Act & Assert
      await expect(service.findMemberType('non-existent-uuid')).rejects.toThrow(NotFoundException); // 斷言：拋出 NotFoundException
    });
  });

  // --- remove 方法的測試套件 ---
  describe('remove', () => {
    // 測試案例：成功刪除會員
    it('should remove a member if found', async () => {
      const mockMember = { member_id: 'uuid1', account: 'a1', name: 'n1', type: MemberType.User };
      // Arrange
      repository.findOne.mockReturnValue(Promise.resolve(mockMember)); // 模擬 findOne 找到會員
      repository.delete.mockReturnValue(Promise.resolve({ affected: 1 })); // 模擬 delete 成功

      // Act
      await service.remove('uuid1');

      // Assert
      expect(repository.delete).toHaveBeenCalledWith({ member_id: 'uuid1' }); // 斷言：delete 方法被呼叫且參數正確
    });

    // 測試案例：找不到要刪除的會員時，拋出 NotFoundException
    it('should throw a NotFoundException if member is not found', async () => {
      // Arrange
      repository.findOne.mockReturnValue(Promise.resolve(null)); // 模擬 findOne 找不到會員

      // Act & Assert
      await expect(service.remove('non-existent-uuid')).rejects.toThrow(NotFoundException); // 斷言：拋出 NotFoundException
      expect(repository.delete).not.toHaveBeenCalled(); // 斷言：delete 方法沒有被呼叫
    });
  });

  // --- update 方法的測試套件 ---
  describe('update', () => {
    // 定義一些模擬使用者，用於測試不同權限和類型
    const mockAdminUser = { member_id: 'admin-uuid', account: 'admin@test.com', type: MemberType.Admin };
    const mockNormalUser = { member_id: 'user-uuid', account: 'user@test.com', type: MemberType.User };
    const mockMerchantUser = { member_id: 'merchant-uuid', account: 'merchant@test.com', type: MemberType.Merchant };

    // 模擬 ensureUniqueFields，讓它預設不拋出錯誤
    let ensureUniqueFieldsSpy: jest.SpyInstance;

    beforeEach(() => {
      // 重置所有模擬函式，確保每個測試案例都是乾淨的狀態
      jest.clearAllMocks();

      // 模擬 repository.findOne 方法，讓它回傳一個可控的 Promise
      repository.findOne.mockImplementation(({ where: { member_id: id } }) => {
        if (id === mockAdminUser.member_id) return Promise.resolve(mockAdminUser);
        if (id === mockNormalUser.member_id) return Promise.resolve(mockNormalUser);
        if (id === mockMerchantUser.member_id) return Promise.resolve(mockMerchantUser);
        return Promise.resolve(null); // 預設找不到
      });

      // 模擬 ensureUniqueFields 方法，讓它預設成功
      ensureUniqueFieldsSpy = jest.spyOn(service as any, 'ensureUniqueFields').mockResolvedValue(undefined);
    });

    // 測試案例 1: Admin 更新其他使用者的資料
    it('should allow admin to update another user\'s data', async () => {
      const updateDto: UpdateMemberDto = { username: 'New Name' };
      const updatedMember = { ...mockNormalUser, ...updateDto };
      repository.save.mockReturnValue(Promise.resolve(updatedMember));

      const result = await service.update(mockNormalUser.member_id, updateDto, { sub: mockAdminUser.member_id, type: MemberType.Admin, account: mockAdminUser.account });

      expect(result).toEqual(updatedMember);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { member_id: mockNormalUser.member_id } });
      expect(repository.save).toHaveBeenCalled();
      expect(ensureUniqueFieldsSpy).toHaveBeenCalled();
    });

    // 測試案例 2: 普通使用者更新自己的資料
    it('should allow a normal user to update their own data', async () => {
      const updateDto: UpdateMemberDto = { username: 'My New Name' };
      const updatedMember = { ...mockNormalUser, ...updateDto };
      repository.save.mockReturnValue(Promise.resolve(updatedMember));

      const result = await service.update(mockNormalUser.member_id, updateDto, { sub: mockNormalUser.member_id, type: MemberType.User, account: mockNormalUser.account });

      expect(result).toEqual(updatedMember);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { member_id: mockNormalUser.member_id } });
      expect(repository.save).toHaveBeenCalled();
      expect(ensureUniqueFieldsSpy).toHaveBeenCalled();
    });

    // 測試案例 3: 普通使用者嘗試更新其他使用者的資料
    it('should throw ForbiddenException if a normal user tries to update another user\'s data', async () => {
      const updateDto: UpdateMemberDto = { username: 'New Name' };

      await expect(service.update(mockAdminUser.member_id, updateDto, { sub: mockNormalUser.member_id, type: MemberType.User, account: mockNormalUser.account }))
        .rejects.toThrow(ForbiddenException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { member_id: mockAdminUser.member_id } });
      expect(repository.save).not.toHaveBeenCalled();
      expect(ensureUniqueFieldsSpy).not.toHaveBeenCalled(); // 因為權限檢查在 ensureUniqueFields 之前
    });

    // 測試案例 4: Admin 嘗試修改 Admin 類型不允許的欄位
    it('should throw ConflictException if admin tries to update forbidden fields for admin type', async () => {
      const updateDto: UpdateMemberDto = { merchantName: 'new_merchant_name' }; // merchantName 是 Admin 不允許修改的欄位
      repository.findOne.mockResolvedValue(mockAdminUser); // 確保找到 Admin

      await expect(service.update(mockAdminUser.member_id, updateDto, { sub: mockAdminUser.member_id, type: MemberType.Admin, account: mockAdminUser.account }))
        .rejects.toThrow(ConflictException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { member_id: mockAdminUser.member_id } });
      expect(repository.save).not.toHaveBeenCalled();
      expect(ensureUniqueFieldsSpy).not.toHaveBeenCalled(); // 因為欄位驗證在 ensureUniqueFields 之前
    });

    // 測試案例 5: User 嘗試修改 User 類型不允許的欄位
    it('should throw ConflictException if user tries to update forbidden fields for user type', async () => {
      const updateDto: UpdateMemberDto = { merchantName: 'new_merchant_name' }; // merchantName 是 User 不允許修改的欄位
      repository.findOne.mockResolvedValue(mockNormalUser); // 確保找到 User

      await expect(service.update(mockNormalUser.member_id, updateDto, { sub: mockNormalUser.member_id, type: MemberType.User, account: mockNormalUser.account }))
        .rejects.toThrow(ConflictException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { member_id: mockNormalUser.member_id } });
      expect(repository.save).not.toHaveBeenCalled();
      expect(ensureUniqueFieldsSpy).not.toHaveBeenCalled();
    });

    // 測試案例 6: Merchant 嘗試修改 Merchant 類型不允許的欄位
    it('should throw ConflictException if merchant tries to update forbidden fields for merchant type', async () => {
      const updateDto: UpdateMemberDto = { username: 'new_username' }; // username 是 Merchant 不允許修改的欄位
      repository.findOne.mockResolvedValue(mockMerchantUser); // 確保找到 Merchant

      await expect(service.update(mockMerchantUser.member_id, updateDto, { sub: mockMerchantUser.member_id, type: MemberType.Merchant, account: mockMerchantUser.account }))
        .rejects.toThrow(ConflictException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { member_id: mockMerchantUser.member_id } });
      expect(repository.save).not.toHaveBeenCalled();
      expect(ensureUniqueFieldsSpy).not.toHaveBeenCalled();
    });

    // 測試案例 7: 目標會員不存在
    it('should throw NotFoundException if target member is not found', async () => {
      repository.findOne.mockReturnValue(Promise.resolve(null)); // 模擬 findOne 找不到會員
      const updateDto: UpdateMemberDto = { username: 'New Name' };

      await expect(service.update('non-existent-uuid', updateDto, { sub: mockAdminUser.member_id, type: MemberType.Admin, account: mockAdminUser.account }))
        .rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { member_id: 'non-existent-uuid' } });
      expect(repository.save).not.toHaveBeenCalled();
      expect(ensureUniqueFieldsSpy).not.toHaveBeenCalled();
    });
  });
});
