"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const path_1 = require("path");
const db_1 = require("./db");
const redis_1 = require("./redis");
const app = express();
app.get("/", async (req, res) => {
    res.sendFile(path_1.join(__dirname, "..", "index.html"));
});
app.get("/new", async (req, res) => {
    const sid = await redis_1.getsid();
    const captcha = await db_1.Captcha.findOneAndUpdate({}, { $inc: { visit_count: 1 } }).sort({ visit_count: 1, success_count: 1 });
    const image = "data:image/gif;base64," + captcha.image.toString("base64");
    const name = { en: captcha.name_en, zh: captcha.name_zh };
    await redis_1.set(sid, captcha.id);
    res.send({ sid, image, name });
});
app.get("/verify", async (req, res) => {
    const id = await redis_1.get(req.query.sid);
    if (!id) {
        return res.send({ success: false });
    }
    const formula = req.query.formula;
    const captcha = await db_1.Captcha.findById(id);
    await redis_1.del(req.query.sid);
    if (formula === captcha.formula) {
        await db_1.Captcha.updateOne({ _id: id }, { $inc: { success_count: 1 } });
        return res.send({ success: true });
    }
    else {
        return res.send({ success: false });
    }
});
app.get("/*", async (req, res) => {
    res.redirect("https://github.com/ZhangZisu/ChemicalCaptcha");
});
app.listen(3549, () => {
    console.log("App started");
});
//# sourceMappingURL=http.js.map