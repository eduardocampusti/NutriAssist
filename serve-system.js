import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // Coleta de Logs Remotos
    if (req.method === 'POST' && req.url === '/log') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const log = JSON.parse(body);
                const logEntry = `\n[${new Date().toISOString()}] [BROWSER ${log.type}] ${log.content}\n${log.stack || ''}\n`;
                fs.appendFileSync(path.join(__dirname, 'browser_logs.txt'), logEntry);
                console.log(`\n[BROWSER ${log.type}] Capturado em browser_logs.txt`);
                res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
                res.end('ok');
            } catch (e) {
                res.writeHead(400); res.end('Invalid JSON');
            }
        });
        return;
    }

    let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

    // SPA Routing: Se o arquivo não existir, servir o index.html
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Arquivo não encontrado');
            } else {
                res.writeHead(500);
                res.end(`Erro no servidor: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('\n🚀 NutriAssist (Modo de Reparo) está rodando!');
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log('---');
    console.log('Pressione Ctrl+C para encerrar o servidor.');
});
