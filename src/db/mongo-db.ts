import {MongoClient, ObjectId} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const dbName = 'blogger-platform';

export type BlogDb = {
    _id: ObjectId;
    name: string;
    description: string;
    websiteUrl: string;
    createdAt: string;
    isMembership: boolean;
};

export type PostDb = {
    _id: ObjectId;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
};

type SortSpecification = Record<string, 1 | -1>;

type CursorLike<T> = {
    sort(sort: SortSpecification): CursorLike<T>;
    skip(skip: number): CursorLike<T>;
    limit(limit: number): CursorLike<T>;
    toArray(): Promise<T[]>;
};

export type CollectionLike<T extends {_id: ObjectId}> = {
    find(filter?: any): CursorLike<T>;
    findOne(filter: any): Promise<T | null>;
    insertOne(doc: T): Promise<{acknowledged: boolean}>;
    updateOne(filter: any, update: any): Promise<{acknowledged: boolean; matchedCount: number}>;
    deleteOne(filter: any): Promise<{acknowledged: boolean; deletedCount: number}>;
    deleteMany(filter: any): Promise<{acknowledged: boolean; deletedCount: number}>;
    countDocuments(filter?: any): Promise<number>;
};

class InMemoryCursor<T extends {_id: ObjectId}> implements CursorLike<T> {
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

class InMemoryCollection<T extends {_id: ObjectId}> implements CollectionLike<T> {
    private data: T[] = [];

    find(filter: any = {}): CursorLike<T> {
        return new InMemoryCursor(this.data, filter);
    }

    async findOne(filter: any): Promise<T | null> {
        return this.data.find((doc) => matchesFilter(doc, filter)) ?? null;
    }

    async insertOne(doc: T): Promise<{acknowledged: boolean}> {
        this.data.push({...doc});
        return {acknowledged: true};
    }

    async updateOne(filter: any, update: any): Promise<{acknowledged: boolean; matchedCount: number}> {
        const item = this.data.find((doc) => matchesFilter(doc, filter));
        if (!item) {
            return {acknowledged: true, matchedCount: 0};
        }
        if (update && update.$set && typeof update.$set === 'object') {
            Object.assign(item, update.$set);
        }
        return {acknowledged: true, matchedCount: 1};
    }

    async deleteOne(filter: any): Promise<{acknowledged: boolean; deletedCount: number}> {
        const index = this.data.findIndex((doc) => matchesFilter(doc, filter));
        if (index === -1) {
            return {acknowledged: true, deletedCount: 0};
        }
        this.data.splice(index, 1);
        return {acknowledged: true, deletedCount: 1};
    }

    async deleteMany(filter: any): Promise<{acknowledged: boolean; deletedCount: number}> {
        const initialLength = this.data.length;
        const normalizedFilter = filter ?? {};
        this.data = this.data.filter((doc) => !matchesFilter(doc, normalizedFilter));
        return {acknowledged: true, deletedCount: initialLength - this.data.length};
    }

    async countDocuments(filter: any = {}): Promise<number> {
        return this.data.filter((doc) => matchesFilter(doc, filter)).length;
    }
}

function matchesFilter<T extends {_id: ObjectId}>(doc: T, filter: any): boolean {
    if (!filter || Object.keys(filter).length === 0) {
        return true;
    }
    return Object.entries(filter).every(([key, value]) => matchCondition((doc as any)[key], value));
}

function matchCondition(docValue: any, condition: any): boolean {
    if (condition && typeof condition === 'object' && '$regex' in condition) {
        const pattern = String(condition.$regex);
        const options = typeof condition.$options === 'string' ? condition.$options : '';
        const regex = new RegExp(pattern, options);
        return regex.test(String(docValue ?? ''));
    }
    if (condition instanceof ObjectId) {
        return docValue instanceof ObjectId && docValue.equals(condition);
    }
    return docValue === condition;
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
    if (value instanceof ObjectId) {
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

let client: MongoClient | null = null;
let useInMemoryStorage = false;

const mongoUrl = process.env.MONGO_URL;
if (!mongoUrl) {
    if (process.env.NODE_ENV === 'test') {
        useInMemoryStorage = true;
    } else {
        throw new Error('MONGO_URL not found');
    }
} else {
    client = new MongoClient(mongoUrl);
}

export let blogsCollection: CollectionLike<BlogDb>;
export let postsCollection: CollectionLike<PostDb>;

export async function runDb() {
    if (useInMemoryStorage) {
        blogsCollection = new InMemoryCollection<BlogDb>();
        postsCollection = new InMemoryCollection<PostDb>();
        return;
    }

    if (!client) {
        throw new Error('Mongo client not initialized');
    }

    await client.connect();
    const db = client.db(dbName);
    blogsCollection = db.collection<BlogDb>('blogs');
    postsCollection = db.collection<PostDb>('posts');
}

export async function closeDb() {
    if (useInMemoryStorage) {
        blogsCollection = new InMemoryCollection<BlogDb>();
        postsCollection = new InMemoryCollection<PostDb>();
        return;
    }

    if (client) {
        await client.close();
    }
}
