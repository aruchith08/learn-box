import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

const fallbackEnv = 'C:/Users/aruch/.arh_env/node_modules';
const hasFallback = fs.existsSync(fallbackEnv);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: hasFallback
      ? [
          { find: /^@firebase\/(.*)/, replacement: 'C:/Users/aruch/.arh_env/node_modules/@firebase/$1' },
          { find: /^firebase\/(.*)/, replacement: 'C:/Users/aruch/.arh_env/node_modules/firebase/$1' },
          { find: 'firebase', replacement: 'C:/Users/aruch/.arh_env/node_modules/firebase' },
        ]
      : [],
  },
  server: {
    port: 5174, // Default to port 5174 so it can run concurrently with other dev servers if needed
    fs: {
      allow: hasFallback ? ['..', fallbackEnv] : ['..'],
    },
  },
});
