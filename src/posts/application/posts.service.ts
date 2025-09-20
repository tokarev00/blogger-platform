import {Post} from '../domain/post';
import {PostInputDto} from '../dto/post.input-dto';
import {PostsRepository} from '../repositories/posts.repository';
import {BlogsRepository} from '../../blogs/repositories/blogs.repository';
import {PostForBlogInputDto} from "../dto/post-for-blog.input-dto";
import {PostsQuery} from '../dto/post.query';
import {buildPaginator} from '../../core/utils/paginator';
import {Paginator} from '../../core/types/pagination';

export const PostsService = {
    async findAll(query: PostsQuery): Promise<Paginator<Post>> {
        const {items, totalCount} = await PostsRepository.findAll(query);
        return buildPaginator(items, totalCount, query.pageNumber, query.pageSize);
    },

    async findAllByBlogId(blogId: string, query: PostsQuery): Promise<Paginator<Post>> {
        const {items, totalCount} = await PostsRepository.findAllByBlogId(blogId, query);
        return buildPaginator(items, totalCount, query.pageNumber, query.pageSize);
    },

    async findById(id: string): Promise<Post | null> {
        return PostsRepository.findById(id);
    },

    async create(data: PostInputDto): Promise<Post | null> {
        return this.createForBlog(data.blogId, data);
    },

    async createForBlog(
        blogId: string,
        data: PostForBlogInputDto,
    ): Promise<Post | null> {
        const blog = await BlogsRepository.findById(blogId);
        if (!blog) {
            return null;
        }
        return PostsRepository.create({
            title: data.title,
            shortDescription: data.shortDescription,
            content: data.content,
            blogId,
            blogName: blog.name,
        });
    },

    async update(
        id: string,
        data: PostInputDto,
    ): Promise<'postNotFound' | 'blogNotFound' | 'success'> {
        const post = await PostsRepository.findById(id);
        if (!post) {
            return 'postNotFound';
        }
        const blog = await BlogsRepository.findById(data.blogId);
        if (!blog) {
            return 'blogNotFound';
        }
        await PostsRepository.update(id, {
            title: data.title,
            shortDescription: data.shortDescription,
            content: data.content,
            blogId: data.blogId,
            blogName: blog.name,
        });
        return 'success';
    },

    async delete(id: string): Promise<boolean> {
        const post = await PostsRepository.findById(id);
        if (!post) {
            return false;
        }
        await PostsRepository.delete(id);
        return true;
    },
};

