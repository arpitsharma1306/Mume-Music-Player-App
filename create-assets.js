const sharp = require('sharp');
const fs = require('fs');

// Ensure assets folder exists
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
}

const size = 1024;
const iconSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1A1A2E"/>
  <circle cx="512" cy="512" r="400" fill="#E94560"/>
  <text x="50%" y="55%" font-size="500" fill="#1A1A2E" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-weight="bold">M</text>
</svg>`;

const splashSvg = `<svg width="1284" height="2778" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#1A1A2E"/>
  <circle cx="642" cy="1389" r="200" fill="#E94560"/>
  <text x="50%" y="50%" font-size="250" fill="#E94560" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-weight="bold">MUME</text>
</svg>`;

async function createAssets() {
  try {
    // Create icon.png (1024x1024)
    await sharp(Buffer.from(iconSvg))
      .resize(1024, 1024)
      .png()
      .toFile('assets/icon.png');
    console.log('✓ icon.png created');

    // Create adaptive-icon.png (1024x1024)
    await sharp(Buffer.from(iconSvg))
      .resize(1024, 1024)
      .png()
      .toFile('assets/adaptive-icon.png');
    console.log('✓ adaptive-icon.png created');

    // Create splash.png (1284x2778)
    await sharp(Buffer.from(splashSvg))
      .resize(1284, 2778)
      .png()
      .toFile('assets/splash.png');
    console.log('✓ splash.png created');

    // Create favicon.png (48x48)
    await sharp(Buffer.from(iconSvg))
      .resize(48, 48)
      .png()
      .toFile('assets/favicon.png');
    console.log('✓ favicon.png created');

    console.log('\nAll assets created successfully!');
  } catch (error) {
    console.error('Error creating assets:', error);
  }
}

createAssets();
