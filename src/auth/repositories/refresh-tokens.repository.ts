import {Types} from "mongoose";
import {refreshTokensCollection, RefreshTokenDb} from "../../db/mongo-db";

const {ObjectId} = Types;

export type RefreshToken = {
    id: string;
    tokenId: string;
    userId: string;
    deviceId: string;
    ip: string;
    title: string;
    lastActiveDate: string;
    createdAt: string;
    expiresAt: string;
    isRevoked: boolean;
};

const mapRefreshToken = (token: RefreshTokenDb): RefreshToken => ({
    id: token._id.toString(),
    tokenId: token.tokenId,
    userId: token.userId,
    deviceId: token.deviceId,
    ip: token.ip,
    title: token.title,
    lastActiveDate: token.lastActiveDate,
    createdAt: token.createdAt,
    expiresAt: token.expiresAt,
    isRevoked: token.isRevoked,
});

export const RefreshTokensRepository = {
    async create(data: {
        userId: string;
        tokenId: string;
        deviceId: string;
        ip: string;
        title: string;
        lastActiveDate: string;
        expiresAt: string;
    }): Promise<RefreshToken> {
        const token: RefreshTokenDb = {
            _id: new ObjectId(),
            userId: data.userId,
            tokenId: data.tokenId,
            deviceId: data.deviceId,
            ip: data.ip,
            title: data.title,
            lastActiveDate: data.lastActiveDate,
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

    async findByDeviceId(deviceId: string): Promise<RefreshToken | null> {
        const token = await refreshTokensCollection.findOne({deviceId});
        return token ? mapRefreshToken(token) : null;
    },

    async findByUserId(userId: string): Promise<RefreshToken[]> {
        const tokens = await refreshTokensCollection.find({userId}).toArray();
        return tokens.map(mapRefreshToken);
    },

    async updateSessionByDeviceId(
        deviceId: string,
        data: {tokenId: string; lastActiveDate: string; expiresAt: string},
    ): Promise<boolean> {
        const result = await refreshTokensCollection.updateOne(
            {deviceId},
            {
                $set: {
                    tokenId: data.tokenId,
                    lastActiveDate: data.lastActiveDate,
                    expiresAt: data.expiresAt,
                },
            },
        );
        return result.matchedCount > 0;
    },

    async deleteByDeviceId(deviceId: string): Promise<void> {
        await refreshTokensCollection.deleteOne({deviceId});
    },

    async deleteAllExceptDevice(userId: string, deviceId: string): Promise<void> {
        const tokens = await refreshTokensCollection.find({userId}).toArray();
        const tokensToDelete = tokens.filter((token) => token.deviceId !== deviceId);
        await Promise.all(tokensToDelete.map((token) => refreshTokensCollection.deleteOne({_id: token._id})));
    },

    async revoke(tokenId: string): Promise<void> {
        await refreshTokensCollection.updateOne({tokenId}, {$set: {isRevoked: true}});
    },

    async deleteAll(): Promise<void> {
        await refreshTokensCollection.deleteMany({});
    },
};

export type {RefreshToken as RefreshTokenModel};
