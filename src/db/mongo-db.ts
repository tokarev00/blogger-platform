import mongoose, {Schema, Types} from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const {ObjectId} = Types;

const dbName = 'blogger-platform';

export type BlogDb = {
    _id: Types.ObjectId;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
    isMembership: boolean;
};

export type PostDb = {
    _id: Types.ObjectId;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
};

export type UserDb = {
    _id: Types.ObjectId;
    login: string;
    email: string;
    passwordHash: string;
    createdAt: string;
    emailConfirmation: {
        isConfirmed: boolean;
        confirmationCode: string | null;
        expirationDate: string | null;
    };
    passwordRecovery: {
        recoveryCode: string | null;
        expirationDate: string | null;
    };
};

export type CommentDb = {
    _id: Types.ObjectId;
    postId: string;
    content: string;
    userId: string;
    userLogin: string;
    createdAt: string;
};

export type CommentLikeDb = {
    _id: Types.ObjectId;
    commentId: string;
    userId: string;
    likeStatus: 'Like' | 'Dislike';
};

export type RefreshTokenDb = {
    _id: Types.ObjectId;
    tokenId: string;
    userId: string;
    deviceId: string;
    ip: string;
    title: string;
    lastActiveDate: string;
    createdAt: string;
    expiresAt: string;
    isRevoked: boolean;
};

type SortSpecification = Record<string, 1 | -1>;

type CursorLike<T> = {
    sort(sort: SortSpecification): CursorLike<T>;
    skip(skip: number): CursorLike<T>;
    limit(limit: number): CursorLike<T>;
    toArray(): Promise<T[]>;
};

export type CollectionLike<T extends {_id: Types.ObjectId}> = {
    find(filter?: any): CursorLike<T>;
    findOne(filter: any): Promise<T | null>;
    insertOne(doc: T): Promise<{acknowledged: boolean}>;
    updateOne(filter: any, update: any): Promise<{acknowledged: boolean; matchedCount: number}>;
    deleteOne(filter: any): Promise<{acknowledged: boolean; deletedCount: number}>;
    deleteMany(filter: any): Promise<{acknowledged: boolean; deletedCount: number}>;
    countDocuments(filter?: any): Promise<number>;
};

class InMemoryCursor<T extends {_id: Types.ObjectId}> implements CursorLike<T> {
    private sortParams: Array<[string, 1 | -1]> = [];
    private skipValue = 0;
    private limitValue: number | undefined;

    constructor(private readonly data: T[], private readonly filter: any) {}

    sort(sort: SortSpecification): CursorLike<T> {
        this.sortParams = Object.entries(sort) as Array<[string, 1 | -1]>;
        return this;
    }

    skip(skip: number): CursorLike<T> {
        this.skipValue = skip;
        return this;
    }

    limit(limit: number): CursorLike<T> {
        this.limitValue = limit;
        return this;
    }

    async toArray(): Promise<T[]> {
        let result = this.data.filter((doc) => matchesFilter(doc, this.filter));
        if (this.sortParams.length > 0) {
            result = [...result].sort((a, b) => compareDocuments(a, b, this.sortParams));
        } else {
            result = [...result];
        }
        if (this.skipValue > 0) {
            result = result.slice(this.skipValue);
        }
        if (this.limitValue !== undefined) {
            result = result.slice(0, this.limitValue);
        }
        return result;
    }
}

class InMemoryCollection<T extends {_id: Types.ObjectId}> implements CollectionLike<T> {
    private data: T[] = [];

    find(filter: any = {}): CursorLike<T> {
        return new InMemoryCursor(this.data, filter);
    }

    async findOne(filter: any): Promise<T | null> {
        const doc = this.data.find((doc) => matchesFilter(doc, filter));
        return doc ?? null;
    }

    async insertOne(doc: T): Promise<{acknowledged: boolean}> {
        this.data.push(doc);
        return {acknowledged: true};
    }

    async updateOne(filter: any, update: any): Promise<{acknowledged: boolean; matchedCount: number}> {
        const doc = this.data.find((doc) => matchesFilter(doc, filter));
        if (!doc) {
            return {acknowledged: true, matchedCount: 0};
        }
        if (update.$set) {
            Object.assign(doc as object, update.$set);
        }
        return {acknowledged: true, matchedCount: 1};
    }

    async deleteOne(filter: any): Promise<{acknowledged: boolean; deletedCount: number}> {
        const initialLength = this.data.length;
        this.data = this.data.filter((doc) => !matchesFilter(doc, filter));
        return {acknowledged: true, deletedCount: initialLength - this.data.length};
    }

    async deleteMany(filter: any): Promise<{acknowledged: boolean; deletedCount: number}> {
        const initialLength = this.data.length;
        this.data = this.data.filter((doc) => !matchesFilter(doc, filter));
        return {acknowledged: true, deletedCount: initialLength - this.data.length};
    }

