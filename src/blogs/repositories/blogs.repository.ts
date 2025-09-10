import {ObjectId} from 'mongodb';
import {Blog} from '../types/blog';
import {blogsCollection, BlogDb} from '../../db/mongo-db';

const mapBlog = (blog: BlogDb): Blog => ({
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
});

export const BlogsRepository = {
    async findAll(): Promise<Blog[]> {
        const blogs = await blogsCollection.find().toArray();
        return blogs.map(mapBlog);
    },
    async findById(id: string): Promise<Blog | null> {
        const blog = await blogsCollection.findOne({_id: new ObjectId(id)});
        return blog ? mapBlog(blog) : null;
    },
    async create(blog: Omit<Blog, 'id' | 'createdAt' | 'isMembership'>): Promise<Blog> {
        const newBlog: BlogDb = {
            _id: new ObjectId(),
            name: blog.name,
            description: blog.description,
            websiteUrl: blog.websiteUrl,
            createdAt: new Date().toISOString(),
            isMembership: false,
        };
        await blogsCollection.insertOne(newBlog);
        return mapBlog(newBlog);
    },
    async update(id: string, updatedBlog: Omit<Blog, 'id' | 'createdAt' | 'isMembership'>): Promise<void> {
        const result = await blogsCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: {name: updatedBlog.name, description: updatedBlog.description, websiteUrl: updatedBlog.websiteUrl}}
        );
        if (result.matchedCount === 0) {
            throw new Error('Blog not exists');
        }
    },
    async delete(id: string): Promise<void> {
        const result = await blogsCollection.deleteOne({_id: new ObjectId(id)});
        if (result.deletedCount === 0) {
            throw new Error('Blog not exists');
        }
    },
};
