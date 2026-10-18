// Web Audio API Synthesizer for Al-Aman app
let audioCtx: AudioContext | null = null;
let activeSirenInterval: any = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Romantic Chime / Love Bell
export function playRomanticChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Notes: C5, E5, G5, C6 (Arpeggio)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.12);
      
      gain.gain.setValueAtTime(0.001, now + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.25, now + index * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.8);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.12);
      osc.stop(now + index * 0.12 + 0.9);
    });
  } catch (e) {
    console.warn("Audio play error", e);
  }
}

// 2. Joy Celebration Fanfare ("حاجة حلوة حصلت!")
export function playJoyFanfare() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Upbeat fanfare: G4, C5, E5, G5 (Major chord brass style)
    const notes = [
      { f: 392.00, t: 0, d: 0.15 },
      { f: 523.25, t: 0.15, d: 0.15 },
      { f: 659.25, t: 0.30, d: 0.2 },
      { f: 783.99, t: 0.50, d: 0.6 },
      { f: 1046.50, t: 0.70, d: 0.9 }
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.001, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.3, now + n.t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.t + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.t);
      osc.stop(now + n.t + n.d + 0.1);
    });
  } catch (e) {
    console.warn("Audio play error", e);
  }
}

// 3. Emergency SOS Siren (Continuous alternating alarm)
export function startEmergencySiren() {
  stopEmergencySiren();
  try {
    const ctx = getAudioContext();
    let state = false;

    const playTone = () => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const freq = state ? 920 : 680;
      state = !state;

      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq + (state ? 50 : -50), now + 0.28);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    };

    playTone();
    activeSirenInterval = setInterval(playTone, 320);
  } catch (e) {
    console.warn("Emergency audio error", e);
  }
}

export function stopEmergencySiren() {
  if (activeSirenInterval) {
    clearInterval(activeSirenInterval);
    activeSirenInterval = null;
  }
}

// 4. Melodious Alarm Tone (for scheduled / spontaneous alarm)
export function playAlarmTone() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // 3 repetitions of pleasant chime
    for (let r = 0; r < 3; r++) {
      const base = now + r * 0.7;
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, base + i * 0.1);

        gain.gain.setValueAtTime(0.001, base + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.2, base + i * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, base + i * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(base + i * 0.1);
        osc.stop(base + i * 0.1 + 0.45);
      });
    }
  } catch (e) {
    console.warn("Alarm play error", e);
  }
}

// 5. Heartbeat Thump
export function playHeartbeatSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    [0, 0.2].forEach(delay => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, now + delay);
      osc.frequency.exponentialRampToValueAtTime(40, now + delay + 0.15);

      gain.gain.setValueAtTime(0.3, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.2);
    });
  } catch (e) {
    console.warn("Heartbeat error", e);
  }
}
