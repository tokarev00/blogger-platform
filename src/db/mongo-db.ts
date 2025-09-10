import {MongoClient, Collection, ObjectId} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUrl = process.env.MONGO_URL || '';
if (!mongoUrl) {
    throw new Error('MONGO_URL not found');
}

const client = new MongoClient(mongoUrl);
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

export let blogsCollection: Collection<BlogDb>;
export let postsCollection: Collection<PostDb>;

export async function runDb() {
    await client.connect();
    const db = client.db(dbName);
    blogsCollection = db.collection<BlogDb>('blogs');
    postsCollection = db.collection<PostDb>('posts');
}

export async function closeDb() {
    await client.close();
}
