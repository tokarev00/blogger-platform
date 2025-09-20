import {Post} from '../domain/post';
import {PostInputDto} from '../dto/post.input-dto';
import {PostsRepository} from '../repositories/posts.repository';
import {BlogsRepository} from '../../blogs/repositories/blogs.repository';

export const PostsService = {
    async findAll(): Promise<Post[]> {
        return PostsRepository.findAll();
    },

    async findById(id: string): Promise<Post | null> {
        return PostsRepository.findById(id);
    },

    async create(data: PostInputDto): Promise<Post | null> {
        const blog = await BlogsRepository.findById(data.blogId);
        if (!blog) {
            return null;
        }
        return PostsRepository.create({
            title: data.title,
            shortDescription: data.shortDescription,
            content: data.content,
            blogId: data.blogId,
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

