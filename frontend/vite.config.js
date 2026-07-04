import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { cpSync, existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
export default defineConfig({
    plugins: [
        vue(),
        {
            name: 'copy-vditor-assets',
            apply: 'build',
            closeBundle: function () {
                var src = resolve('node_modules/vditor/dist');
                var dest = resolve('dist/vditor/dist');
                if (existsSync(src)) {
                    cpSync(src, dest, { recursive: true });
                }
            },
        },
        {
            name: 'serve-vditor-assets',
            apply: 'serve',
            configureServer: function (server) {
                var src = resolve('node_modules/vditor');
                server.middlewares.use('/vditor', function (req, res, next) {
                    if (!existsSync(src))
                        return next();
                    var url = new URL(req.url, 'http://localhost');
                    var filePath = join(src, url.pathname);
                    if (!existsSync(filePath))
                        return next();
                    var ext = url.pathname.split('.').pop() || '';
                    var mime = {
                        js: 'application/javascript', css: 'text/css', svg: 'image/svg+xml',
                        woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', png: 'image/png',
                    };
                    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
                    res.end(readFileSync(filePath));
                });
            },
        },
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': { target: 'http://127.0.0.1:8000', changeOrigin: true },
            '/uploads': { target: 'http://127.0.0.1:8000', changeOrigin: true },
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('vditor'))
                            return 'vditor';
                        if (id.includes('echarts') || id.includes('zrender'))
                            return 'echarts';
                        if (id.includes('element-plus') || id.includes('@element-plus'))
                            return 'element-plus';
                        if (id.includes('lucide-vue-next') || id.includes('lucide'))
                            return 'lucide';
                        return 'vendor';
                    }
                },
            },
        },
    },
});
