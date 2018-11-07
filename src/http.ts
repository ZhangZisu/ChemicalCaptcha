import express = require("express");
import { Captcha } from "./db";
import { del, get, getsid, set } from "./redis";

const app = express();

app.get("/new", async (req, res) => {
    const sid = await getsid();
    const captcha = await Captcha.findOneAndUpdate({}, { $inc: { visit_count: 1 } }).sort({ visit_count: 1, success_count: 1 });
    const image = "data:image/gif;base64," + captcha.image.toString("base64");
    const name = { en: captcha.name_en, zh: captcha.name_zh };
    await set(sid, captcha.id);
    res.send({ sid, image, name });
});

app.get("/verify", async (req, res) => {
    const id = await get(req.query.sid);
    if (!id) { return res.send({ success: false }); }
    const formula = req.query.formula;
    const captcha = await Captcha.findById(id);
    await del(req.query.sid);
    if (formula === captcha.formula) {
        await Captcha.updateOne({ _id: id }, { $inc: { success_count: 1 } });
        return res.send({ success: true });
    } else {
        return res.send({ success: false });
    }
});

app.get("/*", async (req, res) => {
    res.redirect("https://github.com/ZhangZisu/ChemicalCaptcha");
});

app.listen(3549, () => {
    console.log("App started");
});
