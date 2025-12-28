import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { Book } from '../book/entities/book.entity';
import { MemberType } from '../member/member-type.enum';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(createFavoriteDto: CreateFavoriteDto, currentUser: { sub: string; type: MemberType }): Promise<Favorite> {
    this.ensureUser(currentUser);
    const book = await this.ensureBookExists(createFavoriteDto.bookID);

    const exists = await this.favoriteRepository.findOne({
      where: { userID: currentUser.sub, bookID: createFavoriteDto.bookID },
    });
    if (exists) {
      throw new ConflictException('Already favorited');
    }

    const favorite = this.favoriteRepository.create({
      userID: currentUser.sub,
      bookID: createFavoriteDto.bookID,
      book,
    });
    return this.favoriteRepository.save(favorite);
  }

  async findMine(currentUser: { sub: string; type: MemberType }): Promise<Favorite[]> {
    this.ensureUser(currentUser);
    return this.favoriteRepository.find({
      where: { userID: currentUser.sub },
      relations: ['book', 'book.images'],
    });
  }

  async remove(bookID: string, currentUser: { sub: string; type: MemberType }): Promise<void> {
    this.ensureUser(currentUser);
    const favorite = await this.favoriteRepository.findOne({ where: { userID: currentUser.sub, bookID } });
    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }
    await this.favoriteRepository.remove(favorite);
  }

  private ensureUser(user: { type: MemberType }) {
    if (user.type !== MemberType.User) {
      throw new ForbiddenException('Only user can manage favorites');
    }
  }

  private async ensureBookExists(bookID: string): Promise<Book> {
    const book = await this.bookRepository.findOne({ where: { bookID } });
    if (!book) {
      throw new NotFoundException(`Book ${bookID} not found`);
    }
    return book;
  }
}
