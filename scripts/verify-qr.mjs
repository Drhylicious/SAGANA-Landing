// Decodes the generated QR PNG and checks it contains the permanent URL.
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { QR_TARGET } from './config.mjs';

const png = PNG.sync.read(await readFile('assets/sagana-qr.png'));
const result = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
if (!result) { console.error('FAIL: QR could not be decoded'); process.exit(1); }
console.log('Decoded:', result.data);
if (result.data !== QR_TARGET) { console.error('FAIL: expected', QR_TARGET); process.exit(1); }
console.log('OK: QR decodes to the permanent URL');
