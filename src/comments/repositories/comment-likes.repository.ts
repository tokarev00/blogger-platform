import {Types} from "mongoose";
import {commentLikesCollection, CommentLikeDb} from "../../db/mongo-db";
import {CommentLikeStatus} from "../domain/comment-like";

const {ObjectId} = Types;

export const CommentLikesRepository = {
    async updateLikeStatus(commentId: string, userId: string, likeStatus: CommentLikeStatus): Promise<void> {
        const existing = await commentLikesCollection.findOne({commentId, userId});

        if (likeStatus === 'None') {
            if (existing) {
                await commentLikesCollection.deleteOne({_id: existing._id});
            }
            return;
        }

        if (existing) {
            await commentLikesCollection.updateOne({_id: existing._id}, {$set: {likeStatus}});
            return;
        }

        const newReaction: CommentLikeDb = {
            _id: new ObjectId(),
            commentId,
            userId,
            likeStatus,
        };

        await commentLikesCollection.insertOne(newReaction);
    },

    async getLikesInfo(commentId: string, userId?: string): Promise<{likesCount: number; dislikesCount: number; myStatus: CommentLikeStatus}> {
        const [likesCount, dislikesCount, myLike] = await Promise.all([
            commentLikesCollection.countDocuments({commentId, likeStatus: 'Like'}),
            commentLikesCollection.countDocuments({commentId, likeStatus: 'Dislike'}),
            userId ? commentLikesCollection.findOne({commentId, userId}) : Promise.resolve(null),
        ]);

        return {
            likesCount,
            dislikesCount,
            myStatus: myLike?.likeStatus ?? 'None',
        };
    },
};

