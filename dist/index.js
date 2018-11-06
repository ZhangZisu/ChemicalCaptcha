"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const jsdom_1 = require("jsdom");
const db_1 = require("./db");
const baseUrl = "https://www.chemicalbook.com";
const startPage = "/CASDetailList_0.htm";
const headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en,zh-CN;q=0.9,zh;q=0.8",
    "Cache-Control": "max-age=0",
    "Host": "www.chemicalbook.com",
    "Referer": "https://www.chemicalbook.com/CASDetailList_0.htm",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"
};
const fetchPage = (url) => {
    console.log(`Fetching ${url}`);
    return new Promise((resolve, reject) => {
        request.get(url, { baseUrl, headers }, async (err, response, body) => {
            if (err)
                return reject(err);
            const dom = new jsdom_1.JSDOM(body);
            const tbody = dom.window.document.querySelector("#ContentPlaceHolder1_ProductClassDetail > tbody");
            const captchas = [];
            for (let i = 1; i < tbody.children.length; i++) {
                const tr = tbody.children[i];
                try {
                    const captcha = new db_1.Captcha();
                    captcha.cas = tr.children[0].textContent.trim();
                    captcha.name_zh = tr.children[1].textContent.trim();
                    captcha.name_en = tr.children[2].textContent.trim();
                    captcha.formula = tr.children[3].textContent.trim();
                    await captcha.save();
                    captchas.push(captcha);
                    console.log(`${captcha.name_zh || captcha.name_en} saved.`);
                }
                catch (e) {
                }
            }
            console.log("Downloading images");
            await Promise.all(captchas.map(async (captcha) => {
                try {
                    console.log(`Fetching ${captcha.name_zh || captcha.name_en}`);
                    await captcha.fetchImage();
                    captcha.ready = true;
                    await captcha.save();
                }
                catch (e) {
                }
            }));
            const currentNode = dom.window.document.querySelector('#form1 font[color="#ff9933"]');
            const nextNode = currentNode.nextElementSibling;
            const nextURL = nextNode ? nextNode.href : null;
            resolve(nextURL);
        });
    });
};
(async () => {
    let nextPage = startPage;
    do {
        nextPage = await fetchPage(nextPage);
    } while (nextPage != null);
    console.log("done");
})();
//# sourceMappingURL=index.js.map