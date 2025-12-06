export type CommentLikeStatus = 'Like' | 'Dislike' | 'None';

export type CommentLike = {
    commentId: string;
    userId: string;
    likeStatus: CommentLikeStatus;
};

