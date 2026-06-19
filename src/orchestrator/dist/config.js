// Parse REDIS_URL "redis://host:port" or "redis://host:port" into host+port
export const REDIS_HOST = process.env.REDIS_HOST ?? (() => {
    const url = process.env.REDIS_URL ?? 'redis://192.168.100.254:6379';
    return url.replace(/^redis:\/\//, '').split(':')[0];
})();
export const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? '6379', 10);
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD ?? 'eYVX7EwVmmxKPCDmwMtyKVge8oLd2t81';
export const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://miaplatform:changeme@192.168.100.254:5432/miaplatform';
