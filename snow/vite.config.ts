import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [vue()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            // 将 JS 文件输出到 js/ 目录
            entryFileNames: 'js/[name]-[hash].js',
            chunkFileNames: 'js/[name]-[hash].js',
            assetFileNames: (assetInfo) => {
              // CSS 文件输出到 css/ 目录
              if (assetInfo.name && assetInfo.name.endsWith('.css')) {
                return 'css/[name]-[hash][extname]';
              }
              // 图片和其他资源保持原样或放到 assets/ 目录
              if (assetInfo.name && /\.(png|jpe?g|gif|svg|ico|webp|mp3|mp4|webm)$/i.test(assetInfo.name)) {
                return 'assets/[name]-[hash][extname]';
              }
              // 其他资源文件
              return 'assets/[name]-[hash][extname]';
            }
          }
        }
      }
    };
});
