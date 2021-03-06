import { JSDOM } from "jsdom";
import request = require("request");
import { Captcha } from "./db";

const baseUrl = "https://www.chemicalbook.com";
const startPage = "/CASDetailList_0.htm";
const headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en,zh-CN;q=0.9,zh;q=0.8",
    "Cache-Control": "max-age=0",
    "Host": "www.chemicalbook.com",
    "Referer": "https://www.chemicalbook.com/CASDetailList_0.htm",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36",
};

const fetchPage = (url: string) => {
    console.log(`Fetching ${url}`);
    return new Promise<string>((resolve, reject) => {
        request.get(url, { baseUrl, headers }, async (err, response, body) => {
            if (err) { return reject(err); }
            const dom = new JSDOM(body);

            const tbody = dom.window.document.querySelector("#ContentPlaceHolder1_ProductClassDetail > tbody");
            const captchas = [];
            for (let i = 1; i < tbody.children.length; i++) {
                const tr = tbody.children[i];
                try {
                    const captcha = new Captcha();
                    captcha.cas = tr.children[0].textContent.trim();
                    captcha.name_zh = tr.children[1].textContent.trim();
                    captcha.name_en = tr.children[2].textContent.trim();
                    captcha.formula = tr.children[3].textContent.trim();
                    await captcha.save();
                    captchas.push(captcha);
                    console.log(`${captcha.name_zh || captcha.name_en} saved.`);
                } catch (e) {
                    // Eat any error
                }
            }
            console.log("Downloading images");
            await Promise.all(captchas.map(async (captcha) => {
                try {
                    console.log(`Fetching ${captcha.name_zh || captcha.name_en}`);
                    await captcha.fetchImage();
                    captcha.ready = true;
                    await captcha.save();
                } catch (e) {
                    // Eat any error
                }
            }));

            const currentNode = dom.window.document.querySelector('#form1 font[color="#ff9933"]');
            const nextNode = currentNode.nextElementSibling;
            const nextURL = nextNode ? (nextNode as any).href : null;
            resolve(nextURL);
        });
    });
};

export const fetchData = async () => {
    let nextPage = startPage;
    do {
        nextPage = await fetchPage(nextPage);
    } while (nextPage != null);
    console.log("done");
};

export const fixData = async () => {
    const badCaptchas = await Captcha.find({ ready: false });
    await Promise.all(badCaptchas.map(async (captcha) => {
        try {
            console.log(`Fixing ${captcha.name_zh || captcha.name_en}`);
            await captcha.fetchImage();
            captcha.ready = true;
            await captcha.save();
            console.log(`Fixing ${captcha.name_zh || captcha.name_en} done`);
        } catch (e) {
            // Eat any error
        }
    }));
};

export const startServer = () => {
    require("./http");
};
