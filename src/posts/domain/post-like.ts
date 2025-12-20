export type PostLikeStatus = 'Like' | 'Dislike' | 'None';

export type PostLike = {
    postId: string;
    userId: string;
    likeStatus: PostLikeStatus;
};
