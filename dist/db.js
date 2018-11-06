"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const request = require("request");
mongoose_1.connect("mongodb://localhost:27017/captcha", { useNewUrlParser: true });
mongoose_1.connection.on("connected", () => {
    console.log("Mongoose connected");
});
mongoose_1.connection.on("error", (err) => {
    console.log("Mongoose connection error: " + err);
});
mongoose_1.connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
});
const gracefulShutdown = (msg, callback) => {
    mongoose_1.connection.close(() => {
        console.log("Mongoose disconnected through " + msg);
        callback();
    });
};
process.once("SIGUSR2", () => {
    gracefulShutdown("nodemon restart", () => {
        process.kill(process.pid, "SIGUSR2");
    });
});
process.on("SIGINT", () => {
    gracefulShutdown("app termination", () => {
        process.exit(0);
    });
});
process.on("SIGTERM", () => {
    gracefulShutdown("system termination", () => {
        process.exit(0);
    });
});
exports.CaptchaSchema = new mongoose_1.Schema({
    cas: {
        type: String,
        required: true,
    },
    name_zh: String,
    name_en: String,
    formula: {
        type: String,
        required: true,
    },
    image: Buffer,
    ready: {
        type: Boolean,
        required: true,
        default: false,
    },
});
exports.CaptchaSchema.methods.fetchImage = function () {
    const self = this;
    const url = `https://www.chemicalbook.com/CAS/GIF/${self.cas}.gif`;
    return new Promise((resolve, reject) => {
        request.get(url, { encoding: null }, (err, response, buffer) => {
            if (err) {
                return reject(err);
            }
            self.image = buffer;
            resolve();
        });
    });
};
exports.Captcha = mongoose_1.model("Captcha", exports.CaptchaSchema);
//# sourceMappingURL=db.js.map