    async countDocuments(filter: any = {}): Promise<number> {
        return this.data.filter((doc) => matchesFilter(doc, filter)).length;
    }
}

class MongooseCursor<T extends {_id: Types.ObjectId}> implements CursorLike<T> {
    constructor(private query: mongoose.Query<T[], any>) {}

    sort(sort: SortSpecification): CursorLike<T> {
        this.query = this.query.sort(sort);
        return this;
    }

    skip(skip: number): CursorLike<T> {
        this.query = this.query.skip(skip);
        return this;
    }

    limit(limit: number): CursorLike<T> {
        this.query = this.query.limit(limit);
        return this;
    }

    async toArray(): Promise<T[]> {
        return this.query.lean<T>().exec();
    }
}

class MongooseCollection<T extends {_id: Types.ObjectId}> implements CollectionLike<T> {
    constructor(private readonly model: mongoose.Model<T>) {}

    find(filter: any = {}): CursorLike<T> {
        return new MongooseCursor(this.model.find(filter));
    }

    async findOne(filter: any): Promise<T | null> {
        return this.model.findOne(filter).lean<T>().exec();
    }

    async insertOne(doc: T): Promise<{acknowledged: boolean}> {
        await this.model.create(doc);
        return {acknowledged: true};
    }

    async updateOne(filter: any, update: any): Promise<{acknowledged: boolean; matchedCount: number}> {
        const result = await this.model.updateOne(filter, update);
        return {acknowledged: result.acknowledged, matchedCount: result.matchedCount};
    }

    async deleteOne(filter: any): Promise<{acknowledged: boolean; deletedCount: number}> {
        const result = await this.model.deleteOne(filter);
        return {acknowledged: result.acknowledged, deletedCount: result.deletedCount};
    }

    async deleteMany(filter: any): Promise<{acknowledged: boolean; deletedCount: number}> {
        const result = await this.model.deleteMany(filter);
        return {acknowledged: result.acknowledged, deletedCount: result.deletedCount};
    }

    async countDocuments(filter: any = {}): Promise<number> {
        return this.model.countDocuments(filter);
    }
}

function matchesFilter<T>(doc: T, filter: any): boolean {
    return Object.entries(filter).every(([key, value]) => {
        const docValue = getValueByPath(doc, key);
        return matchCondition(docValue, value);
    });
}

function matchCondition(docValue: any, condition: any): boolean {
    if (condition && typeof condition === 'object' && '$regex' in condition) {
        const pattern = String(condition.$regex);
        const options = typeof condition.$options === 'string' ? condition.$options : '';
        const regex = new RegExp(pattern, options);
        return regex.test(String(docValue ?? ''));
    }
    if (condition instanceof Types.ObjectId) {
        return docValue instanceof Types.ObjectId && docValue.equals(condition);
    }
    if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
        return matchesFilter(docValue ?? {}, condition);
    }
    return docValue === condition;
}

function getValueByPath<T>(doc: T, path: string): any {
    if (!path.includes('.')) {
        return (doc as any)[path];
    }

    return path.split('.').reduce((acc: any, key: string) => {
        if (acc === null || acc === undefined) {
            return undefined;
        }
        return acc[key];
    }, doc as any);
}

function compareDocuments<T>(a: T, b: T, sortParams: Array<[string, 1 | -1]>): number {
    for (const [field, direction] of sortParams) {
        const aValue = normalizeValue((a as any)[field]);
        const bValue = normalizeValue((b as any)[field]);
        if (aValue === bValue) {
            continue;
        }
        if (aValue < bValue) {
            return direction === 1 ? -1 : 1;
        }
        return direction === 1 ? 1 : -1;
    }
    return 0;
}

