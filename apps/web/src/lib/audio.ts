import * as Tone from 'tone';

class AudioManager {
  private initialized = false;
  private lobbyPlayer: Tone.Player | null = null;
  private sfxSynth: Tone.Synth | null = null;
  private noiseSynth: Tone.NoiseSynth | null = null;

  async initialize() {
    if (this.initialized) return;

    await Tone.start();
    console.log('Tone.js audio initialized');

    this.sfxSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
    }).toDestination();

    this.noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0 },
    }).toDestination();

    this.lobbyPlayer = new Tone.Player().toDestination();
    this.lobbyPlayer.loop = true;
    this.lobbyPlayer.volume.value = -20;

    this.initialized = true;
  }

  playLobbyLoop() {
    if (!this.initialized || !this.lobbyPlayer) return;
    
    const lofiMelody = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.8 },
    }).toDestination();
    
    lofiMelody.volume.value = -25;
    
    const loop = new Tone.Loop((time) => {
      const notes = ['C4', 'E4', 'G4', 'A4', 'G4', 'E4'];
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      lofiMelody.triggerAttackRelease(randomNote, '8n', time);
    }, '4n');
    
    loop.start(0);
    Tone.Transport.start();
  }

  stopLobbyLoop() {
    Tone.Transport.stop();
  }

  playLockIn() {
    if (!this.initialized || !this.sfxSynth) return;
    this.sfxSynth.triggerAttackRelease('C5', '0.1');
  }

  playPauseBoom() {
    if (!this.initialized || !this.noiseSynth) return;
    const bassSynth = new Tone.MembraneSynth().toDestination();
    bassSynth.volume.value = -5;
    bassSynth.triggerAttackRelease('C1', '0.3');
    
    setTimeout(() => {
      this.noiseSynth?.triggerAttackRelease('0.05');
    }, 50);
  }

  playResumeWhoosh() {
    if (!this.initialized || !this.noiseSynth) return;
    this.noiseSynth.triggerAttackRelease('0.2');
  }

  playWheelTick() {
    if (!this.initialized || !this.sfxSynth) return;
    this.sfxSynth.triggerAttackRelease('A4', '0.05');
  }

  playWheelCrash() {
    if (!this.initialized) return;
    const crash = new Tone.MetalSynth().toDestination();
    crash.volume.value = -10;
    crash.triggerAttackRelease('0.3');
  }

  playScorePop() {
    if (!this.initialized || !this.sfxSynth) return;
    this.sfxSynth.triggerAttackRelease('E5', '0.1');
    setTimeout(() => {
      this.sfxSynth?.triggerAttackRelease('A5', '0.1');
    }, 100);
  }

  playButtonClick() {
    if (!this.initialized || !this.sfxSynth) return;
    this.sfxSynth.triggerAttackRelease('G4', '0.05');
  }
}

export const audioManager = new AudioManager();

