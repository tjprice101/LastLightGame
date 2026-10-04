import Phaser from 'phaser';

class Sanctuary extends Phaser.Scene {
  constructor() { super('sanctuary'); }

  create(): void {
    const draw = () => {
      this.children.removeAll(true);
      this.tweens.killAll();
      const { width, height } = this.scale;
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const landscape = this.add.graphics();
      landscape.fillStyle(0x080e1b).fillRect(0, 0, width, height);
      for (let ring = 16; ring > 0; ring--) {
        landscape.fillStyle(0x688692, 0.009);
        landscape.fillCircle(width * 0.5, height * 0.38, ring * Math.min(width, height) * 0.042);
      }
      landscape.lineStyle(1, 0xd9bc7f, 0.16);
      landscape.strokeCircle(width * 0.5, height * 0.38, Math.min(width, height) * 0.27);
      landscape.strokeCircle(width * 0.5, height * 0.38, Math.min(width, height) * 0.285);
      for (let layer = 0; layer < 3; layer++) {
        landscape.fillStyle([0x152331, 0x101c29, 0x0b1521][layer]);
        landscape.beginPath();
        landscape.moveTo(0, height);
        for (let x = 0; x <= width + 40; x += 40) {
          const y = height * (0.66 + layer * 0.1) +
            Math.sin(x * 0.005 + layer * 2) * 45 +
            Math.cos(x * 0.012 + layer) * 20;
          landscape.lineTo(x, y);
        }
        landscape.lineTo(width, height);
        landscape.closePath();
        landscape.fillPath();
      }
      for (let index = 0; index < 48; index++) {
        const light = this.add.circle(
          Phaser.Math.Between(0, width), Phaser.Math.Between(0, height),
          index % 5 === 0 ? 2 : 1, 0xe9c993, Phaser.Math.FloatBetween(0.15, 0.6),
        );
        if (!reducedMotion) {
          this.tweens.add({
            targets: light,
            y: light.y - Phaser.Math.Between(20, 70),
            alpha: 0.08,
            duration: Phaser.Math.Between(3000, 8000),
            yoyo: true, repeat: -1, ease: 'Sine.inOut',
          });
        }
      }
    };
    draw();
    this.scale.on('resize', draw);
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    motion.addEventListener('change', draw);
    this.events.once('shutdown', () => {
      this.scale.off('resize', draw);
      motion.removeEventListener('change', draw);
    });
  }
}

export function createBackdrop(): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'backdrop',
    backgroundColor: '#080e1b',
    scene: Sanctuary,
    scale: { mode: Phaser.Scale.RESIZE, width: window.innerWidth, height: window.innerHeight },
    render: { antialias: true, powerPreference: 'high-performance' },
    fps: { target: 60 },
    audio: { noAudio: true },
  });
}
