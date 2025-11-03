import {ObjectId} from "mongodb";
import {refreshTokensCollection, RefreshTokenDb} from "../../db/mongo-db";

export type RefreshToken = {
    id: string;
    tokenId: string;
    userId: string;
    createdAt: string;
    expiresAt: string;
    isRevoked: boolean;
};

const mapRefreshToken = (token: RefreshTokenDb): RefreshToken => ({
    id: token._id.toString(),
    tokenId: token.tokenId,
    userId: token.userId,
    createdAt: token.createdAt,
    expiresAt: token.expiresAt,
    isRevoked: token.isRevoked,
});

export const RefreshTokensRepository = {
    async create(data: {userId: string; tokenId: string; expiresAt: string}): Promise<RefreshToken> {
        const token: RefreshTokenDb = {
            _id: new ObjectId(),
            userId: data.userId,
            tokenId: data.tokenId,
            createdAt: new Date().toISOString(),
            expiresAt: data.expiresAt,
            isRevoked: false,
        };

        await refreshTokensCollection.insertOne(token);
        return mapRefreshToken(token);
    },

    async findByTokenId(tokenId: string): Promise<RefreshToken | null> {
        const token = await refreshTokensCollection.findOne({tokenId});
        return token ? mapRefreshToken(token) : null;
    },

    async revoke(tokenId: string): Promise<void> {
        await refreshTokensCollection.updateOne({tokenId}, {$set: {isRevoked: true}});
    },

    async deleteAll(): Promise<void> {
        await refreshTokensCollection.deleteMany({});
    },
};

export type {RefreshToken as RefreshTokenModel};
