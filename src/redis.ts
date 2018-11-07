import * as redis from "redis";
const instance = redis.createClient();
const PREFIX = "ccaptcha_";
const expire = 30 * 60;

export const getsid = async () => {
    return new Promise<number>((resolve, reject) => {
        instance.incr(PREFIX + "count", (err, reply) => {
            if (err) { return reject(err); }
            resolve(reply);
        });
    });
};

export const set = async (sid: number, answer: string) => {
    return new Promise<number>((resolve, reject) => {
        instance.set(PREFIX + "answer" + sid, answer, (err) => {
            if (err) { return reject(err); }
            // tslint:disable-next-line:no-shadowed-variable
            instance.expire(PREFIX + "answer" + sid, expire, (err, reply) => {
                if (err) { return reject(err); }
                resolve(reply);
            });
        });
    });
};

export const get = async (sid: number) => {
    return new Promise<string>((resolve, reject) => {
        instance.get(PREFIX + "answer" + sid, (err, reply) => {
            if (err) { return reject(err); }
            resolve(reply);
        });
    });
};

export const del = async (sid: number) => {
    return new Promise<number>((resolve, reject) => {
        instance.del(PREFIX + "answer" + sid, (err, reply) => {
            if (err) { return reject(err); }
            resolve(reply);
        });
    });
};
