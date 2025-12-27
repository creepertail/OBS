import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { MemberType } from '../member/member-type.enum';
import { Book } from '../book/entities/book.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(createDto: CreateReviewDto, currentUser: { sub: string; type: MemberType }): Promise<Review> {
    this.ensureUser(currentUser);
    await this.ensureBookExists(createDto.bookID);

    const existing = await this.reviewRepository.findOne({
      where: { userID: currentUser.sub, bookID: createDto.bookID },
    });
    if (existing) {
      throw new ConflictException('Review already exists for this book');
    }

    const review = this.reviewRepository.create({
      userID: currentUser.sub,
      bookID: createDto.bookID,
      date: new Date(createDto.date),
      stars: createDto.stars,
      description: createDto.description,
    });
    return this.reviewRepository.save(review);
  }

  async findByBook(bookID: string): Promise<Review[]> {
    await this.ensureBookExists(bookID);
    return this.reviewRepository.find({
      where: { bookID },
      relations: ['user'],
    });
  }

  async findMine(currentUser: { sub: string; type: MemberType }): Promise<Review[]> {
    this.ensureUser(currentUser);
    return this.reviewRepository.find({
      where: { userID: currentUser.sub },
      relations: ['book'],
    });
  }

  async update(
    bookID: string,
    updateDto: UpdateReviewDto,
    currentUser: { sub: string; type: MemberType },
  ): Promise<Review> {
    this.ensureUser(currentUser);
    const review = await this.reviewRepository.findOne({ where: { userID: currentUser.sub, bookID } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (updateDto.date !== undefined) {
      review.date = new Date(updateDto.date);
    }
    if (updateDto.stars !== undefined) {
      review.stars = updateDto.stars;
    }
    if (updateDto.description !== undefined) {
      review.description = updateDto.description;
    }
    return this.reviewRepository.save(review);
  }

  async remove(bookID: string, currentUser: { sub: string; type: MemberType }): Promise<void> {
    this.ensureUser(currentUser);
    const review = await this.reviewRepository.findOne({ where: { userID: currentUser.sub, bookID } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    await this.reviewRepository.remove(review);
  }

  private ensureUser(user: { type: MemberType }) {
    if (user.type !== MemberType.User) {
      throw new ForbiddenException('Only user can manage reviews');
    }
  }

  private async ensureBookExists(bookID: string): Promise<void> {
    const book = await this.bookRepository.findOne({ where: { bookID } });
    if (!book) {
      throw new NotFoundException(`Book ${bookID} not found`);
    }
  }
}
