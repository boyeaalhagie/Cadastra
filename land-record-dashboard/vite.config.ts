import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { Plugin } from 'vite'

// Tiny in-memory relay — phone POSTs photo here, desktop polls for it
function photoRelayPlugin(): Plugin {
  let pendingPhoto: string | null = null;

  return {
    name: 'photo-relay',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }

        if (req.url === '/api/photo/upload' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (c: Buffer) => chunks.push(c));
          req.on('end', () => {
            try {
              const { photo } = JSON.parse(Buffer.concat(chunks).toString());
              pendingPhoto = photo;
              res.statusCode = 200;
              res.end('ok');
            } catch { res.statusCode = 400; res.end('bad request'); }
          });
          return;
        }

        if (req.url === '/api/photo/poll' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          const photo = pendingPhoto;
          pendingPhoto = null; // consume once
          res.end(JSON.stringify({ photo }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), photoRelayPlugin()],
  server: {
    host: true,
  },
})
