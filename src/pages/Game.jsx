import { useState, useReducer, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ══════════════════════════════════════════════════════════
// GAME DATA
// ══════════════════════════════════════════════════════════

const ZONES = {
  Capital: { label: 'Aethoria Capital', icon: '🏰', danger: 0, desc: 'The kingdom\'s beating heart. Guilds, markets, and whispers of power.', adjacent: ['Forest', 'Mountains'], market: true, encounters: [] },
  Forest:  { label: 'Whispering Forest', icon: '🌲', danger: 1, desc: 'Ancient trees stretch endlessly. Strange lights flicker at night.', adjacent: ['Capital', 'Shadow'], encounters: ['Goblin Scout', 'Forest Wolf', 'Giant Spider'] },
  Mountains:{ label: 'Ironpeak Mountains', icon: '⛰', danger: 2, desc: 'Towering peaks rich with ore. Treacherous paths, greater rewards.', adjacent: ['Capital', 'Ruins'], encounters: ['Stone Golem', 'Iron Bat', 'Mountain Troll'] },
  Shadow:  { label: 'Shadow Depths', icon: '🌑', danger: 3, desc: 'Darkness absolute. Only fools or legends dare enter.', adjacent: ['Forest', 'Ruins'], encounters: ['Shadow Wraith', 'Void Imp', 'Dark Knight'] },
  Ruins:   { label: 'Ancient Ruins', icon: '🏛', danger: 4, desc: 'A lost civilization\'s grave. Unimaginable power — and peril.', adjacent: ['Mountains', 'Shadow'], encounters: ['Ancient Golem', 'Lich Acolyte', 'Ruin Drake'] },
}

const ENEMIES = {
  'Goblin Scout':  { hp: 30,  atk: 5,  def: 2,  exp: 20,  gold: [3,8],    minLv: 1,  loot: ['Rusty Dagger', 'Small Pouch'] },
  'Forest Wolf':   { hp: 50,  atk: 8,  def: 3,  exp: 35,  gold: [5,12],   minLv: 1,  loot: ['Wolf Pelt', 'Sharp Fang'] },
  'Giant Spider':  { hp: 60,  atk: 10, def: 2,  exp: 45,  gold: [4,10],   minLv: 2,  loot: ['Spider Silk', 'Poison Sac'] },
  'Stone Golem':   { hp: 130, atk: 14, def: 8,  exp: 85,  gold: [15,30],  minLv: 5,  loot: ['Stone Core', 'Iron Chunk'] },
  'Iron Bat':      { hp: 65,  atk: 12, def: 4,  exp: 55,  gold: [8,18],   minLv: 4,  loot: ['Bat Wing', 'Echostone'] },
  'Mountain Troll':{ hp: 190, atk: 20, def: 10, exp: 145, gold: [25,50],  minLv: 7,  loot: ['Troll Hide', 'Crude Club'] },
  'Shadow Wraith': { hp: 95,  atk: 22, def: 5,  exp: 125, gold: [20,40],  minLv: 8,  loot: ['Shadow Essence', 'Dark Shard'] },
  'Void Imp':      { hp: 80,  atk: 18, def: 6,  exp: 105, gold: [15,35],  minLv: 10, loot: ['Void Dust', 'Imp Claw'] },
  'Dark Knight':   { hp: 230, atk: 28, def: 15, exp: 210, gold: [40,80],  minLv: 13, loot: ['Dark Plate Fragment', 'Cursed Shard'] },
  'Ancient Golem': { hp: 310, atk: 35, def: 20, exp: 290, gold: [60,120], minLv: 15, loot: ['Ancient Core', 'Rune Fragment'] },
  'Lich Acolyte':  { hp: 185, atk: 40, def: 8,  exp: 330, gold: [70,140], minLv: 18, loot: ['Death Tome', 'Bone Staff'] },
  'Ruin Drake':    { hp: 520, atk: 50, def: 25, exp: 520, gold: [100,200],minLv: 22, loot: ['Drake Scale', 'Dragon Shard'] },
}

const SHOP = [
  { name: 'Health Potion',  cost: 25,  desc: 'Restore 60 HP',       type: 'consumable', hp: 60 },
  { name: 'Mana Elixir',    cost: 20,  desc: 'Restore 40 MP',       type: 'consumable', mp: 40 },
  { name: 'Elixir',         cost: 80,  desc: 'Restore 120 HP+60 MP',type: 'consumable', hp: 120, mpRestore: 60 },
  { name: 'Iron Sword',     cost: 120, desc: '+8 ATK',               type: 'weapon',     atk: 8 },
  { name: 'Silver Blade',   cost: 300, desc: '+16 ATK',              type: 'weapon',     atk: 16 },
  { name: 'Leather Armor',  cost: 100, desc: '+6 DEF',               type: 'armor',      def: 6 },
  { name: 'Chain Mail',     cost: 260, desc: '+13 DEF',              type: 'armor',      def: 13 },
  { name: 'Mage Robe',      cost: 220, desc: '+10 INT +8 MP regen',  type: 'armor',      def: 5, intBoost: 3 },
]

const HIDDEN_JOBS = {
  Berserker:  { label: 'Chaos Berserker',   icon: '⚔️',  desc: 'Born from fury. Deals massive damage when near death.', check: p => p.kills > 15 && p.str >= p.int + 2 },
  Scholar:    { label: 'Arcane Scholar',    icon: '🔮',  desc: 'Master of elemental forces. Devastating from range.', check: p => p.spells > 8 && p.int >= p.str + 2 },
  ShadowBlade:{ label: 'Shadow Blade',      icon: '🗡️', desc: 'Strikes from the dark. High crit, near-impossible to hit.', check: p => p.sneaks > 4 && p.agi >= p.str },
  MerchantPrince:{ label: 'Merchant Prince',icon: '💰', desc: 'Gold is power. Unique trading abilities, passive income.', check: p => p.trades > 12 },
  Paladin:    { label: 'Holy Paladin',      icon: '🛡️', desc: 'Combines divine magic and martial prowess.', check: p => p.str >= 8 && p.int >= 8 },
  Warden:     { label: "Nature's Warden",   icon: '🏹',  desc: 'One with the wilds. Mastery of crafting and exploration.', check: p => p.explores > 18 || p.crafts > 8 },
  VoidWalker: { label: 'Void Walker',       icon: '🌌',  desc: 'Touched by the void. Bends reality itself.', check: p => p.voidActs > 3 },
  Vanguard:   { label: 'Iron Vanguard',     icon: '🗡️', desc: 'Unbreakable frontline warrior. Impenetrable defense.', check: p => p.vit >= p.int + 3 && p.str >= 8 },
}

const WORLD_EVENTS = [
  '🏴 GOBLIN RAID — Villages under attack! Bonus rewards for defeating goblins.',
  '🎪 MERCHANT FESTIVAL — Shop prices reduced 20% in the Capital!',
  '🌕 BLOOD MOON — Monsters are stronger, but drop rare loot.',
  '⚡ MANA SURGE — Magical energy floods the world. All spells cost half MP.',
  '👑 ROYAL DECREE — The king offers bounties for clearing the Shadow Depths.',
]

const EXPLORE_LINES = [
  n => `You venture deeper into the ${n}.`,
  n => `The ${n} stretches before you, silent and vast.`,
  n => `Strange sounds echo through the ${n}.`,
  n => `Your footsteps are swallowed by the ${n}.`,
]
const ENCOUNTER_LINES = [
  e => `A ${e} emerges from the shadows!`,
  e => `The ground trembles — a ${e} attacks!`,
  e => `You hear a roar. A ${e} blocks your path!`,
  e => `Without warning, a ${e} lunges at you!`,
]
const LOOT_LINES = [
  (i, g) => `You find a hidden cache — ${i} and ${g} gold!`,
  (i, g) => `Beneath the rubble: ${i} and ${g} gold coins.`,
  (i, g) => `A glint catches your eye — ${i} (+${g}g).`,
]
const MISS_LINES  = ['You swing wide — they dodge!', 'Your attack misses!', 'They sidestep your strike!']
const CRIT_LINES  = ['CRITICAL STRIKE!', 'A devastating blow!', 'Perfect hit — CRITICAL!']
const ENEMY_ATK   = e => [`${e} retaliates!`, `${e} strikes back!`, `${e} attacks ferociously!`]

// ══════════════════════════════════════════════════════════
// ENGINE HELPERS
// ══════════════════════════════════════════════════════════

const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const pick = arr => arr[rand(0, arr.length - 1)]
const expNeeded = lv => Math.floor(100 * Math.pow(1.38, lv - 1))

function getAtk(p)  { return p.str * 2 + (p.equippedAtk || 0) }
function getDef(p)  { return p.vit + (p.equippedDef || 0) }
function getMaxHp(p){ return 80 + p.vit * 12 + (p.bonusHp || 0) }
function getMaxMp(p){ return 40 + p.int * 8  + (p.bonusMp || 0) }

function detectJob(ps) {
  for (const [key, job] of Object.entries(HIDDEN_JOBS)) {
    if (job.check(ps)) return key
  }
  return null
}

function parseCmd(raw) {
  const t = raw.toLowerCase().trim()
  if (!t) return null
  if (/^(explore|go|venture|search|scout|patrol|walk|wander|move forward|push|advance)/.test(t)) return { cmd: 'explore' }
  if (/^(travel|move to|go to|head to|journey|visit|teleport|warp)\s*(.+)/.test(t)) {
    const m = t.match(/(?:travel|move to|go to|head to|journey|visit|teleport|warp)\s*(.+)/)
    return { cmd: 'travel', dest: m ? m[1].trim() : '' }
  }
  if (/^(attack|fight|battle|strike|hit|slash|stab|kill|engage|charge)/.test(t)) return { cmd: 'attack' }
  if (/^(flee|run|escape|retreat|get out|back off|withdraw)/.test(t))             return { cmd: 'flee' }
  if (/^(rest|sleep|camp|heal|recover|meditate|sit|wait)/.test(t))               return { cmd: 'rest' }
  if (/^(shop|store|market|buy|purchase|trade|vendor|merchant)/.test(t))         return { cmd: 'shop' }
  if (/^(sell|vend|pawn|offload)/.test(t))                                       return { cmd: 'sell' }
  if (/^(buy)\s+(.+)/.test(t)) { const m = t.match(/^(?:buy)\s+(.+)/); return { cmd: 'buy', item: m[1] } }
  if (/^(use|drink|consume|eat|activate)\s+(.+)/.test(t)) { const m = t.match(/^(?:use|drink|consume|eat|activate)\s+(.+)/); return { cmd: 'use', item: m[1] } }
  if (/^(inventory|bag|items|i$|inv)/.test(t))                                   return { cmd: 'inventory' }
  if (/^(status|stats|stat|info|character|char|profile|me$|myself)/.test(t))    return { cmd: 'status' }
  if (/^(quest|quests|mission|jobs|tasks)/.test(t))                              return { cmd: 'quest' }
  if (/^(map|zone|where|location|area|world)/.test(t))                           return { cmd: 'map' }
  if (/^(save|export|backup)/.test(t))                                           return { cmd: 'save' }
  if (/^(help|\?|commands|what can|how)/.test(t))                               return { cmd: 'help' }
  return { cmd: 'unknown', raw: t }
}

// ══════════════════════════════════════════════════════════
// GAME REDUCER
// ══════════════════════════════════════════════════════════

const initPlayer = name => ({
  name, level: 1, exp: 0,
  hp: 100, maxHp: 100, mp: 50, maxMp: 50,
  str: 5, agi: 5, int: 5, vit: 5,
  gold: 80,
  job: 'Wanderer', jobRevealed: false,
  equippedAtk: 0, equippedDef: 0, bonusHp: 0, bonusMp: 0,
  inventory: [],
  // play style trackers
  kills: 0, trades: 0, crafts: 0, explores: 0, spells: 0, sneaks: 0, voidActs: 0,
})

const initWorld = () => ({
  zone: 'Capital', day: 1,
  event: null, eventDay: 0,
})

const initState = {
  phase: 'menu', // menu | create | play
  player: null,
  world: null,
  enemy: null, enemyHp: 0,
  log: [],
  showShop: false,
  showSave: false,
  saveCode: '',
}

function addLog(log, text, type = 'normal') {
  return [...log, { id: Date.now() + Math.random(), text, type }]
}

function processAction(state, action) {
  let { player, world, enemy, enemyHp, log } = state
  const p = { ...player }
  const w = { ...world }
  let newEnemy = enemy, newEnemyHp = enemyHp

  const zone = ZONES[w.zone]
  const parsed = action

  // ── HELP ──────────────────────────────────────────────
  if (parsed.cmd === 'help') {
    log = addLog(log, '─── COMMANDS ───────────────────────────────', 'system')
    log = addLog(log, 'explore · travel [zone] · attack · flee', 'dim')
    log = addLog(log, 'rest · shop/buy [item] · sell · use [item]', 'dim')
    log = addLog(log, 'inventory · status · quest · map · save', 'dim')
    log = addLog(log, 'Natural language works too — try anything!', 'dim')
    return { ...state, player: p, world: w, log }
  }

  // ── STATUS ────────────────────────────────────────────
  if (parsed.cmd === 'status') {
    log = addLog(log, `─── ${p.name.toUpperCase()} ───────────────────────────`, 'system')
    log = addLog(log, `Job: ${p.jobRevealed ? HIDDEN_JOBS[p.job]?.label || p.job : '??? (Hidden)'}  │  Lv ${p.level}  │  ${p.exp}/${expNeeded(p.level)} EXP`, 'accent')
    log = addLog(log, `HP: ${p.hp}/${p.maxHp}  │  MP: ${p.mp}/${p.maxMp}  │  Gold: ${p.gold}g`, 'gold')
    log = addLog(log, `STR ${p.str} │ AGI ${p.agi} │ INT ${p.int} │ VIT ${p.vit}`, 'dim')
    log = addLog(log, `ATK: ${getAtk(p)} │ DEF: ${getDef(p)}`, 'dim')
    return { ...state, player: p, world: w, log }
  }

  // ── INVENTORY ─────────────────────────────────────────
  if (parsed.cmd === 'inventory') {
    if (!p.inventory.length) {
      log = addLog(log, 'Your bag is empty.', 'dim')
    } else {
      log = addLog(log, `─── INVENTORY (${p.inventory.length} items) ──────────────`, 'system')
      const counts = {}
      p.inventory.forEach(i => counts[i] = (counts[i] || 0) + 1)
      Object.entries(counts).forEach(([item, cnt]) => log = addLog(log, `  ${item}${cnt > 1 ? ` ×${cnt}` : ''}`, 'dim'))
    }
    return { ...state, player: p, world: w, log }
  }

  // ── MAP ───────────────────────────────────────────────
  if (parsed.cmd === 'map') {
    log = addLog(log, '─── WORLD MAP ──────────────────────────────', 'system')
    Object.entries(ZONES).forEach(([key, z]) => {
      const here = key === w.zone ? ' ◄ YOU' : ''
      const danger = '⚔'.repeat(z.danger || 0) || '(safe)'
      log = addLog(log, `  ${z.icon} ${z.label}  ${danger}${here}`, key === w.zone ? 'accent' : 'dim')
    })
    if (w.event) log = addLog(log, `\n${w.event}`, 'gold')
    return { ...state, player: p, world: w, log }
  }

  // ── QUEST ─────────────────────────────────────────────
  if (parsed.cmd === 'quest') {
    log = addLog(log, '─── QUEST BOARD ────────────────────────────', 'system')
    log = addLog(log, `[Daily] Clear the ${zone.label}: defeat 3 enemies  (0/3)`, 'dim')
    log = addLog(log, `[Main]  Uncover your true identity (Lv 10)`, 'dim')
    log = addLog(log, `[Guild] Bring 5 Wolf Pelts to the Capital`, 'dim')
    return { ...state, player: p, world: w, log }
  }

  // ── TRAVEL ────────────────────────────────────────────
  if (parsed.cmd === 'travel') {
    if (enemy) { log = addLog(log, 'You cannot run while in combat! Flee first.', 'danger'); return { ...state, log } }
    const dest = parsed.dest || ''
    const match = Object.entries(ZONES).find(([k, z]) =>
      z.label.toLowerCase().includes(dest.toLowerCase()) ||
      k.toLowerCase().includes(dest.toLowerCase())
    )
    if (!match) {
      log = addLog(log, `Unknown destination. Use 'map' to see zones.`, 'dim')
      return { ...state, log }
    }
    const [destKey, destZone] = match
    if (destKey === w.zone) { log = addLog(log, `You're already in the ${destZone.label}.`, 'dim'); return { ...state, log } }
    const reqLv = (destZone.danger || 0) * 4
    if (p.level < reqLv) {
      log = addLog(log, `⚠ Danger level too high. Reach Lv ${reqLv} first.`, 'danger')
      return { ...state, log }
    }
    w.zone = destKey
    w.day += 1
    p.explores += 1
    if (rand(1, 6) === 1) {
      w.event = pick(WORLD_EVENTS)
      log = addLog(log, `📢 WORLD EVENT: ${w.event}`, 'gold')
    }
    log = addLog(log, `You travel to the ${destZone.label}.`, 'normal')
    log = addLog(log, destZone.desc, 'dim')
    return { ...state, player: p, world: w, log, enemy: null, enemyHp: 0 }
  }

  // ── EXPLORE ───────────────────────────────────────────
  if (parsed.cmd === 'explore') {
    if (enemy) { log = addLog(log, `You're already fighting a ${enemy}! Attack or flee.`, 'danger'); return { ...state, log } }
    if (!zone.encounters.length) {
      log = addLog(log, `The ${zone.label} is peaceful. No enemies here.`, 'dim')
      log = addLog(log, `You can shop or travel to another zone.`, 'dim')
      return { ...state, log }
    }
    p.explores += 1
    const roll = rand(1, 10)

    if (roll <= 5) {
      // encounter
      const eligibleEnemies = zone.encounters.filter(e => ENEMIES[e].minLv <= p.level + 2)
      const picked = eligibleEnemies.length ? pick(eligibleEnemies) : zone.encounters[0]
      const eData = ENEMIES[picked]
      const scaledHp = Math.floor(eData.hp * (1 + (p.level - 1) * 0.05))
      log = addLog(log, pick(EXPLORE_LINES)(zone.label), 'normal')
      log = addLog(log, pick(ENCOUNTER_LINES)(picked), 'danger')
      log = addLog(log, `[${picked} — HP: ${scaledHp} | ATK: ${eData.atk} | DEF: ${eData.def}]`, 'dim')
      log = addLog(log, `Type 'attack' to fight or 'flee' to escape.`, 'dim')
      return { ...state, player: p, world: w, log, enemy: picked, enemyHp: scaledHp }
    } else if (roll <= 8) {
      // loot
      const goldFound = rand(5, 15 + p.level * 3)
      const lootPool = zone.encounters.flatMap(e => ENEMIES[e]?.loot || [])
      const lootItem = lootPool.length && rand(1, 3) === 1 ? pick(lootPool) : null
      p.gold += goldFound
      if (lootItem) p.inventory = [...p.inventory, lootItem]
      log = addLog(log, pick(EXPLORE_LINES)(zone.label), 'normal')
      log = addLog(log, lootItem
        ? pick(LOOT_LINES)(lootItem, goldFound)
        : `You find ${goldFound} gold coins scattered on the ground.`, 'gold')
      return { ...state, player: p, world: w, log }
    } else {
      // nothing
      log = addLog(log, pick(EXPLORE_LINES)(zone.label), 'normal')
      log = addLog(log, `The area is quiet for now. Keep exploring.`, 'dim')
      return { ...state, player: p, world: w, log }
    }
  }

  // ── ATTACK ────────────────────────────────────────────
  if (parsed.cmd === 'attack') {
    if (!enemy) { log = addLog(log, `No enemy nearby. Use 'explore' to find one.`, 'dim'); return { ...state, log } }
    const eData = ENEMIES[enemy]
    let currentEnemyHp = newEnemyHp

    // Player attacks
    const isCrit = rand(1, 100) <= 15 + p.agi
    const isMiss = rand(1, 100) <= Math.max(5, 20 - p.agi)
    let dmg = 0
    if (!isMiss) {
      dmg = Math.max(1, getAtk(p) - eData.def + rand(-2, 4))
      if (isCrit) dmg = Math.floor(dmg * 2.2)
    }
    currentEnemyHp -= dmg

    if (isMiss) {
      log = addLog(log, pick(MISS_LINES), 'dim')
    } else if (isCrit) {
      log = addLog(log, `${pick(CRIT_LINES)} ${dmg} damage to ${enemy}!`, 'accent')
    } else {
      log = addLog(log, `You deal ${dmg} damage to ${enemy}. (${Math.max(0, currentEnemyHp)} HP left)`, 'normal')
    }
    p.sneaks += isMiss ? 0 : 0 // placeholder

    // Enemy dies
    if (currentEnemyHp <= 0) {
      const gold = rand(...eData.gold)
      const loot = rand(1, 4) === 1 ? pick(eData.loot) : null
      const expGain = Math.floor(eData.exp * (1 + p.level * 0.02))
      p.gold += gold
      if (loot) p.inventory = [...p.inventory, loot]
      p.exp += expGain
      p.kills += 1
      log = addLog(log, `⚔ ${enemy} is defeated!`, 'success')
      log = addLog(log, `+${expGain} EXP  +${gold}g${loot ? `  +[${loot}]` : ''}`, 'gold')

      // Level up
      while (p.exp >= expNeeded(p.level)) {
        p.exp -= expNeeded(p.level)
        p.level += 1
        p.str += rand(1,2); p.agi += rand(0,2); p.int += rand(0,2); p.vit += rand(1,2)
        p.maxHp = getMaxHp(p); p.hp = p.maxHp
        p.maxMp = getMaxMp(p); p.mp = p.maxMp
        log = addLog(log, `✨ LEVEL UP! You are now Lv ${p.level}!`, 'success')
        log = addLog(log, `HP and MP fully restored.`, 'dim')

        // Job reveal at lv 10
        if (p.level >= 10 && !p.jobRevealed) {
          const jobKey = detectJob(p)
          if (jobKey) {
            const j = HIDDEN_JOBS[jobKey]
            p.job = jobKey; p.jobRevealed = true
            log = addLog(log, ``, 'normal')
            log = addLog(log, `🌟 YOUR TRUE JOB HAS AWAKENED! 🌟`, 'success')
            log = addLog(log, `${j.icon} ${j.label}`, 'accent')
            log = addLog(log, j.desc, 'dim')
          }
        }
      }
      return { ...state, player: p, world: w, log, enemy: null, enemyHp: 0 }
    }

    // Enemy counter-attacks
    const enemyDmg = Math.max(1, eData.atk - getDef(p) + rand(-2, 3))
    p.hp = Math.max(0, p.hp - enemyDmg)
    log = addLog(log, `${pick(ENEMY_ATK(enemy))} You take ${enemyDmg} damage. (${p.hp}/${p.maxHp} HP)`, 'danger')

    if (p.hp <= 0) {
      log = addLog(log, `💀 You have fallen in battle...`, 'danger')
      log = addLog(log, `You awaken in the Capital, weakened. -30% gold.`, 'dim')
      p.hp = Math.floor(p.maxHp * 0.4)
      p.gold = Math.floor(p.gold * 0.7)
      return { ...state, player: p, world: { ...w, zone: 'Capital' }, log, enemy: null, enemyHp: 0 }
    }

    return { ...state, player: p, world: w, log, enemy, enemyHp: currentEnemyHp }
  }

  // ── FLEE ──────────────────────────────────────────────
  if (parsed.cmd === 'flee') {
    if (!enemy) { log = addLog(log, `There's nothing to flee from.`, 'dim'); return { ...state, log } }
    const success = rand(1, 100) <= 55 + p.agi
    if (success) {
      log = addLog(log, `You successfully escape from ${enemy}!`, 'normal')
      return { ...state, player: p, world: w, log, enemy: null, enemyHp: 0 }
    } else {
      const dmg = Math.max(1, ENEMIES[enemy].atk - getDef(p) + rand(-1, 2))
      p.hp = Math.max(1, p.hp - dmg)
      log = addLog(log, `Failed to escape! ${enemy} strikes as you run — ${dmg} damage.`, 'danger')
      return { ...state, player: p, world: w, log }
    }
  }

  // ── REST ──────────────────────────────────────────────
  if (parsed.cmd === 'rest') {
    if (enemy) { log = addLog(log, `You can't rest during combat!`, 'danger'); return { ...state, log } }
    const cost = w.zone === 'Capital' ? 10 : 0
    if (cost > p.gold) { log = addLog(log, `Not enough gold to rest here (${cost}g).`, 'danger'); return { ...state, log } }
    p.gold -= cost
    const hpGain = Math.floor((p.maxHp - p.hp) * 0.7)
    const mpGain = Math.floor((p.maxMp - p.mp) * 0.8)
    p.hp = Math.min(p.maxHp, p.hp + hpGain)
    p.mp = Math.min(p.maxMp, p.mp + mpGain)
    w.day += 1
    log = addLog(log, `You rest for the night${cost ? ` (-${cost}g)` : ''}.`, 'dim')
    log = addLog(log, `+${hpGain} HP  +${mpGain} MP  (Day ${w.day})`, 'success')
    return { ...state, player: p, world: w, log }
  }

  // ── SHOP (open) ───────────────────────────────────────
  if (parsed.cmd === 'shop') {
    if (w.zone !== 'Capital') { log = addLog(log, `No shop here. Travel to Aethoria Capital.`, 'dim'); return { ...state, log } }
    return { ...state, player: p, world: w, log, showShop: true }
  }

  // ── BUY ───────────────────────────────────────────────
  if (parsed.cmd === 'buy') {
    if (w.zone !== 'Capital') { log = addLog(log, `Travel to the Capital to buy items.`, 'dim'); return { ...state, log } }
    const item = SHOP.find(s => s.name.toLowerCase().includes(parsed.item?.toLowerCase() || ''))
    if (!item) { log = addLog(log, `Item not found. Type 'shop' to browse.`, 'dim'); return { ...state, log } }
    if (p.gold < item.cost) { log = addLog(log, `Not enough gold. Need ${item.cost}g, have ${p.gold}g.`, 'danger'); return { ...state, log } }
    p.gold -= item.cost
    if (item.type === 'consumable') {
      p.inventory = [...p.inventory, item.name]
    } else if (item.type === 'weapon') {
      p.equippedAtk = item.atk; p.inventory = [...p.inventory, item.name]
    } else if (item.type === 'armor') {
      p.equippedDef = item.def; if (item.intBoost) p.int += item.intBoost
      p.inventory = [...p.inventory, item.name]
    }
    log = addLog(log, `Purchased ${item.name} for ${item.cost}g. Remaining: ${p.gold}g`, 'gold')
    return { ...state, player: p, world: w, log }
  }

  // ── USE ───────────────────────────────────────────────
  if (parsed.cmd === 'use') {
    const itemName = parsed.item || ''
    const idx = p.inventory.findIndex(i => i.toLowerCase().includes(itemName.toLowerCase()))
    if (idx === -1) { log = addLog(log, `You don't have that item.`, 'dim'); return { ...state, log } }
    const name = p.inventory[idx]
    const shopItem = SHOP.find(s => s.name === name)
    p.inventory = p.inventory.filter((_, i) => i !== idx)
    if (shopItem?.hp) { const gain = Math.min(shopItem.hp, p.maxHp - p.hp); p.hp += gain; log = addLog(log, `Used ${name}. +${gain} HP (${p.hp}/${p.maxHp})`, 'success') }
    if (shopItem?.mp) { const gain = Math.min(shopItem.mp, p.maxMp - p.mp); p.mp += gain; log = addLog(log, `Used ${name}. +${gain} MP (${p.mp}/${p.maxMp})`, 'success') }
    if (shopItem?.mpRestore) { const gain = Math.min(shopItem.mpRestore, p.maxMp - p.mp); p.mp += gain }
    if (!shopItem) log = addLog(log, `Used ${name}.`, 'normal')
    return { ...state, player: p, world: w, log }
  }

  // ── SAVE ──────────────────────────────────────────────
  if (parsed.cmd === 'save') {
    const code = btoa(JSON.stringify({ player: p, world: w })).replace(/=/g, '')
    return { ...state, player: p, world: w, log, showSave: true, saveCode: code }
  }

  // ── UNKNOWN ───────────────────────────────────────────
  const unknownResponses = [
    `The wind carries your words away. Type 'help' for commands.`,
    `The world doesn't respond to that. Try 'explore', 'attack', or 'help'.`,
    `Nothing happens. The ${zone.label} stretches before you.`,
    `An ancient voice whispers: "I don't understand. Try 'help'."`,
  ]
  log = addLog(log, pick(unknownResponses), 'dim')
  return { ...state, log }
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_CREATE':
      return { ...state, phase: 'create', log: [] }
    case 'START_GAME': {
      const p = initPlayer(action.name)
      const w = initWorld()
      const log = [
        { id: 1, text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', type: 'system' },
        { id: 2, text: `Welcome to Aethoria, ${action.name}.`, type: 'accent' },
        { id: 3, text: 'You arrive in the Capital with nothing but your will.', type: 'normal' },
        { id: 4, text: 'Your true identity is hidden — it will emerge through action.', type: 'dim' },
        { id: 5, text: `Type 'help' to see commands. Type 'explore' to begin.`, type: 'dim' },
        { id: 6, text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', type: 'system' },
      ]
      return { ...state, phase: 'play', player: p, world: w, log, enemy: null, enemyHp: 0 }
    }
    case 'LOAD_GAME': {
      try {
        const decoded = JSON.parse(atob(action.code + '=='))
        const log = [
          { id: Date.now(), text: `Welcome back, ${decoded.player.name}. Your journey continues.`, type: 'accent' },
          { id: Date.now()+1, text: `Day ${decoded.world.day} — ${ZONES[decoded.world.zone]?.label}`, type: 'dim' },
        ]
        return { ...state, phase: 'play', player: decoded.player, world: decoded.world, log, enemy: null, enemyHp: 0 }
      } catch {
        return { ...state }
      }
    }
    case 'COMMAND': {
      const parsed = parseCmd(action.input)
      if (!parsed) return state
      const withInput = { ...state, log: addLog(state.log, `> ${action.input}`, 'input') }
      return processAction(withInput, parsed)
    }
    case 'CLOSE_SHOP':  return { ...state, showShop: false }
    case 'CLOSE_SAVE':  return { ...state, showSave: false }
    case 'BUY_ITEM': {
      const withInput = { ...state, log: addLog(state.log, `> buy ${action.itemName}`, 'input') }
      return processAction(withInput, { cmd: 'buy', item: action.itemName })
    }
    case 'RESET':
      return { ...initState }
    default:
      return state
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem('aethoria_save')
    if (!raw) return initState
    const saved = JSON.parse(raw)
    return { ...initState, ...saved }
  } catch { return initState }
}

// ══════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ══════════════════════════════════════════════════════════

function HpBar({ val, max, color }) {
  const pct = Math.max(0, Math.min(100, (val / max) * 100))
  return (
    <div style={{ background: 'rgba(0,0,0,0.4)', height: 6, borderRadius: 3, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.3s' }} />
    </div>
  )
}

function StatusPanel({ player, world, enemy, enemyHp }) {
  if (!player) return null
  const zone = ZONES[world.zone]
  const jobInfo = player.jobRevealed ? (HIDDEN_JOBS[player.job] || {}) : null
  const hpColor = player.hp < player.maxHp * 0.3 ? '#ff4444' : player.hp < player.maxHp * 0.6 ? '#ffaa44' : '#44ff88'

  return (
    <div style={{ fontFamily: "'Courier New', monospace", fontSize: 12, lineHeight: 1.7, color: '#a0c8a0', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Character */}
      <div style={{ border: '1px solid #1a3a1a', padding: '10px 12px', borderRadius: 4, background: 'rgba(0,20,0,0.5)' }}>
        <div style={{ color: '#00ff88', fontWeight: 'bold', fontSize: 13, marginBottom: 6 }}>
          {player.jobRevealed ? `${jobInfo?.icon} ${jobInfo?.label}` : '⚔ Wanderer'}
        </div>
        <div style={{ color: '#88ff88', marginBottom: 2 }}>{player.name}</div>
        <div style={{ color: '#606060', fontSize: 11 }}>Level {player.level}  ·  {player.exp}/{expNeeded(player.level)} EXP</div>
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
            <span style={{ color: hpColor }}>HP {player.hp}/{player.maxHp}</span>
            <span style={{ color: '#4488ff' }}>MP {player.mp}/{player.maxMp}</span>
          </div>
          <HpBar val={player.hp} max={player.maxHp} color={hpColor} />
          <div style={{ marginTop: 3 }}>
            <HpBar val={player.mp} max={player.maxMp} color="#4488ff" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ border: '1px solid #1a3a1a', padding: '10px 12px', borderRadius: 4, background: 'rgba(0,20,0,0.5)' }}>
        <div style={{ color: '#00ff88', fontSize: 11, marginBottom: 6, letterSpacing: 1 }}>ATTRIBUTES</div>
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
          <span style={{ color: '#c8a830' }}>💰 {player.gold}g</span>
        </div>
      </div>

      {/* Location */}
      <div style={{ border: '1px solid #1a3a1a', padding: '10px 12px', borderRadius: 4, background: 'rgba(0,20,0,0.5)' }}>
        <div style={{ color: '#00ff88', fontSize: 11, marginBottom: 4, letterSpacing: 1 }}>LOCATION</div>
        <div style={{ color: '#88ff88' }}>{zone?.icon} {zone?.label}</div>
        <div style={{ color: '#506050', fontSize: 11 }}>Day {world.day}</div>
        {zone?.danger > 0 && <div style={{ color: '#ff6644', fontSize: 11 }}>{'⚔'.repeat(zone.danger)} Danger zone</div>}
      </div>

      {/* Enemy */}
      {enemy && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ border: '1px solid #3a1a1a', padding: '10px 12px', borderRadius: 4, background: 'rgba(30,0,0,0.6)' }}
        >
          <div style={{ color: '#ff4444', fontSize: 11, marginBottom: 4, letterSpacing: 1 }}>IN COMBAT</div>
          <div style={{ color: '#ff8888' }}>{enemy}</div>
          <div style={{ marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 2 }}>
              <span style={{ color: '#ff6666' }}>HP {enemyHp}/{ENEMIES[enemy]?.hp}</span>
            </div>
            <HpBar val={enemyHp} max={ENEMIES[enemy]?.hp || 100} color="#ff4444" />
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: '#604040' }}>attack · flee</div>
        </motion.div>
      )}

      {/* Inventory count */}
      <div style={{ color: '#404040', fontSize: 11, textAlign: 'center' }}>
        Bag: {player.inventory.length} items  ·  type 'inventory'
      </div>
    </div>
  )
}

