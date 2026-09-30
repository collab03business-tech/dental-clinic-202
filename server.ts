import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = __dirname;

const app = express();
const PORT = Number(process.env.DEFAULT_APP_PORT || 3000);

app.use(express.json());

// API health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    clinic: process.env.CLINIC_NAME || 'Lumora Dental',
    eventTypeId: Number(process.env.CAL_EVENT_TYPE_ID) || 0,
  });
});

// Protect private prefixes from direct access
const PRIVATE_PREFIXES = [
  '/.git',
  '/.env',
  '/data',
  '/node_modules',
  '/src',
  '/.aistudio'
];

app.use((req, res, next) => {
  const p = req.path.toLowerCase();
  if (PRIVATE_PREFIXES.some((pre) => p === pre || p.startsWith(`${pre}/`))) {
    return res.status(404).end();
  }
  next();
});

// Serve static assets from root directory
app.use(
  express.static(root, {
    extensions: ['html'],
    index: 'index.html',
    setHeaders(res, filePath) {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

// Fallback for 404
app.use((_req, res) => {
  const notFoundPath = path.join(root, '404.html');
  if (fs.existsSync(notFoundPath)) {
    res.status(404).sendFile(notFoundPath);
  } else {
    res.status(404).send('Page not found');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lumora Dental server running on http://0.0.0.0:${PORT}`);
});
