import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { AbstractService } from '../../common/abstract.service';
import { CreatePostCommand } from './commands/create-post.command';
import { CreatePostDto } from './dtos/create-post.dto';
import { type UpdatePostDto } from './dtos/update-post.dto';
import { PostNotFoundException } from './exceptions/post-not-found.exception';
import { PostEntity } from './post.entity';

@Injectable()
export class PostService extends AbstractService<PostEntity> {
  constructor(
    @InjectRepository(PostEntity)
    private postRepository: Repository<PostEntity>,
    private commandBus: CommandBus,
  ) {
    super(postRepository);
  }

  @Transactional()
  createPost(userId: Uuid, createPostDto: CreatePostDto): Promise<PostEntity> {
    return this.commandBus.execute<CreatePostCommand, PostEntity>(
      new CreatePostCommand(userId, createPostDto),
    );
  }

  async updatePost(id: Uuid, updatePostDto: UpdatePostDto): Promise<void> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :id', { id });

    const postEntity = await queryBuilder.getOne();

    if (!postEntity) {
      throw new PostNotFoundException();
    }

    this.postRepository.merge(postEntity, updatePostDto);

    await this.postRepository.save(updatePostDto);
  }

  async deletePost(id: Uuid): Promise<void> {
    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .where('post.id = :id', { id });

    const postEntity = await queryBuilder.getOne();

    if (!postEntity) {
      throw new PostNotFoundException();
    }

    await this.postRepository.remove(postEntity);
  }
}
