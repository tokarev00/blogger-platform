import {ObjectId} from "mongodb";
import {commentsCollection, CommentDb} from "../../db/mongo-db";
import {Comment} from "../domain/comment";
import {CommentsQuery} from "../dto/comment.query";

const mapComment = (comment: CommentDb): Comment => ({
    id: comment._id.toString(),
    content: comment.content,
    postId: comment.postId,
    commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
    },
    createdAt: comment.createdAt,
});

export const CommentsRepository = {
    async findAllByPostId(
        postId: string,
        {sortBy, sortDirection, pageNumber, pageSize}: CommentsQuery,
    ): Promise<{items: Comment[]; totalCount: number}> {
        const filter = {postId};
        const totalCount = await commentsCollection.countDocuments(filter);
        const comments = await commentsCollection
            .find(filter)
            .sort({[sortBy]: sortDirection === 'asc' ? 1 : -1})
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize)
            .toArray();

        return {
            items: comments.map(mapComment),
            totalCount,
        };
    },

    async findById(id: string): Promise<Comment | null> {
        const comment = await commentsCollection.findOne({_id: new ObjectId(id)});
        return comment ? mapComment(comment) : null;
    },

    async create(data: {
        postId: string;
        content: string;
        userId: string;
        userLogin: string;
    }): Promise<Comment> {
        const newComment: CommentDb = {
            _id: new ObjectId(),
            postId: data.postId,
            content: data.content,
            userId: data.userId,
            userLogin: data.userLogin,
            createdAt: new Date().toISOString(),
        };

        await commentsCollection.insertOne(newComment);
        return mapComment(newComment);
    },

    async updateContent(id: string, content: string): Promise<void> {
        const result = await commentsCollection.updateOne(
            {_id: new ObjectId(id)},
            {$set: {content}},
        );

        if (result.matchedCount === 0) {
            throw new Error('Comment not exists');
        }
    },

    async delete(id: string): Promise<void> {
        const result = await commentsCollection.deleteOne({_id: new ObjectId(id)});
        if (result.deletedCount === 0) {
            throw new Error('Comment not exists');
        }
    },
};

export {mapComment};

