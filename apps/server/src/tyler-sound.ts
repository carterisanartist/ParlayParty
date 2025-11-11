import fs from 'fs';
import path from 'path';

export function getTylerSoundUrl(): string {
  const soundPath = path.join(__dirname, '../EasterEgg/My Song 8.wav');
  
  if (fs.existsSync(soundPath)) {
    return '/tyler-sound';
  }
  
  return '';
}
