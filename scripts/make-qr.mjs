// Generates the permanent QR code (SVG for the page, PNG for printing).
// Run: npm run qr   — then: npm run verify-qr
import QRCode from 'qrcode';
import { writeFile, mkdir } from 'node:fs/promises';
import { QR_TARGET } from './config.mjs';

await mkdir('assets', { recursive: true });
const opts = { errorCorrectionLevel: 'Q', margin: 4, color: { dark: '#0b2e12', light: '#ffffff' } };
const svg = await QRCode.toString(QR_TARGET, { ...opts, type: 'svg' });
await writeFile('assets/sagana-qr.svg', svg);
await QRCode.toFile('assets/sagana-qr.png', QR_TARGET, { ...opts, width: 1024 });
console.log('QR written for', QR_TARGET);
