const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const TurndownService = require('turndown');
const hljs = require('highlight.js');

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

        // Fetch the HTML content from the URL
        const response = await fetch(url);
        const html = await response.text();

        // Create a DOM environment using jsdom
        const dom = new JSDOM(html, {
            url: url,
            referrer: url,
            contentType: "text/html",
            includeNodeLocations: true,
            pretendToBeVisual: true,
        });

        // Parse the DOM using Readability
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        const markdown = turndownService.turndown(article.content);
        console.log(article.title)
        console.log(markdown)

    } catch (error) {
        console.error("Error fetching or parsing the URL:", error);
    }
}

// Example usage
// fetchAndParse("https://www.baeldung.com/elasticsearch-aggregation-query");
// fetchAndParse("https://www.cnblogs.com/mangod/p/18198186")

fetchAndParse("https://www.cnblogs.com/")
// fetchAndParse("https://news.cnblogs.com/")