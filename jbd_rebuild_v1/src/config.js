(() => {
  const J = window.JBD = window.JBD || {};
  J.CONFIG = Object.freeze({
    step: 1 / 60,
    maxFrameDelta: 0.10,
    render: { maxDpr: 2, mobileMaxDpr: 1.65, particles: 640, bullets: 190, mobileScale: 0.44, desktopScale: 0.52 },
    scale: {
      apparentRangeMeters: 450, farBandEnd: 0.00, midBandEnd: 0.00, perspectivePower: 1.00,
      infantryFarScale: 0.13, vehicleFarScale: 0.16, airFarScale: 0.38,
      terrainFarScale: 0.62, terrainNearScale: 0.62, fixedTerrainScale: 0.62, fixedEffectScale: 0.62,
      farMoveFactor: 1.00, nearMoveFactor: 1.00, effectFarScale: 0.62,
      dustRevealEnd: 0.00, silhouetteRevealEnd: 0.00, craterVisualScale: 0.58
    },
    input: { apCharge: 0.22, heCharge: 0.62, maxCharge: 1.05 },
    bunker: { hp: 100, yPadding: 104, barrelLength: 48 },
    weapons: {
      mg: { burst: 4, cadence: 0.055, speed: 1040, spread: 0.018, damage: 34, coverDamage: 0.42 },
      ap: { speed: 1350, spread: 0.004, damage: 29, coverDamage: 0.60 },
      he: { speed: 680, spread: 0.010, damage: 120, radius: 74, coverDamage: 0.58 }
    },
    artillery: { count: 14, introDelay: 0.34, duration: 2.55, minRadius: 22, maxRadius: 38 },
    infantry: {
      hp: 100, speed: 16, sprint: 32, range: 310, fireInterval: 1.22,
      coverSearchRadius: 205, coverMinY: 105, suppressionDecay: 0.20,
      coverWaveHold: 3.8, assaultSignalLead: 0.68, assaultRushDuration: 2.45,
      assaultSprint: 39, reseekDelay: 2.55,
      corpseFadeStart: 10, corpseLifetime: 16,
      weaponDeployTime: 0.95, weaponRange: 355, weaponFireInterval: 0.58, weaponDamage: 2.8,
      weaponHitBase: 0.72, maxMountedWeapons: 2
    },
    vehicles: {
      maxActive: 8,
      waveSchedule: [
        { time: 5.0, type: 'technical', lane: -0.25 },
        { time: 10.0, type: 'truck', lane: 0.20 },
        { time: 16.0, type: 'halftrack', lane: -0.08 },
        { time: 23.0, type: 'stug', lane: 0.28 },
        { time: 31.0, type: 'tank', lane: -0.28 }
      ],
      types: {
        technical: { hp: 62, speed: 42, radius: 20, range: 330, fireInterval: .72, damage: 1.15, armor: { mg:.55, ap:1.42, he:.78 }, cover: .52 },
        truck:     { hp: 82, speed: 34, radius: 24, range: 0,   fireInterval: 99,  damage: 0,    armor: { mg:.34, ap:1.28, he:.92 }, cover: .64, passengers:3 },
        halftrack: { hp: 104,speed: 30, radius: 25, range: 350, fireInterval: .86, damage: 1.35, armor: { mg:.14, ap:1.35, he:.44 }, cover: .72, passengers:2 },
        stug:      { hp: 118,speed: 23, radius: 27, range: 430, fireInterval: 3.2, damage: 6.2,  armor: { mg:.035,ap:1.30, he:.24 }, cover: .82 },
        tank:      { hp: 140,speed: 20, radius: 29, range: 445, fireInterval: 3.55,damage: 7.4,  armor: { mg:.025,ap:1.35, he:.21 }, cover: .88 }
      },
      dropYRatio: .43,
      exitPadding: 85,
      wreckLifetime: 999
    },
    airborne: {
      startTime: 29.0, planeSpeed: 78, planeYRatio: 0.15, dropCount: 6,
      dropStartRatio: 0.22, dropEndRatio: 0.72, descentSpeed: 24,
      swayAmp: 14, swayFreq: 2.15, drift: 2.4, hp: 52, hitRadius: 13,
      landingMinRatio: 0.34, landingMaxRatio: 0.53, collapsedLife: 18
    },
    campaign: {
      saveKey: 'jbd_rebuild_v1_m9_save',
      upgrades: {
        caliber:{label:'CALIBER', max:4, costs:[40,65,95,130]},
        burst:{label:'BURST', max:4, costs:[35,55,80,110]},
        charge:{label:'CHARGE SPEED', max:4, costs:[30,50,75,105]},
        he:{label:'HE BLAST', max:4, costs:[40,60,85,120]},
        armor:{label:'ARMOR', max:4, costs:[35,55,80,110]}
      }
    },
    level: { seed: 731942, spawnCount: 14, spawnDuration: 19.0, completeDelay: 2.0 },
    audio: { master: 0.68 },
    debug: new URLSearchParams(location.search).get('debug') === '1',
    stress: new URLSearchParams(location.search).get('stress') === '1'
  });
})();
