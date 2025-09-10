import {ObjectId} from 'mongodb';
import {Post} from '../types/post';
import {postsCollection, PostDb} from '../../db/mongo-db';

const mapPost = (post: PostDb): Post => ({
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
});

export const PostsRepository = {
    async findAll(): Promise<Post[]> {
        const posts = await postsCollection.find().toArray();
        return posts.map(mapPost);
    },
    async findById(id: string): Promise<Post | null> {
        const post = await postsCollection.findOne({_id: new ObjectId(id)});
        return post ? mapPost(post) : null;
    },
    async create(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
        const newPost: PostDb = {
            _id: new ObjectId(),
            title: post.title,
            shortDescription: post.shortDescription,
            content: post.content,
            blogId: post.blogId,
            blogName: post.blogName,
            createdAt: new Date().toISOString(),
        };
        await postsCollection.insertOne(newPost);
        return mapPost(newPost);
    },
    async update(id: string, updatedPost: Omit<Post, 'id' | 'createdAt'>): Promise<void> {
        const result = await postsCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: {
                title: updatedPost.title,
                shortDescription: updatedPost.shortDescription,
                content: updatedPost.content,
                blogId: updatedPost.blogId,
                blogName: updatedPost.blogName,
            }}
        );
        if (result.matchedCount === 0) {
            throw new Error('Post not exists');
        }
    },
    async delete(id: string): Promise<void> {
        const result = await postsCollection.deleteOne({_id: new ObjectId(id)});
        if (result.deletedCount === 0) {
            throw new Error('Post not exists');
        }
    },
};
