(() => {
  const J = window.JBD = window.JBD || {};
  J.CONFIG = Object.freeze({
    step: 1 / 60,
    maxFrameDelta: 0.10,
    render: { maxDpr: 2, particles: 560, bullets: 150 },
    input: { apCharge: 0.22, heCharge: 0.62, maxCharge: 1.05 },
    bunker: { hp: 100, yPadding: 104, barrelLength: 48 },
    weapons: {
      mg: { burst: 4, cadence: 0.055, speed: 1040, spread: 0.018, damage: 34, coverDamage: 0.42 },
      ap: { speed: 1350, spread: 0.004, damage: 29, coverDamage: 0.60 },
      he: { speed: 680, spread: 0.010, damage: 120, radius: 74, coverDamage: 0.58 }
    },
    artillery: { count: 14, introDelay: 0.34, duration: 2.55, minRadius: 22, maxRadius: 38 },
    infantry: {
      hp: 100, speed: 27, sprint: 62, range: 310, fireInterval: 1.18,
      coverSearchRadius: 205, coverMinY: 105, suppressionDecay: 0.20,
      coverWaveHold: 3.8, assaultSignalLead: 0.68, assaultRushDuration: 2.45,
      assaultSprint: 76, reseekDelay: 2.4,
      corpseFadeStart: 10, corpseLifetime: 16
    },
    level: { seed: 731942, spawnCount: 14, spawnDuration: 14.5, completeDelay: 2.0 },
    audio: { master: 0.68 },
    debug: new URLSearchParams(location.search).get('debug') === '1',
    stress: new URLSearchParams(location.search).get('stress') === '1'
  });
})();
