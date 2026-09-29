// Layanan efek suara membalik lembaran kertas menggunakan Web Audio API murni
// Tidak membutuhkan unduhan berkas audio eksternal dan bebas latensi.

class AudioService {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('yasin_audio_muted') === 'true';
  }

  initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('yasin_audio_muted', String(this.isMuted));
    return this.isMuted;
  }

  playPageTurn() {
    if (this.isMuted) return;

    try {
      this.initContext();
      if (!this.ctx) return;

      const duration = 0.18;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Membuat gesekan suara kertas halus (pinkish-brown noise)
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;

      // Filter bandpass untuk suara kertas realistis
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      // Amplop volume lembut (fade in dan fade out cepat)
      const gainNode = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.08, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + duration);
    } catch {
      // Audio tidak mengganggu jalannya aplikasi jika dibatasi oleh browser
    }
  }
}

export const audioService = new AudioService();
