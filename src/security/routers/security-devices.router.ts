import {Router, Response} from "express";
import {HttpStatus} from "../../core/types/http-statuses";
import {refreshTokenGuardMiddleware} from "../../auth/middlewares/refresh-token.guard-middleware";
import {SecurityDevicesService} from "../services/security-devices.service";
import {RequestWithSession} from "../../types/request-with-session";

export const securityDevicesRouter = Router();

securityDevicesRouter.get('/', refreshTokenGuardMiddleware, async (req: RequestWithSession, res: Response) => {
    const currentUserId = req.currentUserId;
    if (!currentUserId) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    const devices = await SecurityDevicesService.getActiveDevices(currentUserId);
    return res.status(HttpStatus.Ok).send(devices);
});

securityDevicesRouter.delete('/', refreshTokenGuardMiddleware, async (req: RequestWithSession, res: Response) => {
    const currentUserId = req.currentUserId;
    const currentDeviceId = req.currentDeviceId;
    if (!currentUserId || !currentDeviceId) {
        return res.sendStatus(HttpStatus.Unauthorized);
    }

    await SecurityDevicesService.deleteOtherDevices(currentUserId, currentDeviceId);
    return res.sendStatus(HttpStatus.NoContent);
});

securityDevicesRouter.delete(
    '/:deviceId',
    refreshTokenGuardMiddleware,
    async (req: RequestWithSession<{deviceId: string}>, res: Response) => {
        const currentUserId = req.currentUserId;
        if (!currentUserId) {
            return res.sendStatus(HttpStatus.Unauthorized);
        }

        const targetDeviceId = req.params.deviceId;
        const result = await SecurityDevicesService.deleteDevice(currentUserId, targetDeviceId);
        if (result === 'notFound') {
            return res.sendStatus(HttpStatus.NotFound);
        }
        if (result === 'forbidden') {
            return res.sendStatus(HttpStatus.Forbidden);
        }

        return res.sendStatus(HttpStatus.NoContent);
    },
);
