import {Blog} from '../domain/blog';
import {BlogInputDto} from '../dto/blog.input-dto';
import {BlogsRepository} from '../repositories/blogs.repository';
import {BlogsQuery} from '../dto/blog.query';
import {buildPaginator} from '../../core/utils/paginator';
import {Paginator} from '../../core/types/pagination';

export const BlogsService = {
    async findAll(query: BlogsQuery): Promise<Paginator<Blog>> {
        const {items, totalCount} = await BlogsRepository.findAll(query);
        return buildPaginator(items, totalCount, query.pageNumber, query.pageSize);
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

