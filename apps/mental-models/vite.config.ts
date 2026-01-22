import { defineConfig, loadEnv, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin, type SentryVitePluginOptions } from '@sentry/vite-plugin';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load env variables based on the current mode
  const env = loadEnv(mode, process.cwd(), '');
  
  const isProduction = mode === 'production';
  const sentryPlugin: PluginOption | false = isProduction && 
    env.VITE_SENTRY_ORG && 
    env.VITE_SENTRY_PROJECT && 
    env.VITE_SENTRY_AUTH_TOKEN
      ? sentryVitePlugin({
          org: env.VITE_SENTRY_ORG,
          project: env.VITE_SENTRY_PROJECT,
          authToken: env.VITE_SENTRY_AUTH_TOKEN,
          release: {
            name: `hummbl-io@${env.npm_package_version || '1.0.0'}`,
            setCommits: undefined,
            deploy: undefined,
            sourcemaps: {
              filesToDeleteAfterUpload: ['**/*.map'],
            },
          },
          sourcemaps: {
            include: [
              { 
                paths: ['dist'],
                urlPrefix: '~/',
                ignore: ['node_modules'],
              },
            ],
          },
        } as SentryVitePluginOptions)
      : false;

  return {
    plugins: [
      react(),
      sentryPlugin,
    ].filter(Boolean),
    build: {
      sourcemap: true, // Source map generation must be turned on for Sentry
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
