// Builds the optimized web images from the SAGANA User Manual's raw screenshots
// and the app icon. Run: npm run images
// Inputs live outside this repo (the manual's _raw folder and the Flutter repo);
// the generated files in assets/ are committed, so Vercel needs no build step.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const RAW = process.env.SAGANA_RAW ||
  'C:/Users/Administrator/Downloads/SAGANA Documents/SAGANA User-Manual/screenshots/_raw';
const ICON = process.env.SAGANA_ICON ||
  'C:/Users/Administrator/sagana/assets/images/sagana_icon.png';
const OUT = path.resolve('assets');

// [source file, output name]
const SCREENS = [
  ['01_welcome.png', 'app-welcome'],
  ['08_guest_farmer_home.png', 'farmer-home'],
  ['f11_crop_roster.png', 'farmer-roster'],
  ['f10_record_harvest.png', 'farmer-record'],
  ['f12_manage_inventory.png', 'farmer-inventory'],
  ['f20_capital_share.png', 'farmer-capital'],
  ['f22_programs.png', 'farmer-programs'],
  ['b01_browse.png', 'buyer-browse'],
  ['b02_product_details.png', 'buyer-product'],
  ['b03_prices.png', 'buyer-prices'],
  ['b04_orders.png', 'buyer-orders'],
  ['b05_order_detail.png', 'buyer-order-detail'],
  ['m01_dashboard.png', 'staff-dashboard'],
  ['m12_programs.png', 'staff-programs'],
  ['m20_listing_approvals.png', 'staff-approvals'],
  ['m42_analytics.png', 'staff-analytics'],
  ['m68_officer_access.png', 'staff-officer-access'],
  ['m02_calendar.png', 'staff-calendar'],
];

// The Manager Dashboard header shows a member's profile photo. Replace it with
// a neutral avatar so no personal photo is published.
const AVATAR = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="780" height="1688">
  <circle cx="702" cy="63" r="38" fill="#fafafa"/>
  <circle cx="702" cy="63" r="35" fill="#dfe8df"/>
  <circle cx="702" cy="54" r="12" fill="#7d9a80"/>
  <path d="M679 88c4-14 14-20 23-20s19 6 23 20z" fill="#7d9a80"/></svg>`);

await mkdir(path.join(OUT, 'screens'), { recursive: true });
for (const [src, name] of SCREENS) {
  let img = sharp(path.join(RAW, src));
  if (name === 'staff-dashboard') {
    const buf = await img.composite([{ input: AVATAR, left: 0, top: 0 }]).png().toBuffer();
    img = sharp(buf);
  }
  await img.resize({ width: 520 }).webp({ quality: 84 }).toFile(path.join(OUT, 'screens', `${name}.webp`));
  console.log('screen', name);
}

// Logo / favicons from the app's own icon.
await sharp(ICON).resize(512, 512).png().toFile(path.join(OUT, 'logo-512.png'));
await sharp(ICON).resize(192, 192).png().toFile(path.join(OUT, 'logo-192.png'));
await sharp(ICON).resize(96, 96).png().toFile(path.join(OUT, 'logo-96.png'));
await sharp(ICON).resize(180, 180).png().toFile(path.join(OUT, 'apple-touch-icon.png'));
await sharp(ICON).resize(48, 48).png().toFile(path.join(OUT, 'favicon.png'));
console.log('logos done');

// Social-share image (1200x630) for link previews.
const logo = await sharp(ICON).resize(150, 150).png().toBuffer();
const phone = await sharp(path.join(OUT, 'screens', 'farmer-home.webp')).resize({ height: 540 }).png().toBuffer();
const og = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00450d"/><stop offset="1" stop-color="#2a7a30"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <circle cx="1080" cy="40" r="260" fill="#dcedc8" opacity=".15"/>
  <text x="80" y="330" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="84" fill="#ffffff" letter-spacing="8">SAGANA</text>
  <text x="80" y="400" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#dcedc8">From harvest to marketplace, in one app.</text>
  <text x="80" y="460" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#ffffff" opacity=".8">SP3 Agriculture Cooperative · Payanas, Torrijos, Marinduque</text>
  <rect x="80" y="510" width="270" height="62" rx="31" fill="#f9a825"/>
  <text x="215" y="551" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="26" fill="#2b1d00">Download for Android</text>
</svg>`);
await sharp(og).composite([
  { input: logo, left: 80, top: 130 },
  { input: phone, left: 870, top: 45 },
]).png().toFile(path.join(OUT, 'og.png'));
console.log('og done');
