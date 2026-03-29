import { useState, useReducer, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ══════════════════════════════════════════════════════════
// GAME DATA
// ══════════════════════════════════════════════════════════

const KINGDOMS = {
  Iron: {
    label: 'Iron Kingdom',
    icon: '⚔️',
    color: '#c06030',
    desc: 'Forged in war. The strongest warriors in all of Aethoria hail from these lands.',
    bonus: { str: 3, vit: 2 },
    affinity: ['Vanguard', 'Berserker'],
    lore: 'Where steel meets stone, warriors are born.',
  },
  Arcanum: {
    label: 'Kingdom of Arcanum',
    icon: '🔮',
    color: '#8040c0',
    desc: 'Ancient towers pierce the sky. Knowledge is the only currency that matters here.',
    bonus: { int: 3, agi: 2 },
    affinity: ['Scholar', 'VoidWalker', 'ShadowBlade'],
    lore: 'The arcane arts flow through every stone.',
  },
  Ocean: {
    label: 'Ocean Dominion',
    icon: '🌊',
    color: '#2060c0',
    desc: 'Masters of trade and the open sea. Balance above all, profit above all else.',
    bonus: { str: 2, int: 2, agi: 1 },
    affinity: ['MerchantPrince', 'Paladin', 'Warden'],
    lore: 'The tides answer to those who dare sail beyond.',
  },
}

const ZONES = {
  Capital: { label: 'Aethoria Capital', icon: '🏰', danger: 0, desc: 'The kingdom\'s beating heart. Guilds, markets, and whispers of power.', adjacent: ['Forest', 'Mountains'], market: true, encounters: [] },
  Forest:  { label: 'Whispering Forest', icon: '🌲', danger: 1, desc: 'Ancient trees stretch endlessly. Strange lights flicker at night.', adjacent: ['Capital', 'Shadow'], encounters: ['Goblin Scout', 'Forest Wolf', 'Giant Spider'] },
  Mountains:{ label: 'Ironpeak Mountains', icon: '⛰', danger: 2, desc: 'Towering peaks rich with ore. Treacherous paths, greater rewards.', adjacent: ['Capital', 'Ruins'], encounters: ['Stone Golem', 'Iron Bat', 'Mountain Troll'] },
  Shadow:  { label: 'Shadow Depths', icon: '🌑', danger: 3, desc: 'Darkness absolute. Only fools or legends dare enter.', adjacent: ['Forest', 'Ruins'], encounters: ['Shadow Wraith', 'Void Imp', 'Dark Knight'] },
  Ruins:   { label: 'Ancient Ruins', icon: '🏛', danger: 4, desc: 'A lost civilization\'s grave. Unimaginable power — and peril.', adjacent: ['Mountains', 'Shadow'], encounters: ['Ancient Golem', 'Lich Acolyte', 'Ruin Drake'] },
}

const ENEMIES = {
  'Goblin Scout':   { hp: 30,  atk: 5,  def: 2,  exp: 20,  gold: [3,8],    minLv: 1,  loot: ['Rusty Dagger', 'Small Pouch'] },
  'Forest Wolf':    { hp: 50,  atk: 8,  def: 3,  exp: 35,  gold: [5,12],   minLv: 1,  loot: ['Wolf Pelt', 'Sharp Fang'] },
  'Giant Spider':   { hp: 60,  atk: 10, def: 2,  exp: 45,  gold: [4,10],   minLv: 2,  loot: ['Spider Silk', 'Poison Sac'] },
  'Stone Golem':    { hp: 130, atk: 14, def: 8,  exp: 85,  gold: [15,30],  minLv: 5,  loot: ['Stone Core', 'Iron Chunk'] },
  'Iron Bat':       { hp: 65,  atk: 12, def: 4,  exp: 55,  gold: [8,18],   minLv: 4,  loot: ['Bat Wing', 'Echostone'] },
  'Mountain Troll': { hp: 190, atk: 20, def: 10, exp: 145, gold: [25,50],  minLv: 7,  loot: ['Troll Hide', 'Crude Club'] },
  'Shadow Wraith':  { hp: 95,  atk: 22, def: 5,  exp: 125, gold: [20,40],  minLv: 8,  loot: ['Shadow Essence', 'Dark Shard'] },
  'Void Imp':       { hp: 80,  atk: 18, def: 6,  exp: 105, gold: [15,35],  minLv: 10, loot: ['Void Dust', 'Imp Claw'] },
  'Dark Knight':    { hp: 230, atk: 28, def: 15, exp: 210, gold: [40,80],  minLv: 13, loot: ['Dark Plate Fragment', 'Cursed Shard'] },
  'Ancient Golem':  { hp: 310, atk: 35, def: 20, exp: 290, gold: [60,120], minLv: 15, loot: ['Ancient Core', 'Rune Fragment'] },
  'Lich Acolyte':   { hp: 185, atk: 40, def: 8,  exp: 330, gold: [70,140], minLv: 18, loot: ['Death Tome', 'Bone Staff'] },
  'Ruin Drake':     { hp: 520, atk: 50, def: 25, exp: 520, gold: [100,200],minLv: 22, loot: ['Drake Scale', 'Dragon Shard'] },
}

const SHOP = [
  { name: 'Health Potion',  cost: 25,  desc: 'Restore 60 HP',        type: 'consumable', hp: 60 },
  { name: 'Mana Elixir',    cost: 20,  desc: 'Restore 40 MP',        type: 'consumable', mp: 40 },
  { name: 'Elixir',         cost: 80,  desc: 'Restore 120 HP+60 MP', type: 'consumable', hp: 120, mpRestore: 60 },
  { name: 'Iron Sword',     cost: 120, desc: '+8 ATK',                type: 'weapon',     atk: 8 },
  { name: 'Silver Blade',   cost: 300, desc: '+16 ATK',               type: 'weapon',     atk: 16 },
  { name: 'Leather Armor',  cost: 100, desc: '+6 DEF',                type: 'armor',      def: 6 },
  { name: 'Chain Mail',     cost: 260, desc: '+13 DEF',               type: 'armor',      def: 13 },
  { name: 'Mage Robe',      cost: 220, desc: '+10 DEF, +3 INT',       type: 'armor',      def: 10, intBoost: 3 },
]

// Hidden jobs — conditions checked at Lv 10+ based on play style
// Players are NOT told these exist
const HIDDEN_JOBS = {
  Vanguard: {
    label: 'Iron Vanguard',    icon: '🛡',
    desc: 'An unbreakable wall of steel. Born from countless battles, this warrior exists to protect.',
    check: p => p.kills >= 20 && p.vit >= p.int + 3 && p.str >= 10,
  },
  Berserker: {
    label: 'Chaos Berserker',  icon: '⚔️',
    desc: 'Fury incarnate. Near death, your power becomes divine. The line between warrior and beast dissolves.',
    check: p => p.kills >= 25 && p.str >= p.int + 4 && p.hp < p.maxHp * 0.4,
  },
  Scholar: {
    label: 'Arcane Scholar',   icon: '🔮',
    desc: 'The universe is a formula. You have decoded it. Elemental forces bend at your command.',
    check: p => p.int >= 18 && p.int >= p.str + 5 && p.explores >= 10,
  },
  VoidWalker: {
    label: 'Void Walker',      icon: '🌌',
    desc: 'You have touched the void and returned. Reality is merely a suggestion to you now.',
    check: p => p.zone === 'Shadow' && p.kills >= 15 && p.int >= 14 && p.explores >= 8,
  },
  ShadowBlade: {
    label: 'Shadow Blade',     icon: '🗡️',
    desc: 'Strike before they see you. You are the blade in the dark, the last sound before silence.',
    check: p => p.agi >= 18 && p.agi >= p.str + 4 && p.kills >= 18,
  },
  MerchantPrince: {
    label: 'Merchant Prince',  icon: '💰',
    desc: 'Gold flows to you like rivers to the sea. Every transaction, a conquest.',
    check: p => p.trades >= 15 && p.gold >= 2000,
  },
  Paladin: {
    label: 'Holy Paladin',     icon: '✨',
    desc: 'Chosen by forces greater than yourself. You wield both sword and divine light.',
    check: p => p.str >= 12 && p.int >= 12 && p.kills >= 20 && p.kingdom === 'Ocean',
  },
  Warden: {
    label: "Nature's Warden",  icon: '🏹',
    desc: 'The wilds are your domain. Beast and forest answer your call without question.',
    check: p => p.explores >= 25 && p.agi >= 14 && (p.kingdom === 'Ocean' || p.kingdom === 'Iron'),
  },
}

const WORLD_EVENTS = [
  '🏴 GOBLIN RAID — Villages under attack! Bonus EXP for defeating goblins.',
  '🎪 MERCHANT FESTIVAL — Shop prices reduced 20% in the Capital!',
  '🌕 BLOOD MOON — Monsters are stronger, but drop rare loot.',
  '⚡ MANA SURGE — Magical energy floods the world. Spells cost half MP.',
  '👑 ROYAL DECREE — The king offers bounties for clearing the Shadow Depths.',
  '🐉 DRAGON SIGHTING — A massive shadow crosses the mountains. Adventurers take caution.',
]

const EXPLORE_LINES = [
  n => `You venture deeper into the ${n}.`,
  n => `The ${n} stretches before you, vast and silent.`,
  n => `Strange sounds echo through the ${n}.`,
  n => `Your footsteps are swallowed by the ${n}.`,
]
const ENCOUNTER_LINES = [
  e => `A ${e} emerges from the shadows!`,
  e => `The ground trembles — a ${e} attacks!`,
  e => `You hear a roar. A ${e} blocks your path!`,
  e => `Without warning, a ${e} lunges at you!`,
]
const LOOT_LINES   = [
  (i, g) => `You find a hidden cache — ${i} and ${g} gold!`,
  (i, g) => `Beneath the rubble: ${i} (+${g}g).`,
  (i, g) => `A glint catches your eye — ${i} and ${g} coins.`,
]
const MISS_LINES   = ['You swing wide — they dodge!', 'Your attack misses!', 'They sidestep your strike!']
const CRIT_LINES   = ['CRITICAL STRIKE!', 'A devastating blow!', 'Perfect hit — CRITICAL!']
const ENEMY_ATK    = e => [`${e} retaliates!`, `${e} strikes back!`, `${e} attacks ferociously!`]

// ══════════════════════════════════════════════════════════
// ENGINE HELPERS
// ══════════════════════════════════════════════════════════

const rand      = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const pick      = arr => arr[rand(0, arr.length - 1)]
const expNeeded = lv  => Math.floor(100 * Math.pow(1.38, lv - 1))
const rankScore = p   => (p.level * 100) + (p.kills * 5) + Math.floor(p.gold / 10)

function getAtk(p)   { return p.str * 2 + (p.equippedAtk || 0) }
function getDef(p)   { return p.vit + (p.equippedDef || 0) }
function getMaxHp(p) { return 80 + p.vit * 12 + (p.bonusHp || 0) }
function getMaxMp(p) { return 40 + p.int * 8  + (p.bonusMp || 0) }

function detectJob(p) {
  // Kingdom affinity gives a bonus — affinity jobs unlock 2 levels earlier
  const kingdom = KINGDOMS[p.kingdom]
  for (const [key, job] of Object.entries(HIDDEN_JOBS)) {
    if (job.check({ ...p, zone: p.currentZone })) {
      // Kingdom affinity check
      const hasAffinity = kingdom?.affinity?.includes(key)
      if (hasAffinity || p.level >= 10) return key
    }
  }
  return null
}

// ── Save ranking to localStorage ──────────────────────────
function saveRanking(player) {
  try {
    const key   = 'aethoria_rankings'
    const raw   = localStorage.getItem(key)
    const data  = raw ? JSON.parse(raw) : {}
    const k     = player.kingdom || 'Iron'
    if (!data[k]) data[k] = []
    // Remove old entry for same name, add updated
    data[k] = data[k].filter(r => r.name !== player.name)
    data[k].push({
      name:   player.name,
      level:  player.level,
      job:    player.jobRevealed ? (HIDDEN_JOBS[player.job]?.label || player.job) : 'Wanderer',
      kills:  player.kills,
      gold:   player.gold,
      score:  rankScore(player),
    })
    data[k].sort((a, b) => b.score - a.score)
    data[k] = data[k].slice(0, 10)
    localStorage.setItem(key, JSON.stringify(data))
  } catch {}
}

function loadRankings() {
  try {
    return JSON.parse(localStorage.getItem('aethoria_rankings') || '{}')
  } catch { return {} }
}

function parseCmd(raw) {
  const t = raw.toLowerCase().trim()
  if (!t) return null
  if (/^(explore|go|venture|search|scout|advance|push|wander)/.test(t))             return { cmd: 'explore' }
  if (/^(travel|move to|go to|head to|journey|visit)\s*(.+)/.test(t)) {
    const m = t.match(/(?:travel|move to|go to|head to|journey|visit)\s*(.+)/)
    return { cmd: 'travel', dest: m ? m[1].trim() : '' }
  }
  if (/^(attack|fight|strike|hit|slash|stab|kill|engage|charge)/.test(t))           return { cmd: 'attack' }
  if (/^(flee|run|escape|retreat|get out|back off)/.test(t))                        return { cmd: 'flee' }
  if (/^(rest|sleep|camp|heal|recover|wait)/.test(t))                               return { cmd: 'rest' }
  if (/^(shop|store|market|browse)/.test(t))                                        return { cmd: 'shop' }
  if (/^buy\s+(.+)/.test(t))  { const m = t.match(/^buy\s+(.+)/);   return { cmd: 'buy',  item: m[1] } }
  if (/^use\s+(.+)/.test(t))  { const m = t.match(/^use\s+(.+)/);   return { cmd: 'use',  item: m[1] } }
  if (/^(inventory|bag|items|i$|inv)/.test(t))                                      return { cmd: 'inventory' }
  if (/^(status|stats|info|char|profile|me$|myself)/.test(t))                      return { cmd: 'status' }
  if (/^(quest|mission|tasks)/.test(t))                                             return { cmd: 'quest' }
  if (/^(map|zone|where|world|location)/.test(t))                                   return { cmd: 'map' }
  if (/^(rank|ranking|leaderboard|kingdom)/.test(t))                               return { cmd: 'rank' }
  if (/^(save|export|backup)/.test(t))                                             return { cmd: 'save' }
  if (/^(help|\?|commands)/.test(t))                                               return { cmd: 'help' }
  return { cmd: 'unknown', raw: t }
}

// ══════════════════════════════════════════════════════════
// GAME REDUCER
// ══════════════════════════════════════════════════════════

function initPlayer(name, kingdom) {
  const k       = KINGDOMS[kingdom] || KINGDOMS.Iron
  const bonus   = k.bonus || {}
  const base    = { str: 5, agi: 5, int: 5, vit: 5 }
  const stats   = {
    str: base.str + (bonus.str || 0),
    agi: base.agi + (bonus.agi || 0),
    int: base.int + (bonus.int || 0),
    vit: base.vit + (bonus.vit || 0),
  }
  const maxHp   = 80 + stats.vit * 12
  const maxMp   = 40 + stats.int * 8
  return {
    name, kingdom, level: 1, exp: 0,
    hp: maxHp, maxHp, mp: maxMp, maxMp,
    ...stats,
    statPoints: 0,
    gold: 80,
    job: 'Wanderer', jobRevealed: false,
    equippedAtk: 0, equippedDef: 0, bonusHp: 0, bonusMp: 0,
    inventory: [],
    // play style counters
    kills: 0, trades: 0, explores: 0, spells: 0, sneaks: 0,
    currentZone: 'Capital',
  }
}

const initWorld = () => ({ zone: 'Capital', day: 1, event: null })

const initState = {
  phase: 'menu',
  player: null, world: null,
  enemy: null, enemyHp: 0,
  log: [],
  showShop: false, showSave: false, showRank: false, showStatAlloc: false,
  saveCode: '',
}

function addLog(log, text, type = 'normal') {
  return [...log, { id: Date.now() + Math.random(), text, type }]
}

// ── CORE COMMAND PROCESSOR ────────────────────────────────
function processAction(state, parsed) {
  let { player, world, enemy, enemyHp, log } = state
  const p = { ...player }
  const w = { ...world }
  let newEnemy = enemy, newEnemyHp = enemyHp
  const zone = ZONES[w.zone]

  // HELP
  if (parsed.cmd === 'help') {
    log = addLog(log, '─── COMMANDS ────────────────────────────────', 'system')
    log = addLog(log, 'explore · travel [zone] · attack · flee', 'dim')
    log = addLog(log, 'rest · shop · buy [item] · use [item]', 'dim')
    log = addLog(log, 'inventory · status · quest · map · rank · save', 'dim')
    return { ...state, log }
  }

  // STATUS
  if (parsed.cmd === 'status') {
    const k = KINGDOMS[p.kingdom]
    log = addLog(log, `─── ${p.name.toUpperCase()} ─────────────────────────────`, 'system')
    log = addLog(log, `Kingdom: ${k?.icon} ${k?.label}`, 'gold')
    log = addLog(log, `Job: ${p.jobRevealed ? (HIDDEN_JOBS[p.job]?.icon + ' ' + HIDDEN_JOBS[p.job]?.label) : '??? (Hidden — revealed at Lv 10)'}  │  Lv ${p.level}  │  ${p.exp}/${expNeeded(p.level)} EXP`, 'accent')
    log = addLog(log, `HP: ${p.hp}/${p.maxHp}  │  MP: ${p.mp}/${p.maxMp}  │  Gold: ${p.gold}g`, 'gold')
    log = addLog(log, `STR ${p.str} │ AGI ${p.agi} │ INT ${p.int} │ VIT ${p.vit}`, 'dim')
    log = addLog(log, `ATK: ${getAtk(p)} │ DEF: ${getDef(p)}${p.statPoints > 0 ? `  │  ⚡ ${p.statPoints} STAT POINTS UNSPENT` : ''}`, 'dim')
    return { ...state, player: p, world: w, log }
  }

  // INVENTORY
  if (parsed.cmd === 'inventory') {
    if (!p.inventory.length) {
      log = addLog(log, 'Your bag is empty.', 'dim')
    } else {
      log = addLog(log, `─── INVENTORY (${p.inventory.length} items) ───────────────`, 'system')
      const counts = {}
      p.inventory.forEach(i => counts[i] = (counts[i] || 0) + 1)
      Object.entries(counts).forEach(([item, cnt]) => log = addLog(log, `  ${item}${cnt > 1 ? ` ×${cnt}` : ''}`, 'dim'))
    }
    return { ...state, player: p, world: w, log }
  }

  // MAP
  if (parsed.cmd === 'map') {
    log = addLog(log, '─── WORLD MAP ───────────────────────────────', 'system')
    Object.entries(ZONES).forEach(([key, z]) => {
      const here   = key === w.zone ? ' ◄ YOU' : ''
      const danger = '⚔'.repeat(z.danger || 0) || '(safe)'
      log = addLog(log, `  ${z.icon} ${z.label}  ${danger}${here}`, key === w.zone ? 'accent' : 'dim')
    })
    if (w.event) log = addLog(log, `\n📢 ${w.event}`, 'gold')
    return { ...state, log }
  }

  // RANK
  if (parsed.cmd === 'rank') {
    return { ...state, showRank: true }
  }

  // QUEST
  if (parsed.cmd === 'quest') {
    log = addLog(log, '─── QUEST BOARD ─────────────────────────────', 'system')
    log = addLog(log, `[Main]   Uncover your true identity (reach Lv 10)`, 'dim')
    log = addLog(log, `[Daily]  Defeat 5 enemies in the ${zone.label}`, 'dim')
    log = addLog(log, `[Guild]  Accumulate 1,000 gold through trade`, 'dim')
    log = addLog(log, `[Hidden] ??? (Explore to discover)`, 'dim')
    return { ...state, log }
  }

  // TRAVEL
  if (parsed.cmd === 'travel') {
    if (enemy) { log = addLog(log, 'You cannot travel while in combat! Flee first.', 'danger'); return { ...state, log } }
    if (p.statPoints > 0) { log = addLog(log, '⚡ Allocate your stat points before continuing!', 'gold'); return { ...state, showStatAlloc: true } }
    const match = Object.entries(ZONES).find(([k, z]) =>
      z.label.toLowerCase().includes((parsed.dest||'').toLowerCase()) ||
      k.toLowerCase().includes((parsed.dest||'').toLowerCase())
    )
    if (!match) { log = addLog(log, `Unknown destination. Type 'map' to see zones.`, 'dim'); return { ...state, log } }
    const [destKey, destZone] = match
    if (destKey === w.zone) { log = addLog(log, `You're already in ${destZone.label}.`, 'dim'); return { ...state, log } }
    const reqLv = Math.max(0, (destZone.danger - 1) * 4)
    if (p.level < reqLv) { log = addLog(log, `⚠ Too dangerous. Reach Lv ${reqLv} first.`, 'danger'); return { ...state, log } }
    w.zone = destKey; p.currentZone = destKey; w.day += 1; p.explores += 1
    if (rand(1, 6) === 1) {
      w.event = pick(WORLD_EVENTS)
      log = addLog(log, `📢 WORLD EVENT: ${w.event}`, 'gold')
    }
    log = addLog(log, `You travel to the ${destZone.label}.`, 'normal')
    log = addLog(log, destZone.desc, 'dim')
    return { ...state, player: p, world: w, log, enemy: null, enemyHp: 0 }
  }

  // EXPLORE
  if (parsed.cmd === 'explore') {
    if (enemy) { log = addLog(log, `You're fighting a ${enemy}! Attack or flee first.`, 'danger'); return { ...state, log } }
    if (p.statPoints > 0) { log = addLog(log, '⚡ You have unspent stat points! Allocate them first.', 'gold'); return { ...state, showStatAlloc: true } }
    if (!zone.encounters.length) {
      log = addLog(log, `The ${zone.label} is peaceful. Travel to a danger zone to explore.`, 'dim')
      return { ...state, log }
    }
    p.explores += 1
    const roll = rand(1, 10)
    if (roll <= 5) {
      const eligible = zone.encounters.filter(e => ENEMIES[e].minLv <= p.level + 2)
      const picked   = eligible.length ? pick(eligible) : zone.encounters[0]
      const eData    = ENEMIES[picked]
      const scaledHp = Math.floor(eData.hp * (1 + (p.level - 1) * 0.05))
      log = addLog(log, pick(EXPLORE_LINES)(zone.label), 'normal')
      log = addLog(log, pick(ENCOUNTER_LINES)(picked), 'danger')
      log = addLog(log, `[${picked} — HP: ${scaledHp} | ATK: ${eData.atk} | DEF: ${eData.def}]`, 'dim')
      log = addLog(log, `Type 'attack' to fight or 'flee' to escape.`, 'dim')
      return { ...state, player: p, world: w, log, enemy: picked, enemyHp: scaledHp }
    } else if (roll <= 8) {
      const goldFound = rand(5, 15 + p.level * 3)
      const lootPool  = zone.encounters.flatMap(e => ENEMIES[e]?.loot || [])
      const lootItem  = lootPool.length && rand(1, 3) === 1 ? pick(lootPool) : null
      p.gold += goldFound
      if (lootItem) p.inventory = [...p.inventory, lootItem]
      log = addLog(log, pick(EXPLORE_LINES)(zone.label), 'normal')
      log = addLog(log, lootItem ? pick(LOOT_LINES)(lootItem, goldFound) : `You find ${goldFound} gold coins on the ground.`, 'gold')
      return { ...state, player: p, world: w, log }
    } else {
      log = addLog(log, pick(EXPLORE_LINES)(zone.label), 'normal')
      log = addLog(log, `The area is quiet. Keep exploring.`, 'dim')
      return { ...state, player: p, world: w, log }
    }
  }

  // ATTACK
  if (parsed.cmd === 'attack') {
    if (!enemy) { log = addLog(log, `No enemy nearby. Use 'explore' to find one.`, 'dim'); return { ...state, log } }
    const eData = ENEMIES[enemy]; let currentEnemyHp = newEnemyHp

    const isCrit = rand(1, 100) <= 15 + p.agi
    const isMiss = rand(1, 100) <= Math.max(5, 20 - p.agi)
    let dmg = 0
    if (!isMiss) { dmg = Math.max(1, getAtk(p) - eData.def + rand(-2, 4)); if (isCrit) dmg = Math.floor(dmg * 2.2) }
    currentEnemyHp -= dmg

    if (isMiss)      log = addLog(log, pick(MISS_LINES), 'dim')
    else if (isCrit) log = addLog(log, `${pick(CRIT_LINES)} ${dmg} damage to ${enemy}!`, 'accent')
    else             log = addLog(log, `You deal ${dmg} damage to ${enemy}. (${Math.max(0, currentEnemyHp)} HP left)`, 'normal')

    if (currentEnemyHp <= 0) {
      const gold    = rand(...eData.gold)
      const loot    = rand(1, 4) === 1 ? pick(eData.loot) : null
      const expGain = Math.floor(eData.exp * (1 + p.level * 0.02))
      p.gold += gold; if (loot) p.inventory = [...p.inventory, loot]
      p.exp += expGain; p.kills += 1
      log = addLog(log, `⚔ ${enemy} is defeated!`, 'success')
      log = addLog(log, `+${expGain} EXP  +${gold}g${loot ? `  +[${loot}]` : ''}`, 'gold')

      // Level up loop
      while (p.exp >= expNeeded(p.level)) {
        p.exp -= expNeeded(p.level); p.level += 1
        // Give 3 stat points instead of auto-distributing
        p.statPoints = (p.statPoints || 0) + 3
        // Recalc HP/MP based on current stats (they grow from allocations)
        p.maxHp = getMaxHp(p); p.hp = p.maxHp
        p.maxMp = getMaxMp(p); p.mp = p.maxMp
        log = addLog(log, `✨ LEVEL UP! You are now Lv ${p.level}!`, 'success')
        log = addLog(log, `⚡ You have ${p.statPoints} stat points to allocate!`, 'gold')

        // Job reveal at Lv 10+
        if (p.level >= 10 && !p.jobRevealed) {
          const jobKey = detectJob(p)
          if (jobKey) {
            const j = HIDDEN_JOBS[jobKey]; p.job = jobKey; p.jobRevealed = true
            log = addLog(log, ``, 'normal')
            log = addLog(log, `🌟 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'success')
            log = addLog(log, `YOUR HIDDEN JOB HAS AWAKENED!`, 'success')
            log = addLog(log, `${j.icon} ${j.label}`, 'accent')
            log = addLog(log, j.desc, 'dim')
            log = addLog(log, `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'success')
          }
        }
      }
      // Show stat alloc modal if points waiting
      const showAlloc = p.statPoints > 0
      return { ...state, player: p, world: w, log, enemy: null, enemyHp: 0, showStatAlloc: showAlloc }
    }

    // Enemy counter
    const enemyDmg = Math.max(1, eData.atk - getDef(p) + rand(-2, 3))
    p.hp = Math.max(0, p.hp - enemyDmg)
    log = addLog(log, `${pick(ENEMY_ATK(enemy))} You take ${enemyDmg} damage. (${p.hp}/${p.maxHp} HP)`, 'danger')

    if (p.hp <= 0) {
      log = addLog(log, `💀 You have fallen in battle...`, 'danger')
      log = addLog(log, `You awaken in the Capital, weakened. -20% gold lost.`, 'dim')
      p.hp = Math.floor(p.maxHp * 0.4)
      p.gold = Math.floor(p.gold * 0.8)
      return { ...state, player: p, world: { ...w, zone: 'Capital' }, log, enemy: null, enemyHp: 0 }
    }
    return { ...state, player: p, world: w, log, enemy, enemyHp: currentEnemyHp }
  }

  // FLEE
  if (parsed.cmd === 'flee') {
    if (!enemy) { log = addLog(log, `Nothing to flee from.`, 'dim'); return { ...state, log } }
    if (rand(1, 100) <= 55 + p.agi) {
      log = addLog(log, `You successfully escape from ${enemy}!`, 'normal')
      return { ...state, player: p, world: w, log, enemy: null, enemyHp: 0 }
    }
    const dmg = Math.max(1, ENEMIES[enemy].atk - getDef(p) + rand(-1, 2))
    p.hp = Math.max(1, p.hp - dmg)
    log = addLog(log, `Failed to escape! ${enemy} strikes as you run — ${dmg} damage.`, 'danger')
    return { ...state, player: p, world: w, log }
  }

  // REST
  if (parsed.cmd === 'rest') {
    if (enemy) { log = addLog(log, `Can't rest during combat!`, 'danger'); return { ...state, log } }
    const cost = w.zone === 'Capital' ? 10 : 0
    if (cost > p.gold) { log = addLog(log, `Not enough gold to rest here (${cost}g).`, 'danger'); return { ...state, log } }
    p.gold -= cost
    const hpGain = Math.floor((p.maxHp - p.hp) * 0.7)
    const mpGain = Math.floor((p.maxMp - p.mp) * 0.8)
    p.hp = Math.min(p.maxHp, p.hp + hpGain)
    p.mp = Math.min(p.maxMp, p.mp + mpGain)
    w.day += 1
    log = addLog(log, `You rest${cost ? ` (-${cost}g)` : ''}. Day ${w.day}.`, 'dim')
    log = addLog(log, `+${hpGain} HP  +${mpGain} MP`, 'success')
    return { ...state, player: p, world: w, log }
  }

  // SHOP
  if (parsed.cmd === 'shop') {
    if (w.zone !== 'Capital') { log = addLog(log, `No shop here. Travel to Aethoria Capital.`, 'dim'); return { ...state, log } }
    return { ...state, player: p, world: w, log, showShop: true }
  }

  // BUY
  if (parsed.cmd === 'buy') {
    if (w.zone !== 'Capital') { log = addLog(log, `Travel to the Capital to buy items.`, 'dim'); return { ...state, log } }
    const item = SHOP.find(s => s.name.toLowerCase().includes((parsed.item||'').toLowerCase()))
    if (!item) { log = addLog(log, `Item not found. Type 'shop' to browse.`, 'dim'); return { ...state, log } }
    if (p.gold < item.cost) { log = addLog(log, `Not enough gold. Need ${item.cost}g, have ${p.gold}g.`, 'danger'); return { ...state, log } }
    p.gold -= item.cost; p.trades += 1
    if (item.type === 'weapon')    { p.equippedAtk = item.atk }
    if (item.type === 'armor')     { p.equippedDef = item.def; if (item.intBoost) p.int += item.intBoost }
    p.inventory = [...p.inventory, item.name]
    log = addLog(log, `Purchased ${item.name} for ${item.cost}g. Remaining: ${p.gold}g`, 'gold')
    return { ...state, player: p, world: w, log }
  }

  // USE
  if (parsed.cmd === 'use') {
    const idx = p.inventory.findIndex(i => i.toLowerCase().includes((parsed.item||'').toLowerCase()))
    if (idx === -1) { log = addLog(log, `You don't have that item.`, 'dim'); return { ...state, log } }
    const name = p.inventory[idx]
    const shopItem = SHOP.find(s => s.name === name)
    p.inventory = p.inventory.filter((_, i) => i !== idx)
    if (shopItem?.hp)        { const g = Math.min(shopItem.hp, p.maxHp - p.hp); p.hp += g; log = addLog(log, `Used ${name}. +${g} HP (${p.hp}/${p.maxHp})`, 'success') }
    if (shopItem?.mp)        { const g = Math.min(shopItem.mp, p.maxMp - p.mp); p.mp += g }
    if (shopItem?.mpRestore) { const g = Math.min(shopItem.mpRestore, p.maxMp - p.mp); p.mp += g }
    if (!shopItem)             log = addLog(log, `Used ${name}.`, 'normal')
    return { ...state, player: p, world: w, log }
  }

  // SAVE
  if (parsed.cmd === 'save') {
    const code = btoa(JSON.stringify({ player: p, world: w })).replace(/=/g, '')
    saveRanking(p)
    return { ...state, player: p, world: w, log, showSave: true, saveCode: code }
  }

  // UNKNOWN
  const replies = [
    `The wind carries your words away. Type 'help' for commands.`,
    `The world doesn't respond. Try 'explore', 'attack', or 'help'.`,
    `Nothing happens. The ${zone.label} stretches before you.`,
    `An ancient voice whispers: "I don't understand."`,
  ]
  log = addLog(log, pick(replies), 'dim')
  return { ...state, log }
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_CREATE': return { ...state, phase: 'create' }
    case 'START_GAME': {
      const p = initPlayer(action.name, action.kingdom)
      const w = initWorld()
      const k = KINGDOMS[action.kingdom]
      const bonusStr = Object.entries(k.bonus).map(([s, v]) => `+${v} ${s.toUpperCase()}`).join(', ')
      const log = [
        { id: 1, text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', type: 'system' },
        { id: 2, text: `Welcome to Aethoria, ${action.name}.`, type: 'accent' },
        { id: 3, text: `You bear the crest of the ${k.label}. (${bonusStr})`, type: 'gold' },
        { id: 4, text: k.lore, type: 'dim' },
        { id: 5, text: `Your true identity is hidden — it will emerge at Level 10.`, type: 'dim' },
        { id: 6, text: `Type 'help' to see commands. Type 'explore' to begin.`, type: 'dim' },
        { id: 7, text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', type: 'system' },
      ]
      return { ...state, phase: 'play', player: p, world: w, log, enemy: null, enemyHp: 0 }
    }
    case 'LOAD_GAME': {
      try {
        const decoded = JSON.parse(atob(action.code + '=='))
        const k = KINGDOMS[decoded.player?.kingdom]
        const log = [
          { id: Date.now(),   text: `Welcome back, ${decoded.player.name}.`, type: 'accent' },
          { id: Date.now()+1, text: `${k?.icon} ${k?.label}  ·  Day ${decoded.world.day}  ·  ${ZONES[decoded.world.zone]?.label}`, type: 'gold' },
        ]
        return { ...state, phase: 'play', player: decoded.player, world: decoded.world, log, enemy: null, enemyHp: 0 }
      } catch { return state }
    }
    case 'COMMAND': {
      const parsed = parseCmd(action.input)
      if (!parsed) return state
      return processAction({ ...state, log: addLog(state.log, `> ${action.input}`, 'input') }, parsed)
    }
    case 'ALLOC_STAT': {
      const p = { ...state.player }
      if (p.statPoints <= 0) return state
      p[action.stat] = (p[action.stat] || 0) + 1
      p.statPoints -= 1
      p.maxHp = getMaxHp(p); p.hp = Math.min(p.hp + (action.stat === 'vit' ? 12 : 0), p.maxHp)
      p.maxMp = getMaxMp(p); p.mp = Math.min(p.mp + (action.stat === 'int' ? 8  : 0), p.maxMp)
      const showStatAlloc = p.statPoints > 0
      return { ...state, player: p, showStatAlloc }
    }
    case 'CLOSE_SHOP':       return { ...state, showShop: false }
    case 'CLOSE_SAVE':       return { ...state, showSave: false }
    case 'CLOSE_RANK':       return { ...state, showRank: false }
    case 'CLOSE_STAT_ALLOC': return { ...state, showStatAlloc: false }
    case 'BUY_ITEM':         return processAction({ ...state, log: addLog(state.log, `> buy ${action.itemName}`, 'input') }, { cmd: 'buy', item: action.itemName })
    case 'RESET':            return { ...initState }
    default: return state
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('aethoria_save')
    if (!raw) return initState
    return { ...initState, ...JSON.parse(raw) }
  } catch { return initState }
}

// ══════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════

function HpBar({ val, max, color }) {
  const pct = Math.max(0, Math.min(100, (val / max) * 100))
  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', height: 6, borderRadius: 3, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
    </div>
  )
}

function StatusPanel({ player, world, enemy, enemyHp }) {
  if (!player) return null
  const zone    = ZONES[world.zone]
  const k       = KINGDOMS[player.kingdom]
  const jobInfo = player.jobRevealed ? HIDDEN_JOBS[player.job] : null
  const hpColor = player.hp < player.maxHp * 0.3 ? '#ff4444' : player.hp < player.maxHp * 0.6 ? '#ffaa44' : '#44ff88'

  return (
    <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, lineHeight: 1.7, color: '#a0c8a0', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Kingdom */}
      <div style={{ border: `1px solid ${k?.color}44`, padding: '6px 10px', borderRadius: 4, background: `${k?.color}11` }}>
        <div style={{ color: k?.color, fontSize: 11, fontWeight: 'bold' }}>{k?.icon} {k?.label}</div>
      </div>

      {/* Character */}
      <div style={{ border: '1px solid #1a3a1a', padding: '10px 12px', borderRadius: 4, background: 'rgba(0,20,0,0.5)' }}>
        <div style={{ color: '#00ff88', fontWeight: 'bold', fontSize: 13, marginBottom: 4 }}>
          {jobInfo ? `${jobInfo.icon} ${jobInfo.label}` : '⚔ Wanderer'}
        </div>
        <div style={{ color: '#88ff88' }}>{player.name}</div>
        <div style={{ color: '#606060', fontSize: 11 }}>Lv {player.level}  ·  {player.exp}/{expNeeded(player.level)} EXP</div>
        {player.statPoints > 0 && (
          <div style={{ color: '#ffcc00', fontSize: 11, marginTop: 4 }}>⚡ {player.statPoints} pts unspent!</div>
        )}
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ color: hpColor }}>HP {player.hp}/{player.maxHp}</span>
            <span style={{ color: '#4488ff' }}>MP {player.mp}/{player.maxMp}</span>
          </div>
          <HpBar val={player.hp} max={player.maxHp} color={hpColor} />
          <div style={{ marginTop: 3 }}><HpBar val={player.mp} max={player.maxMp} color="#4488ff" /></div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ border: '1px solid #1a3a1a', padding: '10px 12px', borderRadius: 4, background: 'rgba(0,20,0,0.5)' }}>
        <div style={{ color: '#00ff88', fontSize: 10, marginBottom: 6, letterSpacing: 1 }}>ATTRIBUTES</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px', fontSize: 11 }}>
          {[['STR', player.str], ['AGI', player.agi], ['INT', player.int], ['VIT', player.vit]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#506050' }}>{k}</span>
              <span style={{ color: '#88cc88' }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid #1a3a1a', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
          <span style={{ color: '#506050' }}>ATK {getAtk(player)}</span>
          <span style={{ color: '#506050' }}>DEF {getDef(player)}</span>
          <span style={{ color: '#c8a830' }}>💰{player.gold}g</span>
        </div>
      </div>

      {/* Location */}
      <div style={{ border: '1px solid #1a3a1a', padding: '8px 12px', borderRadius: 4, background: 'rgba(0,20,0,0.5)' }}>
        <div style={{ color: '#88ff88' }}>{zone?.icon} {zone?.label}</div>
        <div style={{ color: '#506050', fontSize: 10 }}>Day {world.day}{zone?.danger > 0 ? `  · ${'⚔'.repeat(zone.danger)} Danger` : ''}</div>
      </div>

      {/* Enemy */}
      {enemy && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          style={{ border: '1px solid #3a1a1a', padding: '10px 12px', borderRadius: 4, background: 'rgba(30,0,0,0.6)' }}>
          <div style={{ color: '#ff4444', fontSize: 10, marginBottom: 4, letterSpacing: 1 }}>IN COMBAT</div>
          <div style={{ color: '#ff8888' }}>{enemy}</div>
          <div style={{ marginTop: 6 }}>
            <HpBar val={enemyHp} max={ENEMIES[enemy]?.hp || 100} color="#ff4444" />
          </div>
          <div style={{ marginTop: 4, fontSize: 10, color: '#604040' }}>attack · flee</div>
        </motion.div>
      )}

      <div style={{ color: '#303030', fontSize: 10, textAlign: 'center' }}>
        {player.inventory.length} items · 'rank' for standings
      </div>
    </div>
  )
}

