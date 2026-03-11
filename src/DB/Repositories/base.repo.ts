// src/common/repositories/base.repository.ts
import { Injectable } from '@nestjs/common';
import {
  Model,
  Document,
  HydratedDocument,
  Types,
  QueryFilter,
  ProjectionType,
  QueryOptions,
  PopulateOptions,
  UpdateQuery,
  CreateOptions,
  DeleteResult,
  MongooseUpdateQueryOptions,
} from 'mongoose';

export interface FindOptions<T> extends Omit<QueryOptions<T>, 'populate'> {
  populate?:
    | string
    | PopulateOptions
    | string[]
    | PopulateOptions[]
    | undefined;
}

export interface PaginateResult<T> {
  docCount: number;
  pages: number;
  limit: number;
  currentPage: number;
  results: HydratedDocument<T>[];
}

@Injectable()
export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  // -------------------- CREATE --------------------
  // In base.repo.ts
  async create(
    data: Partial<T>,
    options?: CreateOptions,
  ): Promise<HydratedDocument<T>>;
  async create(
    data: Partial<T>[],
    options?: CreateOptions,
  ): Promise<HydratedDocument<T>[]>;
  async create(
    data: Partial<T>[] | Partial<T>,
    options?: CreateOptions,
  ): Promise<HydratedDocument<T> | HydratedDocument<T>[]> {
    if (Array.isArray(data)) {
      return this.model.create(data as any[], options);
    }
    return this.model.create(data as any, options);
  }

  // -------------------- FIND --------------------
  async findOne({
    filter,
    select,
    options,
  }: {
    filter?: QueryFilter<T>;
    select?: ProjectionType<T> | null;
    options?: FindOptions<T>;
  } = {}): Promise<HydratedDocument<T> | null> {
    const query = this.model.findOne(filter || {}).select(select || '');
    if (options?.populate) query.populate(options.populate as any);
    return query.exec();
  }

  async find({
    filter,
    select,
    options,
    limit,
    skip,
  }: {
    filter?: QueryFilter<T>;
    select?: ProjectionType<T> | null;
    options?: FindOptions<T>;
    limit?: number;
    skip?: number;
  } = {}): Promise<HydratedDocument<T>[]> {
    const query = this.model.find(filter || {}).select(select || '');
    if (options?.populate) query.populate(options.populate as any);
    if (limit) query.limit(limit);
    if (skip) query.skip(skip);
    return query.exec();
  }

  // -------------------- PAGINATION --------------------
  async paginate({
    filter = {},
    select = {},
    options = {},
    page = 1,
    size = 10,
  }: {
    filter?: QueryFilter<T>;
    select?: ProjectionType<T>;
    options?: FindOptions<T>;
    page?: number;
    size?: number;
  }): Promise<PaginateResult<T>> {
    page = Math.max(page, 1);
    const limit = Math.max(size, 1);
    const skip = (page - 1) * limit;

    const docCount = await this.model.countDocuments(filter);
    const pages = Math.ceil(docCount / limit);

    const results = await this.find({ filter, select, options, limit, skip });

    return { docCount, pages, limit, currentPage: page, results };
  }

  // -------------------- FIND BY ID --------------------
  async findById({
    id,
    select,
    options,
  }: {
    id: string | Types.ObjectId;
    select?: ProjectionType<T> | null;
    options?: FindOptions<T>;
  }): Promise<HydratedDocument<T> | null> {
    const query = this.model.findById(id).select(select || '');
    if (options?.populate) query.populate(options.populate as any);
    return query.exec();
  }

  async findByIdAndUpdate({
    id,
    update,
    options = { runValidators: true },
  }: {
    id: string | Types.ObjectId;
    update: UpdateQuery<T>;
    options?: MongooseUpdateQueryOptions<T>;
  }) {
    return this.model.findByIdAndUpdate(id, update, options);
  }

  async findByIdAndDelete({ id }: { id: string | Types.ObjectId }) {
    return this.model.findByIdAndDelete(id);
  }

  // -------------------- UPDATE --------------------
  async updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<T>;
    update: UpdateQuery<T>;
    options?: MongooseUpdateQueryOptions<T>;
  }) {
    return this.model.updateOne(
      filter,
      { ...update, $inc: { __v: 1 } },
      options,
    );
  }

  async findOneAndUpdate({
    filter,
    update,
    options = { new: true },
  }: {
    filter: QueryFilter<T>;
    update: UpdateQuery<T>;
    options?: FindOptions<T> & QueryOptions<T>;
  }) {
    const query = this.model.findOneAndUpdate(filter, update, options);
    if (options?.populate) query.populate(options.populate as any);
    return query.exec();
  }

  // -------------------- DELETE --------------------
  async deleteOne(filter: QueryFilter<T>): Promise<DeleteResult> {
    return this.model.deleteOne(filter);
  }

  async deleteMany(filter: QueryFilter<T>): Promise<DeleteResult> {
    return this.model.deleteMany(filter);
  }

  async findOneAndDelete(
    filter: QueryFilter<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findOneAndDelete(filter).exec();
  }

  async deleteById({ id }: { id: string | Types.ObjectId }) {
    return this.model.findByIdAndDelete(id);
  }
}
