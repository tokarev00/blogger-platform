import {ObjectId} from 'mongodb';
import {Blog} from '../domain/blog';
import {blogsCollection, BlogDb} from '../../db/mongo-db';
import {BlogsQuery} from '../dto/blog.query';

const mapBlog = (blog: BlogDb): Blog => ({
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
});

export const BlogsRepository = {
    async findAll({
        searchNameTerm,
        sortBy,
        sortDirection,
        pageNumber,
        pageSize,
    }: BlogsQuery): Promise<{items: Blog[]; totalCount: number}> {
        const filter = searchNameTerm
            ? {name: {$regex: searchNameTerm, $options: 'i'}}
            : {};

        const totalCount = await blogsCollection.countDocuments(filter);
        const blogs = await blogsCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return {
            items: blogs.map(mapBlog),
            totalCount,
        };
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
