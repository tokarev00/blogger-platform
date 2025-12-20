import {ObjectId} from "mongodb";
import {postLikesCollection, PostLikeDb} from "../../db/mongo-db";
import {PostLikeStatus} from "../domain/post-like";

export const PostLikesRepository = {
    async updateLikeStatus(
        postId: string,
        userId: string,
        userLogin: string,
        likeStatus: PostLikeStatus,
    ): Promise<void> {
        const existing = await postLikesCollection.findOne({postId, userId});

        if (likeStatus === 'None') {
            if (existing) {
                await postLikesCollection.deleteOne({_id: existing._id});
            }
            return;
        }

        const now = new Date().toISOString();

        if (existing) {
            if (existing.likeStatus === likeStatus) {
                return;
            }

            const update: Partial<PostLikeDb> = {likeStatus};
            if (likeStatus === 'Like') {
                update.addedAt = now;
                update.userLogin = userLogin;
            }

            await postLikesCollection.updateOne({_id: existing._id}, {$set: update});
            return;
        }

        const newReaction: PostLikeDb = {
            _id: new ObjectId(),
            postId,
            userId,
            userLogin,
            likeStatus,
            addedAt: now,
        };

        await postLikesCollection.insertOne(newReaction);
    },

    async getLikesInfo(
        postId: string,
        userId?: string,
    ): Promise<{likesCount: number; dislikesCount: number; myStatus: PostLikeStatus}> {
        const [likesCount, dislikesCount, myLike] = await Promise.all([
            postLikesCollection.countDocuments({postId, likeStatus: 'Like'}),
            postLikesCollection.countDocuments({postId, likeStatus: 'Dislike'}),
            userId ? postLikesCollection.findOne({postId, userId}) : Promise.resolve(null),
        ]);

        return {
            likesCount,
            dislikesCount,
            myStatus: myLike?.likeStatus ?? 'None',
        };
    },

    async getNewestLikes(postId: string): Promise<Array<{addedAt: string; userId: string; login: string}>> {
        const likes = await postLikesCollection
            .find({postId, likeStatus: 'Like'})
            .sort({addedAt: -1})
            .limit(3)
            .toArray();

        return likes.map((like) => ({
            addedAt: like.addedAt,
            userId: like.userId,
            login: like.userLogin,
        }));
    },
};
