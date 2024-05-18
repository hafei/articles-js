
const { JSDOM } = require('jsdom');
const {Readability} = require('@mozilla/readability');
const { isProbablyReaderable } = require('@mozilla/readability');
const TurndownService = require('turndown');
const hljs = require('highlight.js');
const cheerio = require('cheerio');

const languages = ['javascript', 'python', 'csharp', 'java', 'go', 'bash', 'shell','sql', 'xml', 'json', 'yaml', 'groovy', 'css', 'html', 'markdown', 'plaintext', 'powersehll', 'properties'];
let turndownService = new TurndownService();

const getNodePath = (node) => {
    const path = []; // 用于存储节点路径的数组

    while (node) {
        path.unshift(node.nodeName); // 将当前节点的标签名添加到路径数组的开头
        node = node.parentNode; // 获取当前节点的父节点
    }
    return path.join(' > '); // 将路径数组连接成字符串，用于表示节点的路径
};

turndownService.addRule('preWithCode', {
    filter: function (node) {
        // 判断节点是否为<code>元素
        return node.nodeName === 'CODE';
    },
    replacement: function (content, node, options) {
        const detectedLanguage = hljs.highlightAuto(content, languages).language;
        // 获取<code>元素的父节点路径
        const parentPath = getNodePath(node);
        // 判断父节点路径是否包含<pre>元素
        if (parentPath.includes('PRE')) {
            // 如果包含<pre>元素，给<code>元素加上三个反引号
            return '```' + detectedLanguage + '\n' + content + '\n```';
        } else {
            // 如果不包含<pre>元素，给<code>元素加上一个反引号
            return '`' + content + '`';
        }
    }
});


async function fetchAndParse(url) {
    try {
        // Dynamically import node-fetch
        const fetch = (await import('node-fetch')).default;

        // add user agent
        // User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36

        // Fetch the HTML content from the URL
        const response = await fetch(url);

        // const response = await fetch(url, {
        //     "headers": {
        //         "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        //         "accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        //         "cache-control": "max-age=0",
        //         "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
        //         "sec-ch-ua-mobile": "?0",
        //         "sec-ch-ua-platform": "\"Windows\"",
        //         "sec-fetch-dest": "document",
        //         "sec-fetch-mode": "navigate",
        //         "sec-fetch-site": "same-origin",
        //         "sec-fetch-user": "?1",
        //         "upgrade-insecure-requests": "1",
        //         //"cookie": "GRID=b8983f6-add565a-add6ce4-c3626e8; LF_ID=b8983f6-add565a-add6ce4-c3626e8; __tea_cache_tokens_20000743={%22web_id%22:%227369952833833294092%22%2C%22user_unique_id%22:%227369952833833294092%22%2C%22timestamp%22:1715951172767%2C%22_type_%22:%22default%22}; _r_c=1; SERVERID=3431a294a18c59fc8f5805662e2bd51e|1715951175|1715950856",
        //         "Referer": "https://www.infoq.cn/",
        //         "Referrer-Policy": "strict-origin-when-cross-origin"
        //     },
        //     "body": null,
        //     "method": "GET"
        // });

        const html = await response.text();

        // Create a DOM environment using jsdom
        const dom = new JSDOM(html, {
            url: url,
            referrer: url,
            contentType: "text/html",
            includeNodeLocations: true,
            pretendToBeVisual: true,
        });

        console.log(isProbablyReaderable(dom.window.document))

        const $ = cheerio.load(html);
        const $articleElement = $('#js_content'); // 选择文章元素
        const articleHtml = $articleElement.html();

        const articleDom = new JSDOM(articleHtml, {
            url: url,
            referrer: url,
            contentType: "text/html",
            includeNodeLocations: true,
            pretendToBeVisual: true,
        });
        const reader = new Readability(articleDom.window.document);
        const article = reader.parse();

        const markdown = turndownService.turndown(article.content);
        console.log(url)
        console.log(article.title)
        console.log(markdown)

    } catch (error) {
        console.error("Error fetching or parsing the URL:", error);
    }
}

// Example usage
// fetchAndParse("https://www.baeldung.com/elasticsearch-aggregation-query");
// fetchAndParse("https://www.cnblogs.com/mangod/p/18198186")

// fetchAndParse("https://www.cnblogs.com/")
// fetchAndParse("https://news.cnblogs.com/")
// fetchAndParse("https://www.infoq.cn/news/6i9qbIGk02IdUiAfNSqi")

// fetchAndParse("https://mp.weixin.qq.com/s/dDezDJbqRBe-8TnZRFsXLQ")
fetchAndParse("https://mp.weixin.qq.com/s/70cRoSek1n2b90KDB81XeQ")
//dom.querySelector("#img-content")

