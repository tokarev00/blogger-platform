export type CommentatorInfo = {
    userId: string;
    userLogin: string;
};

export type Comment = {
    id: string;
    content: string;
    postId: string;
    commentatorInfo: CommentatorInfo;
    createdAt: string;
};

export type CommentViewModel = Omit<Comment, 'postId'>;

export function mapCommentToView(comment: Comment): CommentViewModel {
    const {postId, ...rest} = comment;
    return rest;
}