function LogPanel({ log, logRef }) {
  const typeStyle = {
    normal: { color: '#88c888' }, dim:    { color: '#3a5a3a' },
    system: { color: '#1a4a1a' }, accent: { color: '#44ffaa' },
    danger: { color: '#ff6644' }, success:{ color: '#44ff88' },
    gold:   { color: '#c8a830' }, input:  { color: '#2a6a2a' },
  }
  return (
    <div ref={logRef} style={{ flex: 1, overflowY: 'auto', fontFamily: "'Courier New', monospace", fontSize: 13, lineHeight: 1.8, padding: '12px 16px', scrollbarWidth: 'thin', scrollbarColor: '#1a3a1a transparent' }}>
      {log.map(e => <div key={e.id} style={typeStyle[e.type] || typeStyle.normal}>{e.text}</div>)}
    </div>
  )
}

// ── Stat Allocation Modal ─────────────────────────────────
function StatAllocModal({ player, dispatch }) {
  const stats = [
    { key: 'str', label: 'STR', desc: 'Strength — ATK & carry weight' },
    { key: 'agi', label: 'AGI', desc: 'Agility — dodge, crit, speed' },
    { key: 'int', label: 'INT', desc: 'Intelligence — MP & spell power' },
    { key: 'vit', label: 'VIT', desc: 'Vitality — HP & defense' },
  ]
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,5,0,0.97)', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 400, border: '1px solid #2a6a2a', borderRadius: 6, background: '#020d02', padding: 28, fontFamily: "'Courier New', monospace" }}>
        <div style={{ color: '#00ff88', fontSize: 15, marginBottom: 4 }}>✨ LEVEL UP!</div>
        <div style={{ color: '#ffcc00', fontSize: 13, marginBottom: 4 }}>Allocate Stat Points</div>
        <div style={{ color: '#3a7a3a', fontSize: 11, marginBottom: 20 }}>
          Points remaining: <span style={{ color: '#ffcc00', fontWeight: 'bold' }}>{player.statPoints}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stats.map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #1a3a1a', borderRadius: 4, padding: '8px 12px', background: 'rgba(0,20,0,0.5)' }}>
              <div>
                <div style={{ color: '#88ff88', fontSize: 12 }}>{s.label} — {player[s.key]}</div>
                <div style={{ color: '#3a5a3a', fontSize: 10 }}>{s.desc}</div>
              </div>
              <button
                onClick={() => dispatch({ type: 'ALLOC_STAT', stat: s.key })}
                disabled={player.statPoints <= 0}
                style={{
                  width: 28, height: 28, border: '1px solid ' + (player.statPoints > 0 ? '#1a6a1a' : '#111'),
                  borderRadius: 4, background: player.statPoints > 0 ? 'rgba(0,60,0,0.5)' : 'rgba(0,0,0,0.3)',
                  color: player.statPoints > 0 ? '#44ff88' : '#2a3a2a', cursor: player.statPoints > 0 ? 'pointer' : 'default',
                  fontFamily: 'inherit', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >+</button>
            </div>
          ))}
        </div>
        {player.statPoints === 0 && (
          <button onClick={() => dispatch({ type: 'CLOSE_STAT_ALLOC' })}
            style={{ marginTop: 16, width: '100%', padding: '8px 0', background: 'rgba(0,60,0,0.4)', border: '1px solid #1a6a1a', color: '#44ff88', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
            Continue →
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ── Kingdom Ranking Modal ─────────────────────────────────
function RankModal({ onClose }) {
  const rankings = loadRankings()
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,5,0,0.97)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 560, border: '1px solid #1a5a1a', borderRadius: 6, background: '#020d02', padding: 24, fontFamily: "'Courier New', monospace", maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ color: '#00ff88', fontSize: 14, marginBottom: 4 }}>👑 KINGDOM RANKINGS</div>
        <div style={{ color: '#3a6a3a', fontSize: 11, marginBottom: 20 }}>Power Rankings by Kingdom — Score = Lv×100 + Kills×5 + Gold/10</div>
        {Object.entries(KINGDOMS).map(([kKey, kingdom]) => {
          const list = rankings[kKey] || []
          return (
            <div key={kKey} style={{ marginBottom: 20 }}>
              <div style={{ color: kingdom.color, fontSize: 12, marginBottom: 8, borderBottom: `1px solid ${kingdom.color}33`, paddingBottom: 4 }}>
                {kingdom.icon} {kingdom.label}
              </div>
              {list.length === 0 ? (
                <div style={{ color: '#2a4a2a', fontSize: 11 }}>  No adventurers yet.</div>
              ) : list.map((r, i) => (
                <div key={r.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '3px 0', borderBottom: '1px solid #0a1a0a' }}>
                  <span style={{ color: i === 0 ? '#ffcc00' : '#506050', minWidth: 20 }}>#{i + 1}</span>
                  <span style={{ color: '#88ff88', flex: 1, marginLeft: 8 }}>{r.name}</span>
                  <span style={{ color: '#3a6a3a', marginRight: 12 }}>Lv{r.level} {r.job}</span>
                  <span style={{ color: '#c8a830' }}>{r.score.toLocaleString()}pts</span>
                </div>
              ))}
            </div>
          )
        })}
        <button onClick={onClose} style={{ marginTop: 8, background: 'none', border: '1px solid #1a4a1a', color: '#3a8a3a', padding: '6px 20px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
          Close
        </button>
      </div>
    </motion.div>
  )
}

// ── Shop Modal ────────────────────────────────────────────
function ShopModal({ player, dispatch, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,8,0,0.95)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 480, border: '1px solid #1a5a1a', borderRadius: 6, background: '#020d02', padding: 24, fontFamily: "'Courier New', monospace" }}>
        <div style={{ color: '#00ff88', fontSize: 14, marginBottom: 4 }}>🏪 AETHORIA MARKET</div>
        <div style={{ color: '#3a6a3a', fontSize: 11, marginBottom: 16 }}>Gold: {player.gold}g  ·  Click to buy</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
          {SHOP.map(item => (
            <button key={item.name} onClick={() => { dispatch({ type: 'BUY_ITEM', itemName: item.name }); onClose() }}
              disabled={player.gold < item.cost}
              style={{ background: player.gold >= item.cost ? 'rgba(0,30,0,0.6)' : 'rgba(0,0,0,0.3)', border: '1px solid ' + (player.gold >= item.cost ? '#1a4a1a' : '#1a1a1a'), borderRadius: 4, padding: '8px 12px', cursor: player.gold >= item.cost ? 'pointer' : 'default', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
              <div>
                <div style={{ color: player.gold >= item.cost ? '#88ff88' : '#3a4a3a', fontSize: 12 }}>{item.name}</div>
                <div style={{ color: '#3a5a3a', fontSize: 10 }}>{item.desc}</div>
              </div>
              <div style={{ color: player.gold >= item.cost ? '#c8a830' : '#404030', fontSize: 12, whiteSpace: 'nowrap', marginLeft: 12 }}>{item.cost}g</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: 16, background: 'none', border: '1px solid #1a4a1a', color: '#3a8a3a', padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>Close</button>
      </div>
    </motion.div>
  )
}

// ── Save Modal ────────────────────────────────────────────
function SaveModal({ saveCode, onClose }) {
  const [copied, setCopied] = useState(false)
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,8,0,0.95)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 500, border: '1px solid #1a5a1a', borderRadius: 6, background: '#020d02', padding: 24, fontFamily: "'Courier New', monospace" }}>
        <div style={{ color: '#00ff88', fontSize: 14, marginBottom: 4 }}>💾 SAVE CODE</div>
        <div style={{ color: '#3a6a3a', fontSize: 11, marginBottom: 12 }}>Paste this code to restore progress on any device</div>
        <textarea readOnly value={saveCode} style={{ width: '100%', height: 90, background: 'rgba(0,20,0,0.5)', border: '1px solid #1a4a1a', borderRadius: 4, color: '#44aa44', fontSize: 10, fontFamily: 'inherit', padding: 8, resize: 'none', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={() => { navigator.clipboard.writeText(saveCode); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
            style={{ background: 'rgba(0,80,0,0.4)', border: '1px solid #1a6a1a', color: '#44ff88', padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #1a4a1a', color: '#3a8a3a', padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>Close</button>
        </div>
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// MAIN GAME PAGE
// ══════════════════════════════════════════════════════════

export default function Game() {
  const [state, dispatch]   = useReducer(gameReducer, null, loadFromStorage)
  const [input, setInput]   = useState('')
  const [createName, setCreateName] = useState('')
  const [createKingdom, setCreateKingdom] = useState(null)
  const [loadCode, setLoadCode] = useState('')
  const [showLoad, setShowLoad] = useState(false)
  const [loadError, setLoadError] = useState('')
  const logRef = useRef(null)

  // Auto-save
  useEffect(() => {
    if (state.phase === 'play' && state.player) {
      localStorage.setItem('aethoria_save', JSON.stringify({
        phase: 'play', player: state.player, world: state.world,
        log: state.log.slice(-60),
      }))
      saveRanking(state.player)
    }
  }, [state.player, state.world])

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [state.log])

  const handleCommand = e => {
    e.preventDefault()
    if (!input.trim()) return
    dispatch({ type: 'COMMAND', input: input.trim() })
    setInput('')
  }

  const handleLoad = () => {
    try {
      const decoded = JSON.parse(atob(loadCode.trim() + '=='))
      if (!decoded.player || !decoded.world) throw new Error()
      dispatch({ type: 'LOAD_GAME', code: loadCode.trim() })
      setLoadError('')
    } catch { setLoadError('Invalid save code. Please check and try again.') }
  }

  // ── MENU ────────────────────────────────────────────────
  if (state.phase === 'menu') {
    const hasSave    = !!localStorage.getItem('aethoria_save')
    const rankings   = loadRankings()
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New', monospace", padding: '80px 20px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 560, textAlign: 'center' }}>
          <pre style={{ color: '#00ff88', fontSize: 10, lineHeight: 1.3, margin: '0 0 6px', userSelect: 'none' }}>{
`  █████╗ ███████╗████████╗██╗  ██╗ ██████╗ ██████╗ ██╗ █████╗
 ██╔══██╗██╔════╝╚══██╔══╝██║  ██║██╔═══██╗██╔══██╗██║██╔══██╗
 ███████║█████╗     ██║   ███████║██║   ██║██████╔╝██║███████║
 ██╔══██║██╔══╝     ██║   ██╔══██║██║   ██║██╔══██╗██║██╔══██║
 ██║  ██║███████╗   ██║   ██║  ██║╚██████╔╝██║  ██║██║██║  ██║`}</pre>
          <div style={{ color: '#1a5a1a', fontSize: 10, marginBottom: 28, letterSpacing: 2 }}>KINGDOM OF AETHORIA  ·  AI TEXT MMORPG</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', marginBottom: 28 }}>
            <button onClick={() => dispatch({ type: 'START_CREATE' })} style={{ width: 240, padding: '10px 0', background: 'rgba(0,60,0,0.5)', border: '1px solid #1a6a1a', color: '#44ff88', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: 1 }}>▶ NEW GAME</button>
            {hasSave && (
              <button onClick={() => { const raw = localStorage.getItem('aethoria_save'); const saved = JSON.parse(raw); dispatch({ type: 'LOAD_GAME', code: btoa(JSON.stringify({ player: saved.player, world: saved.world })).replace(/=/g,'') }) }}
                style={{ width: 240, padding: '10px 0', background: 'rgba(0,40,0,0.4)', border: '1px solid #1a4a1a', color: '#3acc88', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: 1 }}>↺ CONTINUE</button>
            )}
            <button onClick={() => setShowLoad(v => !v)} style={{ width: 240, padding: '10px 0', background: 'none', border: '1px solid #1a3a1a', color: '#3a8a3a', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: 1 }}>📁 LOAD SAVE CODE</button>
            {showLoad && (
              <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea placeholder="Paste save code..." value={loadCode} onChange={e => setLoadCode(e.target.value)}
                  style={{ height: 60, background: 'rgba(0,20,0,0.6)', border: '1px solid #1a4a1a', borderRadius: 4, color: '#44aa44', fontSize: 10, fontFamily: 'inherit', padding: 8, resize: 'none' }} />
                {loadError && <div style={{ color: '#ff6644', fontSize: 10 }}>{loadError}</div>}
                <button onClick={handleLoad} style={{ padding: '6px', background: 'rgba(0,50,0,0.5)', border: '1px solid #1a5a1a', color: '#44ff88', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11 }}>Load</button>
              </div>
            )}
          </div>

          {/* Mini kingdom rankings on menu */}
          <div style={{ textAlign: 'left', border: '1px solid #1a3a1a', borderRadius: 4, padding: '12px 16px', background: 'rgba(0,8,0,0.6)' }}>
            <div style={{ color: '#1a5a1a', fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>👑 KINGDOM POWER RANKINGS</div>
            {Object.entries(KINGDOMS).map(([kKey, kingdom]) => {
              const top = (rankings[kKey] || [])[0]
              return (
                <div key={kKey} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 5 }}>
                  <span style={{ color: kingdom.color }}>{kingdom.icon} {kingdom.label}</span>
                  <span style={{ color: '#3a5a3a' }}>{top ? `#1 ${top.name} (${top.score}pts)` : '— No adventurers —'}</span>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 16, color: '#1a3a1a', fontSize: 10 }}>Hidden jobs · World events · Kingdom wars · Discover your true identity</div>
        </motion.div>
      </div>
    )
  }

  // ── CREATE ───────────────────────────────────────────────
  if (state.phase === 'create') {
    const canStart = createName.trim() && createKingdom
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New', monospace", padding: '80px 20px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 500 }}>
          <div style={{ color: '#00ff88', fontSize: 16, marginBottom: 4 }}>CREATE CHARACTER</div>
          <div style={{ color: '#1a5a1a', fontSize: 11, marginBottom: 24, lineHeight: 1.8 }}>
            Your true job class is hidden — revealed through action at Level 10.<br/>
            Choose your kingdom wisely. It shapes your destiny.
          </div>

          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: '#3a8a3a', fontSize: 10, marginBottom: 6, letterSpacing: 1 }}>YOUR NAME</div>
            <input autoFocus value={createName} onChange={e => setCreateName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && canStart && dispatch({ type: 'START_GAME', name: createName.trim(), kingdom: createKingdom })}
              placeholder="Enter your name..." maxLength={20}
              style={{ width: '100%', background: 'rgba(0,20,0,0.6)', border: '1px solid #1a5a1a', borderRadius: 4, color: '#88ff88', fontSize: 14, fontFamily: 'inherit', padding: '10px 12px', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Kingdom selection */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: '#3a8a3a', fontSize: 10, marginBottom: 10, letterSpacing: 1 }}>CHOOSE YOUR KINGDOM</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(KINGDOMS).map(([kKey, k]) => {
                const isSelected = createKingdom === kKey
                const bonusStr   = Object.entries(k.bonus).map(([s, v]) => `+${v} ${s.toUpperCase()}`).join(' · ')
                return (
                  <button key={kKey} onClick={() => setCreateKingdom(kKey)}
                    style={{ padding: '12px 16px', background: isSelected ? `${k.color}22` : 'rgba(0,15,0,0.5)', border: `1px solid ${isSelected ? k.color : '#1a3a1a'}`, borderRadius: 5, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{k.icon}</span>
                      <span style={{ color: isSelected ? k.color : '#88cc88', fontSize: 13, fontWeight: 'bold' }}>{k.label}</span>
                      {isSelected && <span style={{ color: k.color, fontSize: 10 }}>◄ SELECTED</span>}
                    </div>
                    <div style={{ color: '#506050', fontSize: 11, marginBottom: 4 }}>{k.desc}</div>
                    <div style={{ color: isSelected ? k.color : '#3a5a3a', fontSize: 10 }}>{bonusStr}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button disabled={!canStart} onClick={() => dispatch({ type: 'START_GAME', name: createName.trim(), kingdom: createKingdom })}
              style={{ padding: '10px 28px', background: canStart ? 'rgba(0,80,0,0.5)' : 'rgba(0,20,0,0.3)', border: '1px solid ' + (canStart ? '#1a6a1a' : '#111'), color: canStart ? '#44ff88' : '#2a4a2a', borderRadius: 4, cursor: canStart ? 'pointer' : 'default', fontFamily: 'inherit', fontSize: 13 }}>
              Begin Journey
            </button>
            <button onClick={() => dispatch({ type: 'RESET' })} style={{ padding: '10px 16px', background: 'none', border: '1px solid #1a3a1a', color: '#3a6a3a', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Back</button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── PLAY ─────────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 48 }}>
      {/* Top bar */}
      <div style={{ padding: '5px 16px', borderBottom: '1px solid #0a2a0a', background: 'rgba(0,8,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 10, color: '#1a6a1a', letterSpacing: 1 }}>KINGDOM OF AETHORIA</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {state.player?.statPoints > 0 && (
            <button onClick={() => dispatch({ type: 'SET', key: 'showStatAlloc', val: true })}
              style={{ background: 'rgba(60,40,0,0.6)', border: '1px solid #6a5a1a', color: '#ffcc00', padding: '3px 10px', borderRadius: 3, cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: 10 }}>
              ⚡ {state.player.statPoints} pts
            </button>
          )}
          <button onClick={() => dispatch({ type: 'COMMAND', input: 'save' })} style={{ background: 'none', border: '1px solid #1a3a1a', color: '#3a6a3a', padding: '3px 10px', borderRadius: 3, cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: 10 }}>💾</button>
          <button onClick={() => dispatch({ type: 'CLOSE_RANK' }) || dispatch({ type: 'COMMAND', input: 'rank' })} style={{ background: 'none', border: '1px solid #1a3a1a', color: '#3a6a3a', padding: '3px 10px', borderRadius: 3, cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: 10 }}>👑 Rank</button>
          <button onClick={() => { if (window.confirm('Return to menu? Progress is auto-saved.')) dispatch({ type: 'RESET' }) }} style={{ background: 'none', border: '1px solid #1a3a1a', color: '#3a6a3a', padding: '3px 10px', borderRadius: 3, cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: 10 }}>Menu</button>
        </div>
      </div>

      {/* Game area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Status panel */}
        <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid #0a2a0a', background: 'rgba(0,5,0,0.7)', padding: '12px 10px', overflowY: 'auto' }}>
          <StatusPanel player={state.player} world={state.world} enemy={state.enemy} enemyHp={state.enemyHp} />
        </div>

        {/* Log + input */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,4,0,0.85)', overflow: 'hidden' }}>
          <LogPanel log={state.log} logRef={logRef} />
          <form onSubmit={handleCommand} style={{ borderTop: '1px solid #0a2a0a', padding: '10px 16px', display: 'flex', gap: 8, flexShrink: 0 }}>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: '#1a6a1a', lineHeight: '32px', userSelect: 'none' }}>{'>'}</span>
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder="explore · attack · rest · shop · status · rank · help"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#44ff88', fontFamily: "'Courier New', monospace", fontSize: 13, lineHeight: '32px' }} />
            <button type="submit" style={{ background: 'none', border: '1px solid #1a4a1a', color: '#2a8a2a', padding: '4px 12px', borderRadius: 3, cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: 12 }}>↵</button>
          </form>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {state.showStatAlloc && state.player?.statPoints > 0 && (
            <StatAllocModal player={state.player} dispatch={dispatch} />
          )}
          {state.showShop && <ShopModal player={state.player} dispatch={dispatch} onClose={() => dispatch({ type: 'CLOSE_SHOP' })} />}
          {state.showSave && <SaveModal saveCode={state.saveCode} onClose={() => dispatch({ type: 'CLOSE_SAVE' })} />}
          {state.showRank && <RankModal onClose={() => dispatch({ type: 'CLOSE_RANK' })} />}
        </AnimatePresence>
      </div>
    </div>
  )
}