function LogPanel({ log, logRef }) {
  const typeStyle = {
    normal:  { color: '#88c888' },
    dim:     { color: '#3a5a3a' },
    system:  { color: '#1a4a1a' },
    accent:  { color: '#44ffaa' },
    danger:  { color: '#ff6644' },
    success: { color: '#44ff88' },
    gold:    { color: '#c8a830' },
    input:   { color: '#2a6a2a' },
  }
  return (
    <div
      ref={logRef}
      style={{
        flex: 1, overflowY: 'auto', fontFamily: "'Courier New', monospace",
        fontSize: 13, lineHeight: 1.8, padding: '12px 16px',
        scrollbarWidth: 'thin', scrollbarColor: '#1a3a1a transparent',
      }}
    >
      {log.map(entry => (
        <div key={entry.id} style={typeStyle[entry.type] || typeStyle.normal}>
          {entry.text}
        </div>
      ))}
    </div>
  )
}

function ShopModal({ player, dispatch, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,8,0,0.95)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ width: '100%', maxWidth: 480, border: '1px solid #1a5a1a', borderRadius: 6, background: '#020d02', padding: 24, fontFamily: "'Courier New', monospace" }}>
        <div style={{ color: '#00ff88', fontSize: 14, marginBottom: 4 }}>🏪 AETHORIA MARKET</div>
        <div style={{ color: '#3a6a3a', fontSize: 11, marginBottom: 16 }}>Gold: {player.gold}g  ·  Click to buy</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
          {SHOP.map(item => (
            <button
              key={item.name}
              onClick={() => { dispatch({ type: 'BUY_ITEM', itemName: item.name }); onClose() }}
              disabled={player.gold < item.cost}
              style={{
                background: player.gold >= item.cost ? 'rgba(0,30,0,0.6)' : 'rgba(0,0,0,0.3)',
                border: '1px solid ' + (player.gold >= item.cost ? '#1a4a1a' : '#1a1a1a'),
                borderRadius: 4, padding: '8px 12px', cursor: player.gold >= item.cost ? 'pointer' : 'default',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left',
              }}
            >
              <div>
                <div style={{ color: player.gold >= item.cost ? '#88ff88' : '#3a4a3a', fontSize: 12 }}>{item.name}</div>
                <div style={{ color: '#3a5a3a', fontSize: 10 }}>{item.desc}</div>
              </div>
              <div style={{ color: player.gold >= item.cost ? '#c8a830' : '#404030', fontSize: 12, whiteSpace: 'nowrap', marginLeft: 12 }}>{item.cost}g</div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: 16, background: 'none', border: '1px solid #1a4a1a', color: '#3a8a3a', padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
          Close
        </button>
      </div>
    </motion.div>
  )
}

function SaveModal({ saveCode, onClose }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(saveCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'absolute', inset: 0, background: 'rgba(0,8,0,0.95)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div style={{ width: '100%', maxWidth: 500, border: '1px solid #1a5a1a', borderRadius: 6, background: '#020d02', padding: 24, fontFamily: "'Courier New', monospace" }}>
        <div style={{ color: '#00ff88', fontSize: 14, marginBottom: 4 }}>💾 SAVE CODE</div>
        <div style={{ color: '#3a6a3a', fontSize: 11, marginBottom: 16 }}>Copy this code to restore your progress on any device</div>
        <textarea
          readOnly value={saveCode}
          style={{ width: '100%', height: 100, background: 'rgba(0,20,0,0.5)', border: '1px solid #1a4a1a', borderRadius: 4, color: '#44aa44', fontSize: 10, fontFamily: "'Courier New', monospace", padding: 8, resize: 'none', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={copy} style={{ background: 'rgba(0,80,0,0.4)', border: '1px solid #1a6a1a', color: '#44ff88', padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #1a4a1a', color: '#3a8a3a', padding: '6px 16px', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
            Close
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ══════════════════════════════════════════════════════════
// MAIN GAME PAGE
// ══════════════════════════════════════════════════════════

export default function Game() {
  const [state, dispatch] = useReducer(gameReducer, null, loadFromStorage)
  const [input, setInput] = useState('')
  const [createName, setCreateName] = useState('')
  const [loadCode, setLoadCode] = useState('')
  const [showLoad, setShowLoad] = useState(false)
  const [loadError, setLoadError] = useState('')
  const logRef = useRef(null)

  // Auto-save
  useEffect(() => {
    if (state.phase === 'play' && state.player) {
      localStorage.setItem('aethoria_save', JSON.stringify({
        phase: 'play',
        player: state.player,
        world: state.world,
        log: state.log.slice(-60),
      }))
    }
  }, [state.player, state.world, state.log, state.phase])

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
    } catch {
      setLoadError('Invalid save code. Please check and try again.')
    }
  }

  // ── MENU ────────────────────────────────────────────────
  if (state.phase === 'menu') {
    const hasSave = !!localStorage.getItem('aethoria_save')
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New', monospace", padding: '80px 20px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}>
          <pre style={{ color: '#00ff88', fontSize: 11, lineHeight: 1.3, margin: '0 0 8px', userSelect: 'none' }}>{`
 ░█████╗░███████╗████████╗██╗  ██╗ ██████╗ ██████╗ ██╗ █████╗
 ██╔══██╗██╔════╝╚══██╔══╝██║  ██║██╔═══██╗██╔══██╗██║██╔══██╗
 ███████║█████╗     ██║   ███████║██║   ██║██████╔╝██║███████║
 ██╔══██║██╔══╝     ██║   ██╔══██║██║   ██║██╔══██╗██║██╔══██║
 ██║  ██║███████╗   ██║   ██║  ██║╚██████╔╝██║  ██║██║██║  ██║
 ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝`}</pre>
          <div style={{ color: '#1a5a1a', fontSize: 11, marginBottom: 32, letterSpacing: 2 }}>KINGDOM OF AETHORIA — AI TEXT MMORPG</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
            <button onClick={() => dispatch({ type: 'START_CREATE' })}
              style={{ width: 240, padding: '10px 0', background: 'rgba(0,60,0,0.5)', border: '1px solid #1a6a1a', color: '#44ff88', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: 1 }}>
              ▶ NEW GAME
            </button>
            {hasSave && (
              <button onClick={() => {
                const raw = localStorage.getItem('aethoria_save')
                const saved = JSON.parse(raw)
                dispatch({ type: 'LOAD_GAME', code: btoa(JSON.stringify({ player: saved.player, world: saved.world })).replace(/=/g, '') })
              }}
                style={{ width: 240, padding: '10px 0', background: 'rgba(0,40,0,0.4)', border: '1px solid #1a4a1a', color: '#3acc88', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: 1 }}>
                ↺ CONTINUE
              </button>
            )}
            <button onClick={() => setShowLoad(v => !v)}
              style={{ width: 240, padding: '10px 0', background: 'none', border: '1px solid #1a3a1a', color: '#3a8a3a', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, letterSpacing: 1 }}>
              📁 LOAD SAVE CODE
            </button>

            {showLoad && (
              <div style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  placeholder="Paste your save code here..."
                  value={loadCode}
                  onChange={e => setLoadCode(e.target.value)}
                  style={{ height: 70, background: 'rgba(0,20,0,0.6)', border: '1px solid #1a4a1a', borderRadius: 4, color: '#44aa44', fontSize: 11, fontFamily: 'inherit', padding: 8, resize: 'none' }}
                />
                {loadError && <div style={{ color: '#ff6644', fontSize: 11 }}>{loadError}</div>}
                <button onClick={handleLoad} style={{ padding: '8px 0', background: 'rgba(0,50,0,0.5)', border: '1px solid #1a5a1a', color: '#44ff88', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>Load</button>
              </div>
            )}
          </div>

          <div style={{ marginTop: 40, color: '#1a3a1a', fontSize: 10, lineHeight: 1.8 }}>
            Hidden jobs · Kingdom wars · World events · AI-driven narrative<br/>
            Explore · Battle · Trade · Discover your true identity
          </div>
        </motion.div>
      </div>
    )
  }

  // ── CREATE ───────────────────────────────────────────────
  if (state.phase === 'create') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New', monospace", padding: '80px 20px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ color: '#00ff88', fontSize: 16, marginBottom: 4 }}>CREATE CHARACTER</div>
          <div style={{ color: '#1a5a1a', fontSize: 11, marginBottom: 28, lineHeight: 1.8 }}>
            Your true job class is hidden.<br/>
            It will be revealed through your actions at Level 10.
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#3a8a3a', fontSize: 11, marginBottom: 6, letterSpacing: 1 }}>YOUR NAME</div>
            <input
              autoFocus
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createName.trim() && dispatch({ type: 'START_GAME', name: createName.trim() })}
              placeholder="Enter your name..."
              maxLength={20}
              style={{ width: '100%', background: 'rgba(0,20,0,0.6)', border: '1px solid #1a5a1a', borderRadius: 4, color: '#88ff88', fontSize: 14, fontFamily: 'inherit', padding: '10px 12px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ color: '#1a4a1a', fontSize: 11, marginBottom: 20, lineHeight: 1.7 }}>
            Starting stats: STR 5 · AGI 5 · INT 5 · VIT 5<br/>
            Starting gold: 80g · Location: Aethoria Capital
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              disabled={!createName.trim()}
              onClick={() => dispatch({ type: 'START_GAME', name: createName.trim() })}
              style={{ padding: '10px 28px', background: createName.trim() ? 'rgba(0,80,0,0.5)' : 'rgba(0,20,0,0.3)', border: '1px solid ' + (createName.trim() ? '#1a6a1a' : '#111'), color: createName.trim() ? '#44ff88' : '#2a4a2a', borderRadius: 4, cursor: createName.trim() ? 'pointer' : 'default', fontFamily: 'inherit', fontSize: 13 }}>
              Begin Journey
            </button>
            <button onClick={() => dispatch({ type: 'RESET' })}
              style={{ padding: '10px 16px', background: 'none', border: '1px solid #1a3a1a', color: '#3a6a3a', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
              Back
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── PLAY ─────────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: 48 }}>
      {/* Top bar */}
      <div style={{ padding: '6px 16px', borderBottom: '1px solid #0a2a0a', background: 'rgba(0,8,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: '#1a6a1a', letterSpacing: 1 }}>
          KINGDOM OF AETHORIA
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => dispatch({ type: 'COMMAND', input: 'save' })} style={{ background: 'none', border: '1px solid #1a3a1a', color: '#3a6a3a', padding: '3px 10px', borderRadius: 3, cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: 11 }}>
            💾 Save
          </button>
          <button onClick={() => { if (window.confirm('Return to main menu? Progress is auto-saved.')) dispatch({ type: 'RESET' }) }} style={{ background: 'none', border: '1px solid #1a3a1a', color: '#3a6a3a', padding: '3px 10px', borderRadius: 3, cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: 11 }}>
            Menu
          </button>
        </div>
      </div>

      {/* Game area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Status panel */}
        <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid #0a2a0a', background: 'rgba(0,5,0,0.7)', padding: '14px 12px', overflowY: 'auto' }}>
          <StatusPanel player={state.player} world={state.world} enemy={state.enemy} enemyHp={state.enemyHp} />
        </div>

        {/* Log + input */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(0,4,0,0.85)', overflow: 'hidden' }}>
          <LogPanel log={state.log} logRef={logRef} />
          {/* Input */}
          <form onSubmit={handleCommand} style={{ borderTop: '1px solid #0a2a0a', padding: '10px 16px', display: 'flex', gap: 8, flexShrink: 0 }}>
            <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13, color: '#1a6a1a', lineHeight: '32px', userSelect: 'none' }}>{'>'}</span>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="explore · attack · rest · shop · status · help"
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#44ff88', fontFamily: "'Courier New', monospace", fontSize: 13, lineHeight: '32px' }}
            />
            <button type="submit" style={{ background: 'none', border: '1px solid #1a4a1a', color: '#2a8a2a', padding: '4px 12px', borderRadius: 3, cursor: 'pointer', fontFamily: "'Courier New', monospace", fontSize: 12 }}>↵</button>
          </form>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {state.showShop && <ShopModal player={state.player} dispatch={dispatch} onClose={() => dispatch({ type: 'CLOSE_SHOP' })} />}
          {state.showSave && <SaveModal saveCode={state.saveCode} onClose={() => dispatch({ type: 'CLOSE_SAVE' })} />}
        </AnimatePresence>
      </div>
    </div>
  )
}
