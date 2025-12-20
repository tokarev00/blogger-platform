export type Post = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
};

export type NewestLike = {
    addedAt: string;
    userId: string;
    login: string;
};

export type ExtendedLikesInfo = {
    likesCount: number;
    dislikesCount: number;
    myStatus: 'Like' | 'Dislike' | 'None';
    newestLikes: NewestLike[];
};

export type PostViewModel = Post & {extendedLikesInfo: ExtendedLikesInfo};

export function mapPostToView(post: Post, extendedLikesInfo?: ExtendedLikesInfo): PostViewModel {
    return {
        ...post,
        extendedLikesInfo: extendedLikesInfo ?? {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
        },
    };
}
