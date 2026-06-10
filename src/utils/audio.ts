// 8-bit retro synthesizer audio utility using Web Audio API

let audioCtx: AudioContext | null = null;
let musicInterval: any = null;
let musicStep = 0;
let soundVolume = 0.4;
let musicVolume = 0.15;
let musicOscillator: OscillatorNode | null = null;
let musicGain: GainNode | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playClickSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(soundVolume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playCoinSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    
    // Play a lovely double-tone chime (arpeggio)
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.setValueAtTime(987.77, ctx.currentTime + 0.08); // B5

    gain.gain.setValueAtTime(soundVolume * 0.8, ctx.currentTime);
    gain.gain.setValueAtTime(soundVolume * 0.8, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playFlapSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(soundVolume * 0.9, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playHitSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    
    // White noise buffer for crash sound
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    // Bandpass filter to make it sound punchier
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.35);
    
    const gain = ctx.createGain();
    
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    gain.gain.setValueAtTime(soundVolume * 1.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    noiseNode.start();
    noiseNode.stop(ctx.currentTime + 0.4);

    // Also inject a low oscillator thud
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.25);
    oscGain.gain.setValueAtTime(soundVolume, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);

  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playPowerUpSound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sawtooth';
    
    // A brilliant retro frequency sweep upward
    osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.4); // A5

    gain.gain.setValueAtTime(soundVolume * 0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

export function playVictorySound(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    
    // C major chord rollup
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(261.63, now); // C4
    osc.frequency.setValueAtTime(329.63, now + 0.1); // E4
    osc.frequency.setValueAtTime(392.00, now + 0.2); // G4
    osc.frequency.setValueAtTime(523.25, now + 0.3); // C5

    gain.gain.setValueAtTime(soundVolume * 0.8, now);
    gain.gain.setValueAtTime(soundVolume * 0.8, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.start();
    osc.stop(now + 0.6);
  } catch (e) {
    console.warn('Audio play error:', e);
  }
}

// Simple synthesizer for cute background cartoon music loop
const MELODY = [
  261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66, // Wave 1
  329.63, 349.23, 392.00, 440.00, 493.88, 440.00, 392.00, 349.23, // Wave 2
  392.00, 440.00, 493.88, 523.25, 587.33, 523.25, 493.88, 440.00, // Wave 3
  493.88, 392.00, 440.00, 349.23, 329.63, 293.66, 261.63, 392.00  // Transition
];

export function startMusicLoop(enabled = true) {
  if (!enabled) {
    stopMusicLoop();
    return;
  }
  
  try {
    const ctx = getAudioContext();
    if (musicInterval) return; // Already running

    musicStep = 0;
    
    // Play notes at regular tempo (300ms per step)
    musicInterval = setInterval(() => {
      try {
        if (!enabled) {
          stopMusicLoop();
          return;
        }
        
        const noteFreq = MELODY[musicStep % MELODY.length];
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'triangle'; // Soft and friendly sound
        osc.frequency.setValueAtTime(noteFreq, ctx.currentTime);
        
        // Add a gentle vibrato/detune modulation
        osc.detune.setValueAtTime(0, ctx.currentTime);
        osc.detune.linearRampToValueAtTime(10, ctx.currentTime + 0.1);
        osc.detune.linearRampToValueAtTime(-10, ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(musicVolume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        
        musicStep++;
      } catch (err) {
        console.warn(err);
      }
    }, 280);
    
  } catch (e) {
    console.warn('Audio launch error:', e);
  }
}

export function stopMusicLoop() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}
