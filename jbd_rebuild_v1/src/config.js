(() => {
  const J = window.JBD = window.JBD || {};
  J.CONFIG = Object.freeze({
    step: 1 / 60,
    maxFrameDelta: 0.10,
    render: { maxDpr: 2, mobileMaxDpr: 1.65, particles: 640, bullets: 170, mobileScale: 0.42, desktopScale: 0.52 },
    scale: {
      apparentRangeMeters: 1400,
      fixedInfantryScale: 0.78,
      fixedVehicleScale: 0.82,
      fixedAirScale: 0.76,
      fixedTerrainScale: 0.54,
      fixedEffectScale: 0.72,
      craterVisualScale: 0.40
    },
    input: { apCharge: 0.22, heCharge: 0.62, maxCharge: 1.05 },
    bunker: { hp: 100, yPadding: 98, barrelLength: 48 },
    weapons: {
      mg: { burst: 4, cadence: 0.055, speed: 520, spread: 0.018, damage: 34, coverDamage: 0.42, range: 200 },
      ap: { speed: 760, spread: 0.004, damage: 29, coverDamage: 0.60, range: 430 },
      he: { speed: 520, spread: 0.010, damage: 120, radius: 74, coverDamage: 0.58, range: 390 }
    },
    artillery: { count: 14, introDelay: 0.34, duration: 2.55, minRadius: 22, maxRadius: 38 },
    infantry: {
      hp: 100, speed: 12, sprint: 24, range: 300, fireInterval: 1.30,
      coverSearchRadius: 205, coverMinY: 105, suppressionDecay: 0.20,
      coverWaveHold: 3.8, assaultSignalLead: 0.68, assaultRushDuration: 2.45,
      assaultSprint: 30, reseekDelay: 2.8,
      corpseFadeStart: 10, corpseLifetime: 16,
      weaponDeployTime: 0.95, weaponRange: 330, weaponFireInterval: 0.66, weaponDamage: 2.6,
      weaponHitBase: 0.70, maxMountedWeapons: 2
    },
    vehicles: {
      maxActive: 8,
      waveSchedule: [
        { time: 4.8, type: 'technical', lane: -0.25 },
        { time: 9.2, type: 'truck', lane: 0.20 },
        { time: 14.0, type: 'halftrack', lane: -0.08 },
        { time: 19.2, type: 'stug', lane: 0.28 },
        { time: 25.0, type: 'tank', lane: -0.28 }
      ],
      types: {
        technical: { hp: 62, speed: 32, radius: 20, range: 330, fireInterval: .78, damage: 1.15, armor: { mg:.55, ap:1.42, he:.78 }, cover: .52 },
        truck:     { hp: 82, speed: 24, radius: 24, range: 0,   fireInterval: 99,  damage: 0,    armor: { mg:.34, ap:1.28, he:.92 }, cover: .64, passengers:3 },
        halftrack: { hp: 104,speed: 21, radius: 25, range: 350, fireInterval: .94, damage: 1.35, armor: { mg:.14, ap:1.35, he:.44 }, cover: .72, passengers:2 },
        stug:      { hp: 118,speed: 16, radius: 27, range: 430, fireInterval: 3.4, damage: 6.2,  armor: { mg:.035,ap:1.30, he:.24 }, cover: .82 },
        tank:      { hp: 140,speed: 14, radius: 29, range: 445, fireInterval: 3.75,damage: 7.4,  armor: { mg:.025,ap:1.35, he:.21 }, cover: .88 }
      },
      dropYRatio: .43,
      exitPadding: 85,
      wreckLifetime: 999
    },
    airborne: {
      startTime: 27.5, planeSpeed: 70, planeYRatio: 0.15, dropCount: 6,
      dropStartRatio: 0.22, dropEndRatio: 0.72, descentSpeed: 20,
      swayAmp: 14, swayFreq: 2.15, drift: 1.4, hp: 52, hitRadius: 13,
      landingMinRatio: 0.34, landingMaxRatio: 0.53, collapsedLife: 18
    },
    campaign: {
      saveKey: 'jbd_rebuild_v1_mini_v2_save',
      upgrades: {
        caliber:{label:'CALIBER', max:4, costs:[40,65,95,130]},
        burst:{label:'BURST', max:4, costs:[35,55,80,110]},
        charge:{label:'CHARGE SPEED', max:4, costs:[30,50,75,105]},
        he:{label:'HE BLAST', max:4, costs:[40,60,85,120]},
        armor:{label:'ARMOR', max:4, costs:[35,55,80,110]}
      }
    },
    level: { seed: 731942, spawnCount: 14, spawnDuration: 16.5, completeDelay: 2.0 },
    audio: { master: 0.68 },
    debug: new URLSearchParams(location.search).get('debug') === '1',
    stress: new URLSearchParams(location.search).get('stress') === '1'
  });
})();
