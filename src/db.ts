import { connect, connection, Document, Model, model, Schema } from "mongoose";
import request = require("request");

connect("mongodb://localhost:27017/captcha", { useNewUrlParser: true });
connection.on("connected", () => {
    console.log("Mongoose connected");
});
connection.on("error", (err) => {
    console.log("Mongoose connection error: " + err);
});
connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
});
const gracefulShutdown = (msg: string, callback: any) => {
    connection.close(() => {
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

export interface ICaptchaModel extends Document {
    cas: string;
    name_zh?: string;
    name_en?: string;
    formula: string;
    image?: Buffer;
    ready: boolean;
    success_count: number;
    visit_count: number;
    fetchImage: () => Promise<void>;
}

export const CaptchaSchema = new Schema(
    {
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
        success_count: {
            type: Number,
            required: true,
            default: 0,
        },
        visit_count: {
            type: Number,
            required: true,
            default: 0,
        },
    },
);

CaptchaSchema.methods.fetchImage = function() {
    const self = this as ICaptchaModel;
    const url = `https://www.chemicalbook.com/CAS/GIF/${self.cas}.gif`;
    return new Promise<void>((resolve, reject) => {
        request.get(url, { encoding: null }, (err, response, buffer) => {
            if (err) { return reject(err); }
            self.image = buffer;
            resolve();
        });
    });
};

export const Captcha: Model<ICaptchaModel> = model<ICaptchaModel>("Captcha", CaptchaSchema);

Captcha.ensureIndexes({ visit_count: 1, success_count: 1 });
