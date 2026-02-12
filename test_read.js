import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Tente encontrar um arquivo .map no node_modules para testar
function findMapFile(dir) {
    if (!fs.existsSync(dir)) return null;
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            // Ignorar symlinks se possível ou tratar erros
            try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    // Evitar recursão infinita ou muito profunda se necessário
                    if (fullPath.includes('.bin')) continue;

                    const found = findMapFile(fullPath);
                    if (found) return found;
                } else if (file.endsWith('.map')) {
                    return fullPath;
                }
            } catch (e) {
                // Ignore access errors during search
            }
        }
    } catch (e) {
        // Ignore acess errors
    }
    return null;
}

try {
    console.log('Procurando arquivo .map em node_modules...');
    const mapFile = findMapFile('node_modules');

    if (mapFile) {
        console.log(`Tentando ler arquivo: ${mapFile}`);
        const content = fs.readFileSync(mapFile, 'utf8');
        console.log('Leitura bem sucedida! Tamanho: ' + content.length);
    } else {
        console.log('Nenhum arquivo .map encontrado para teste ou erro ao listar diretórios.');
    }
} catch (err) {
    console.error('Erro ao ler arquivo:', err.message);
}
