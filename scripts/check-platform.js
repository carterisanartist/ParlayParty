// Cross-platform setup launcher
const { execSync } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';
const scriptPath = isWindows 
  ? path.join(__dirname, 'setup.ps1')
  : path.join(__dirname, 'setup.sh');

console.log(`🎮 Launching setup script for ${isWindows ? 'Windows' : 'Unix'}...`);

try {
  if (isWindows) {
    execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, { stdio: 'inherit' });
  } else {
    execSync(`bash "${scriptPath}"`, { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Setup failed:', error.message);
  process.exit(1);
}

