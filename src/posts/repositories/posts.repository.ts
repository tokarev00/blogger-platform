import {Types} from 'mongoose';
import {Post} from '../domain/post';
import {postsCollection, PostDb} from '../../db/mongo-db';
import {PostsQuery} from '../dto/post.query';

const {ObjectId} = Types;

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
    async findAll({sortBy, sortDirection, pageNumber, pageSize}: PostsQuery): Promise<{items: Post[]; totalCount: number}> {
        const totalCount = await postsCollection.countDocuments();
        const posts = await postsCollection
            .find()
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return {
            items: posts.map(mapPost),
            totalCount,
        };
    },

    async findAllByBlogId(
        blogId: string,
        {sortBy, sortDirection, pageNumber, pageSize}: PostsQuery,
    ): Promise<{items: Post[]; totalCount: number}> {
        const filter = {blogId};
        const totalCount = await postsCollection.countDocuments(filter);
        const posts = await postsCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return {
            items: posts.map(mapPost),
            totalCount,
        };
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
