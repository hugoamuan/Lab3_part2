const http = require('http');
const url = require('url');
const fs = require('fs');
const { getDate } = require('./modules/utils.js');
const userMessages = require('./lang/en/en.js');

const outputFolder = "output";

// Make sure /output/ directory exists
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

const PORT = process.env.PORT || 3000; // DigitalOcean provides PORT

http.createServer((req, res) => {
    console.log("Server received a request.");

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // /getDate/ path
    if (pathname.endsWith('getDate/')) {
        const current_username = parsedUrl.query.name || "Guest";
        const currentDate = getDate();
        const message = `<p style="color: blue;">${userMessages.user_facing_string.replace('%1', current_username)} ${currentDate}</p>`;

        res.writeHead(200, {
            "Content-Type": "text/html",
            "Access-Control-Allow-Origin": "*"
        });
        res.end(message);

    // handle /writeFile/ url path
    } else if (pathname.endsWith('writeFile/')) {
        const filePath = `${outputFolder}/file.txt`; 
        const text = parsedUrl.query.text || "";
        const logLine = `${text}\n`;

        fs.appendFile(filePath, logLine, (err) => {
            if (err) {
                console.error("Error writing to file:", err);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
                return;
            }

            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end(`Appended text to file.txt: ${text}`);
        });

    // handle /readFile/ url path
    } else if (pathname.startsWith('/readFile/')) {
        const parts = pathname.split('/'); // ["", "readFile", "file.txt"]
        const fileName = parts[2];
        const filePath = `${outputFolder}/${fileName}`;

        fs.readFile(filePath, 'utf8', (error, textData) => {
            if (error) {
                console.error("Error reading file:", error);
                res.writeHead(404, { "Content-Type": "text/html" });
                res.end(`File not found: ${fileName}`);
                return;
            }

            res.writeHead(200, {
                "Content-Type": "text/html",
                "Access-Control-Allow-Origin": "*"
            });
            res.end(`<pre>${textData}</pre>`); // <pre>
        });

    // --- Unknown path ---
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 Not Found");
    }

}).listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
