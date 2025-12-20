import {mapPostToView, Post, PostViewModel} from '../domain/post';
import {PostInputDto} from '../dto/post.input-dto';
import {PostsRepository} from '../repositories/posts.repository';
import {BlogsRepository} from '../../blogs/repositories/blogs.repository';
import {PostForBlogInputDto} from "../dto/post-for-blog.input-dto";
import {PostsQuery} from '../dto/post.query';
import {buildPaginator} from '../../core/utils/paginator';
import {Paginator} from '../../core/types/pagination';
import {PostLikesRepository} from "../repositories/post-likes.repository";
import {PostLikeStatus} from "../domain/post-like";
import {UsersRepository} from "../../users/repositories/users.repository";

export const PostsService = {
    async findAll(query: PostsQuery, userId?: string): Promise<Paginator<PostViewModel>> {
        const {items, totalCount} = await PostsRepository.findAll(query);
        const itemsWithLikes = await Promise.all(items.map((post) => this.mapPostWithLikes(post, userId)));
        return buildPaginator(itemsWithLikes, totalCount, query.pageNumber, query.pageSize);
    },

    async findAllByBlogId(blogId: string, query: PostsQuery, userId?: string): Promise<Paginator<PostViewModel>> {
        const {items, totalCount} = await PostsRepository.findAllByBlogId(blogId, query);
        const itemsWithLikes = await Promise.all(items.map((post) => this.mapPostWithLikes(post, userId)));
        return buildPaginator(itemsWithLikes, totalCount, query.pageNumber, query.pageSize);
    },

    async findById(id: string, userId?: string): Promise<PostViewModel | null> {
        const post = await PostsRepository.findById(id);
        if (!post) {
            return null;
        }
        return this.mapPostWithLikes(post, userId);
    },

    async create(data: PostInputDto): Promise<PostViewModel | null> {
        return this.createForBlog(data.blogId, data);
    },

    async createForBlog(
        blogId: string,
        data: PostForBlogInputDto,
    ): Promise<PostViewModel | null> {
        const blog = await BlogsRepository.findById(blogId);
        if (!blog) {
            return null;
        }
        const post = await PostsRepository.create({
            title: data.title,
            shortDescription: data.shortDescription,
            content: data.content,
            blogId,
            blogName: blog.name,
        });
        return mapPostToView(post);
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

    async updateLikeStatus(
        postId: string,
        userId: string,
        likeStatus: PostLikeStatus,
    ): Promise<'notFound' | 'userNotFound' | 'success'> {
        const post = await PostsRepository.findById(postId);
        if (!post) {
            return 'notFound';
        }

        const user = await UsersRepository.findById(userId);
        if (!user) {
            return 'userNotFound';
        }

        await PostLikesRepository.updateLikeStatus(postId, userId, user.login, likeStatus);
        return 'success';
    },

    async mapPostWithLikes(post: Post, userId?: string): Promise<PostViewModel> {
        const [likesInfo, newestLikes] = await Promise.all([
            PostLikesRepository.getLikesInfo(post.id, userId),
            PostLikesRepository.getNewestLikes(post.id),
        ]);

        return mapPostToView(post, {
            ...likesInfo,
            newestLikes,
        });
    },
};