function normalizeValue(value: unknown): string {
    if (value instanceof Types.ObjectId) {
        return value.toString();
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (value === null || value === undefined) {
        return '';
    }
    return String(value);
}

const mongoUrl = process.env.MONGO_URL;
let useInMemoryStorage = false;

if (!mongoUrl) {
    if (process.env.NODE_ENV === 'test') {
        useInMemoryStorage = true;
    } else {
        throw new Error('MONGO_URL not found');
    }
} else {
    mongoose.set('strictQuery', true);
}

const blogSchema = new Schema<BlogDb>(
    {
        _id: {type: Schema.Types.ObjectId, default: () => new ObjectId()},
        name: {type: String, required: true},
        description: {type: String, required: true},
        websiteUrl: {type: String, required: true},
        createdAt: {type: String, required: true},
        isMembership: {type: Boolean, required: true},
    },
    {versionKey: false}
);

const postSchema = new Schema<PostDb>(
    {
        _id: {type: Schema.Types.ObjectId, default: () => new ObjectId()},
        title: {type: String, required: true},
        shortDescription: {type: String, required: true},
        content: {type: String, required: true},
        blogId: {type: String, required: true},
        blogName: {type: String, required: true},
        createdAt: {type: String, required: true},
    },
    {versionKey: false}
);

const userSchema = new Schema<UserDb>(
    {
        _id: {type: Schema.Types.ObjectId, default: () => new ObjectId()},
        login: {type: String, required: true},
        email: {type: String, required: true},
        passwordHash: {type: String, required: true},
        createdAt: {type: String, required: true},
        emailConfirmation: {
            isConfirmed: {type: Boolean, required: true},
            confirmationCode: {type: String, default: null},
            expirationDate: {type: String, default: null},
        },
        passwordRecovery: {
            recoveryCode: {type: String, default: null},
            expirationDate: {type: String, default: null},
        },
    },
    {versionKey: false}
);

const commentSchema = new Schema<CommentDb>(
    {
        _id: {type: Schema.Types.ObjectId, default: () => new ObjectId()},
        postId: {type: String, required: true},
        content: {type: String, required: true},
        userId: {type: String, required: true},
        userLogin: {type: String, required: true},
        createdAt: {type: String, required: true},
    },
    {versionKey: false}
);

const commentLikeSchema = new Schema<CommentLikeDb>(
    {
        _id: {type: Schema.Types.ObjectId, default: () => new ObjectId()},
        commentId: {type: String, required: true},
        userId: {type: String, required: true},
        likeStatus: {type: String, enum: ['Like', 'Dislike'], required: true},
    },
    {versionKey: false}
);

const refreshTokenSchema = new Schema<RefreshTokenDb>(
    {
        _id: {type: Schema.Types.ObjectId, default: () => new ObjectId()},
        tokenId: {type: String, required: true},
        userId: {type: String, required: true},
        deviceId: {type: String, required: true},
        ip: {type: String, required: true},
        title: {type: String, required: true},
        lastActiveDate: {type: String, required: true},
        createdAt: {type: String, required: true},
        expiresAt: {type: String, required: true},
        isRevoked: {type: Boolean, required: true},
    },
    {versionKey: false}
);

const BlogModel = mongoose.model<BlogDb>('Blog', blogSchema, 'blogs');
const PostModel = mongoose.model<PostDb>('Post', postSchema, 'posts');
const UserModel = mongoose.model<UserDb>('User', userSchema, 'users');
const CommentModel = mongoose.model<CommentDb>('Comment', commentSchema, 'comments');
const CommentLikeModel = mongoose.model<CommentLikeDb>('CommentLike', commentLikeSchema, 'commentLikes');
const RefreshTokenModel = mongoose.model<RefreshTokenDb>('RefreshToken', refreshTokenSchema, 'refreshTokens');

export let blogsCollection: CollectionLike<BlogDb>;
export let postsCollection: CollectionLike<PostDb>;
export let usersCollection: CollectionLike<UserDb>;
export let commentsCollection: CollectionLike<CommentDb>;
export let commentLikesCollection: CollectionLike<CommentLikeDb>;
export let refreshTokensCollection: CollectionLike<RefreshTokenDb>;

export async function runDb() {
    if (useInMemoryStorage) {
        blogsCollection = new InMemoryCollection<BlogDb>();
        postsCollection = new InMemoryCollection<PostDb>();
        usersCollection = new InMemoryCollection<UserDb>();
        commentsCollection = new InMemoryCollection<CommentDb>();
        commentLikesCollection = new InMemoryCollection<CommentLikeDb>();
        refreshTokensCollection = new InMemoryCollection<RefreshTokenDb>();
        return;
    }

    if (!mongoUrl) {
        throw new Error('Mongo URL is not defined');
    }

    await mongoose.connect(mongoUrl, {dbName});
    blogsCollection = new MongooseCollection(BlogModel);
    postsCollection = new MongooseCollection(PostModel);
    usersCollection = new MongooseCollection(UserModel);
    commentsCollection = new MongooseCollection(CommentModel);
    commentLikesCollection = new MongooseCollection(CommentLikeModel);
    refreshTokensCollection = new MongooseCollection(RefreshTokenModel);
}

export async function closeDb() {
    if (useInMemoryStorage) {
        blogsCollection = new InMemoryCollection<BlogDb>();
        postsCollection = new InMemoryCollection<PostDb>();
        usersCollection = new InMemoryCollection<UserDb>();
        commentsCollection = new InMemoryCollection<CommentDb>();
        commentLikesCollection = new InMemoryCollection<CommentLikeDb>();
        refreshTokensCollection = new InMemoryCollection<RefreshTokenDb>();
        return;
    }

    await mongoose.connection.close();
}
