const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4);
    data.copy(buf, 8);
    // Simple CRC32
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // Raw image data: filter byte (0) + (RGB) * width per scanline
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      // Calculate circle / icon pattern
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const isInside = dist < (width * 0.44);

      const pxOffset = rowOffset + 1 + x * 3;
      if (isInside) {
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
      } else {
        rawData[pxOffset] = 24;
        rawData[pxOffset + 1] = 24;
        rawData[pxOffset + 2] = 32;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crc32Table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

const crc32Table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crc32Table[i] = c >>> 0;
}

const publicDir = path.resolve(__dirname, '../public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 250, 45, 72));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 250, 45, 72));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 250, 45, 72));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 250, 45, 72));
console.log('Successfully generated Windows PWA PNG icons!');
