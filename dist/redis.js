"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis = require("redis");
const instance = redis.createClient();
const PREFIX = "ccaptcha_";
const expire = 30 * 60;
exports.getsid = async () => {
    return new Promise((resolve, reject) => {
        instance.incr(PREFIX + "count", (err, reply) => {
            if (err) {
                return reject(err);
            }
            resolve(reply);
        });
    });
};
exports.set = async (sid, answer) => {
    return new Promise((resolve, reject) => {
        instance.set(PREFIX + "answer" + sid, answer, (err) => {
            if (err) {
                return reject(err);
            }
            instance.expire(PREFIX + "answer" + sid, expire, (err, reply) => {
                if (err) {
                    return reject(err);
                }
                resolve(reply);
            });
        });
    });
};
exports.get = async (sid) => {
    return new Promise((resolve, reject) => {
        instance.get(PREFIX + "answer" + sid, (err, reply) => {
            if (err) {
                return reject(err);
            }
            resolve(reply);
        });
    });
};
exports.del = async (sid) => {
    return new Promise((resolve, reject) => {
        instance.del(PREFIX + "answer" + sid, (err, reply) => {
            if (err) {
                return reject(err);
            }
            resolve(reply);
        });
    });
};
//# sourceMappingURL=redis.js.map