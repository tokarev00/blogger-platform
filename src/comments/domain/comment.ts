export type CommentatorInfo = {
    userId: string;
    userLogin: string;
};

import {CommentLikeStatus} from "./comment-like";

export type Comment = {
    id: string;
    content: string;
    postId: string;
    commentatorInfo: CommentatorInfo;
    createdAt: string;
};

export type CommentLikesInfo = {
    likesCount: number;
    dislikesCount: number;
    myStatus: CommentLikeStatus;
};

export type CommentViewModel = Omit<Comment, 'postId'> & {likesInfo: CommentLikesInfo};

export function mapCommentToView(comment: Comment, likesInfo?: CommentLikesInfo): CommentViewModel {
    const {postId, ...rest} = comment;
    return {
        ...rest,
        likesInfo: likesInfo ?? {likesCount: 0, dislikesCount: 0, myStatus: 'None'},
    };
}

