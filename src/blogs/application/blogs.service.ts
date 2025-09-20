import {Blog} from '../types/blog';
import {BlogInputDto} from '../dto/blog.input-dto';
import {BlogsRepository} from '../repositories/blogs.repository';

export const BlogsService = {
    async findAll(): Promise<Blog[]> {
        return BlogsRepository.findAll();
    },

    async findById(id: string): Promise<Blog | null> {
        return BlogsRepository.findById(id);
    },

    async create(data: BlogInputDto): Promise<Blog> {
        return BlogsRepository.create({
            name: data.name,
            description: data.description,
            websiteUrl: data.websiteUrl,
        });
    },

    async update(id: string, data: BlogInputDto): Promise<boolean> {
        const blog = await BlogsRepository.findById(id);
        if (!blog) {
            return false;
        }
        await BlogsRepository.update(id, {
            name: data.name,
            description: data.description,
            websiteUrl: data.websiteUrl,
        });
        return true;
    },

    async delete(id: string): Promise<boolean> {
        const blog = await BlogsRepository.findById(id);
        if (!blog) {
            return false;
        }
        await BlogsRepository.delete(id);
        return true;
    },
};

