const { JSDOM } = require('jsdom');
const { Readability } = require('@mozilla/readability');
const TurndownService = require('turndown');
const hljs = require('highlight.js');
// const fetch = (await import('node-fetch')).default;

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

        // Output the parsed article
        // console.log("Title:", article.title);
        // console.log("Content:", article.content);

        const turndownService = new TurndownService();
        const markdown = turndownService.turndown(article.content);
        console.log(markdown)
        const codeBlocks = markdown.split('\n\n').map(block => {
            if (block.startsWith('```')) {
                const language = block.match(/```(\w+)/)[1];
                const highlightedCode = hljs.highlight(block.slice(3, -3), { language }).value;
                return `\n\`\`\`${language}\n${highlightedCode}\n\`\`\``;
            } else {
                return block;
            }
        });

        // console.log(codeBlocks.join('\n\n'));
    } catch (error) {
        console.error("Error fetching or parsing the URL:", error);
    }
}

// Example usage
fetchAndParse("https://www.baeldung.com/elasticsearch-aggregation-query");
