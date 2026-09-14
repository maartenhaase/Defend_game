(() => {
  const J = window.JBD = window.JBD || {};
  J.CONFIG = Object.freeze({
    step: 1 / 60,
    maxFrameDelta: 0.10,
    render: { maxDpr: 2, mobileMaxDpr: 1.65, particles: 680, bullets: 190, mobileScale: 0.72, desktopScale: 0.86 },
    input: { apCharge: 0.22, heCharge: 0.62, maxCharge: 1.05 },
    bunker: { hp: 100, yPadding: 104, barrelLength: 48 },
    weapons: {
      mg: { burst: 4, cadence: 0.055, speed: 1040, spread: 0.018, damage: 34, coverDamage: 0.42 },
      ap: { speed: 1350, spread: 0.004, damage: 29, coverDamage: 0.60 },
      he: { speed: 680, spread: 0.010, damage: 120, radius: 74, coverDamage: 0.58 }
    },
    artillery: { count: 14, introDelay: 0.34, duration: 2.55, minRadius: 22, maxRadius: 38 },
    infantry: {
      hp: 100, speed: 22, sprint: 50, range: 310, fireInterval: 1.22,
      coverSearchRadius: 205, coverMinY: 105, suppressionDecay: 0.20,
      coverWaveHold: 3.8, assaultSignalLead: 0.68, assaultRushDuration: 2.45,
      assaultSprint: 61, reseekDelay: 2.55,
      corpseFadeStart: 10, corpseLifetime: 16
    },
    vehicles: {
      maxActive: 8,
      waveSchedule: [
        { time: 3.8, type: 'technical', lane: -0.25 },
        { time: 7.4, type: 'truck', lane: 0.20 },
        { time: 11.2, type: 'halftrack', lane: -0.08 },
        { time: 15.7, type: 'stug', lane: 0.28 },
        { time: 20.6, type: 'tank', lane: -0.28 }
      ],
      types: {
        technical: { hp: 62, speed: 64, radius: 20, range: 330, fireInterval: .72, damage: 1.15, armor: { mg:.55, ap:1.42, he:.78 }, cover: .52 },
        truck:     { hp: 82, speed: 48, radius: 24, range: 0,   fireInterval: 99,  damage: 0,    armor: { mg:.34, ap:1.28, he:.92 }, cover: .64, passengers:3 },
        halftrack: { hp: 104,speed: 42, radius: 25, range: 350, fireInterval: .86, damage: 1.35, armor: { mg:.14, ap:1.35, he:.44 }, cover: .72, passengers:2 },
        stug:      { hp: 118,speed: 31, radius: 27, range: 430, fireInterval: 3.2, damage: 6.2,  armor: { mg:.035,ap:1.30, he:.24 }, cover: .82 },
        tank:      { hp: 140,speed: 28, radius: 29, range: 445, fireInterval: 3.55,damage: 7.4,  armor: { mg:.025,ap:1.35, he:.21 }, cover: .88 }
      },
      dropYRatio: .43,
      exitPadding: 85,
      wreckLifetime: 999
    },
    airborne: {
      startTime: 24.2, planeSpeed: 96, planeYRatio: 0.15, dropCount: 6,
      dropStartRatio: 0.22, dropEndRatio: 0.72, descentSpeed: 31,
      swayAmp: 14, swayFreq: 2.15, drift: 2.4, hp: 52, hitRadius: 13,
      landingMinRatio: 0.34, landingMaxRatio: 0.53, collapsedLife: 18
    },
    level: { seed: 731942, spawnCount: 14, spawnDuration: 14.5, completeDelay: 2.0 },
    audio: { master: 0.68 },
    debug: new URLSearchParams(location.search).get('debug') === '1',
    stress: new URLSearchParams(location.search).get('stress') === '1'
  });
})();
