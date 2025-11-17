import 'express';

declare module 'express-serve-static-core' {
    interface Request {
        currentUserId?: string;
        currentDeviceId?: string;
        currentSessionTokenId?: string;
    }
}
