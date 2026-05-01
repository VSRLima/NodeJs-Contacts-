import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

const withoutTrailingSlash = (value: string) => value.replace(/\/$/, '');

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const localApiUrl = `http://127.0.0.1:${env.PORT ?? '3000'}`;
  const configuredApiUrl = env.VITE_API_BASE_URL ?? env.API_BASE_URL ?? '';
  const apiBaseUrl = configuredApiUrl || (command === 'serve' ? localApiUrl : '');
  const apiProxyTarget = env.API_PROXY_TARGET ?? apiBaseUrl ?? localApiUrl;

  return {
    root: 'src/frontend',
    plugins: [vue()],
    define: {
      __API_BASE_URL__: JSON.stringify(withoutTrailingSlash(apiBaseUrl))
    },
    build: {
      outDir: '../../public',
      emptyOutDir: true
    },
    server: {
      port: 5173,
      proxy: {
        '/api': apiProxyTarget,
        '/health': apiProxyTarget
      }
    }
  };
});
