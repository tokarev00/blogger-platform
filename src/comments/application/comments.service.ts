import {buildPaginator} from "../../core/utils/paginator";
import {Paginator} from "../../core/types/pagination";
import {Comment} from "../domain/comment";
import {CommentInputDto} from "../dto/comment.input-dto";
import {CommentsQuery} from "../dto/comment.query";
import {CommentsRepository} from "../repositories/comments.repository";
import {PostsRepository} from "../../posts/repositories/posts.repository";
import {UsersRepository} from "../../users/repositories/users.repository";

export const CommentsService = {
    async findAllByPostId(postId: string, query: CommentsQuery): Promise<Paginator<Comment>> {
        const {items, totalCount} = await CommentsRepository.findAllByPostId(postId, query);
        return buildPaginator(items, totalCount, query.pageNumber, query.pageSize);
    },

    async findById(id: string): Promise<Comment | null> {
        return CommentsRepository.findById(id);
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
};

