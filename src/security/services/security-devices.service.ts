import {RefreshTokensRepository} from "../../auth/repositories/refresh-tokens.repository";

type DeviceViewModel = {
    ip: string;
    title: string;
    lastActiveDate: string;
    deviceId: string;
};

export const SecurityDevicesService = {
    async getActiveDevices(userId: string): Promise<DeviceViewModel[]> {
        const tokens = await RefreshTokensRepository.findByUserId(userId);
        const now = new Date();
        return tokens
            .filter((token) => !token.isRevoked && new Date(token.expiresAt) > now)
            .map((token) => ({
                ip: token.ip,
                title: token.title,
                lastActiveDate: token.lastActiveDate,
                deviceId: token.deviceId,
            }));
    },

    async deleteOtherDevices(userId: string, currentDeviceId: string): Promise<void> {
        await RefreshTokensRepository.deleteAllExceptDevice(userId, currentDeviceId);
    },

    async deleteDevice(userId: string, deviceId: string): Promise<'success' | 'notFound' | 'forbidden'> {
        const session = await RefreshTokensRepository.findByDeviceId(deviceId);
        if (!session || session.isRevoked) {
            return 'notFound';
        }

        if (session.userId !== userId) {
            return 'forbidden';
        }

        await RefreshTokensRepository.deleteByDeviceId(deviceId);
        return 'success';
    },
};

export type {DeviceViewModel};
