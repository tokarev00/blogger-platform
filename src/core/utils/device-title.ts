const DEFAULT_DEVICE_TITLE = 'Unknown device';

export function buildDeviceTitle(userAgent?: string | null): string {
    if (!userAgent) {
        return DEFAULT_DEVICE_TITLE;
    }

    const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident)\/([\d.]+)/i);
    if (browserMatch) {
        const browserName = browserMatch[1].replace('Trident', 'IE');
        const browserVersion = browserMatch[2];
        return `${browserName} ${browserVersion}`;
    }

    const versionMatch = userAgent.match(/Version\/([\d.]+)/i);
    if (versionMatch) {
        return `Browser ${versionMatch[1]}`;
    }

    const sanitized = userAgent.split(' ').slice(0, 3).join(' ').trim();
    return sanitized || DEFAULT_DEVICE_TITLE;
}
