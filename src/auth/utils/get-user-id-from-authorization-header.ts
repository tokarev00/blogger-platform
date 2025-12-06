import {JwtService} from "../application/jwt.service";

export function getUserIdFromAuthorizationHeader(authorizationHeader?: string): string | undefined {
    if (!authorizationHeader) {
        return undefined;
    }

    const [type, token] = authorizationHeader.split(' ');
    if (type !== 'Bearer' || !token) {
        return undefined;
    }

    const payload = JwtService.verifyAccessToken(token);
    return payload?.userId;
}

