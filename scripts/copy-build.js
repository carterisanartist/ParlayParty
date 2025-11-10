// Cross-platform build copy script
const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source not found: ${src}`);
    process.exit(1);
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const webNextDir = path.join(__dirname, '../apps/web/.next');
const serverDistDir = path.join(__dirname, '../apps/server/dist/.next');

console.log('Copying Next.js build...');
copyRecursive(webNextDir, serverDistDir);
console.log('✅ Build copied successfully');

