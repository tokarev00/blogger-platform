import {buildPaginator} from "../../core/utils/paginator";
import {Paginator} from "../../core/types/pagination";
import {Comment, CommentViewModel, mapCommentToView} from "../domain/comment";
import {CommentInputDto} from "../dto/comment.input-dto";
import {CommentsQuery} from "../dto/comment.query";
import {CommentsRepository} from "../repositories/comments.repository";
import {PostsRepository} from "../../posts/repositories/posts.repository";
import {UsersRepository} from "../../users/repositories/users.repository";
import {CommentLikesRepository} from "../repositories/comment-likes.repository";
import {CommentLikeStatus} from "../domain/comment-like";

export const CommentsService = {
    async findAllByPostId(
        postId: string,
        query: CommentsQuery,
        userId?: string,
    ): Promise<Paginator<CommentViewModel>> {
        const {items, totalCount} = await CommentsRepository.findAllByPostId(postId, query);
        const itemsWithLikes = await Promise.all(items.map((comment) => this.mapCommentWithLikes(comment, userId)));

        return buildPaginator(itemsWithLikes, totalCount, query.pageNumber, query.pageSize);
    },

    async findById(id: string): Promise<Comment | null> {
        return CommentsRepository.findById(id);
    },

    async findViewById(id: string, userId?: string): Promise<CommentViewModel | null> {
        const comment = await CommentsRepository.findById(id);
        if (!comment) {
            return null;
        }

        return this.mapCommentWithLikes(comment, userId);
    },

    async createForPost(postId: string, userId: string, content: string): Promise<'postNotFound' | 'userNotFound' | Comment> {
        const post = await PostsRepository.findById(postId);
        if (!post) {
            return 'postNotFound';
        }

        const user = await UsersRepository.findById(userId);
        if (!user) {
            return 'userNotFound';
        }

        return CommentsRepository.create({
            postId,
            content,
            userId: user.id,
            userLogin: user.login,
        });
    },

    async update(
        commentId: string,
        userId: string,
        data: CommentInputDto,
    ): Promise<'notFound' | 'forbidden' | 'success'> {
        const comment = await CommentsRepository.findById(commentId);
        if (!comment) {
            return 'notFound';
        }

        if (comment.commentatorInfo.userId !== userId) {
            return 'forbidden';
        }

        await CommentsRepository.updateContent(commentId, data.content);
        return 'success';
    },

    async delete(commentId: string, userId: string): Promise<'notFound' | 'forbidden' | 'success'> {
        const comment = await CommentsRepository.findById(commentId);
        if (!comment) {
            return 'notFound';
        }

        if (comment.commentatorInfo.userId !== userId) {
            return 'forbidden';
        }

        await CommentsRepository.delete(commentId);
        return 'success';
    },

    async updateLikeStatus(
        commentId: string,
        userId: string,
        likeStatus: CommentLikeStatus,
    ): Promise<'notFound' | 'success'> {
        const comment = await CommentsRepository.findById(commentId);
        if (!comment) {
            return 'notFound';
        }

        await CommentLikesRepository.updateLikeStatus(commentId, userId, likeStatus);
        return 'success';
    },

    async mapCommentWithLikes(comment: Comment, userId?: string): Promise<CommentViewModel> {
        const likesInfo = await CommentLikesRepository.getLikesInfo(comment.id, userId);
        return mapCommentToView(comment, likesInfo);
    },
};

