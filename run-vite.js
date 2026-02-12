import { createServer } from 'vite';

(async () => {
    try {
        const server = await createServer({
            configFile: './vite.config.ts',
            server: {
                port: 3000,
                host: '0.0.0.0',
            },
        });
        await server.listen();
        server.printUrls();
        console.log('Servidor iniciado programaticamente!');
    } catch (e) {
        console.error('Erro ao iniciar servidor:', e);
        process.exit(1);
    }
})();
