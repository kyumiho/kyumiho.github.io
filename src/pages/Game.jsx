import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'

// ══════════════════════════════════════════════════════════
// GAME CONSTANTS
// ══════════════════════════════════════════════════════════

const KINGDOMS = {
  Iron: {
    label: 'Iron Kingdom', icon: '⚔', color: 0xc06030, hexStr: '#c06030',
    desc: 'Forged in war. The strongest warriors in Aethoria hail from these red-earth lands.',
    bonus: { str: 3, vit: 2 }, affinity: ['Vanguard', 'Berserker'],
    lore: 'Where steel meets stone, warriors are born.',
    mapColor: 0x8b4513,
  },
  Arcanum: {
    label: 'Kingdom of Arcanum', icon: '✦', color: 0x8040c0, hexStr: '#8040c0',
    desc: 'Ancient towers pierce the sky. Knowledge is the only currency here.',
    bonus: { int: 3, agi: 2 }, affinity: ['Scholar', 'VoidWalker', 'ShadowBlade'],
    lore: 'The arcane arts flow through every stone.',
    mapColor: 0x4b0082,
  },
  Ocean: {
    label: 'Ocean Dominion', icon: '≈', color: 0x2060c0, hexStr: '#2060c0',
    desc: 'Masters of trade and the open sea. Balance and profit above all.',
    bonus: { str: 2, int: 2, agi: 1 }, affinity: ['MerchantPrince', 'Paladin', 'Warden'],
    lore: 'The tides answer to those who dare sail beyond.',
    mapColor: 0x006994,
  },
}

const JOBS = {
  Wanderer:      { label: 'Wanderer',       icon: '?', color: '#aaa' },
  Vanguard:      { label: 'Iron Vanguard',  icon: '🛡', color: '#c06030', kingdom: 'Iron',
    desc: 'Unbreakable wall of steel. High DEF, taunt skills.', check: p => p.kills >= 20 && p.vit >= p.int + 3 && p.str >= 10 },
  Berserker:     { label: 'Chaos Berserker',icon: '⚔', color: '#ff4444', kingdom: 'Iron',
    desc: 'Fury incarnate. Near death = double ATK.', check: p => p.kills >= 25 && p.str >= p.int + 4 && p.hp < p.maxHp * 0.4 },
  Scholar:       { label: 'Arcane Scholar', icon: '✦', color: '#8040c0', kingdom: 'Arcanum',
    desc: 'Elemental mastery. High INT skills.', check: p => p.int >= 18 && p.int >= p.str + 5 && p.explores >= 10 },
  VoidWalker:    { label: 'Void Walker',    icon: '◈', color: '#9932cc', kingdom: 'Arcanum',
    desc: 'Reality bends. Teleport and void damage.', check: p => p.zone === 'Shadow' && p.kills >= 15 && p.int >= 14 && p.explores >= 8 },
  ShadowBlade:   { label: 'Shadow Blade',   icon: '†', color: '#555577', kingdom: 'Arcanum',
    desc: 'Strike unseen. High AGI and crit.', check: p => p.agi >= 18 && p.agi >= p.str + 4 && p.kills >= 18 },
  MerchantPrince:{ label: 'Merchant Prince',icon: '◆', color: '#ffd700', kingdom: 'Ocean',
    desc: 'Gold is power. Trade bonuses, hire guards.', check: p => p.trades >= 15 && p.gold >= 2000 },
  Paladin:       { label: 'Paladin',         icon: '✟', color: '#87ceeb', kingdom: 'Ocean',
    desc: 'Holy blade and shield. Heal and smite.', check: p => p.str >= 12 && p.int >= 12 && p.kills >= 20 && p.kingdom === 'Ocean' },
  Warden:        { label: 'Warden',          icon: '◉', color: '#228b22', kingdom: 'mixed',
    desc: 'Zone guardian. High scouting and traps.', check: p => p.explores >= 25 && p.agi >= 14 },
}

const ZONES = [
  { id: 'Capital',   label: 'Capital',         icon: 'C', color: 0xd4a843, danger: 0, minLv: 1,  x: 320, y: 280, desc: 'The kingdom hub. Safe.',       adjacent: ['Forest','Mountains'], market: true  },
  { id: 'Forest',    label: 'Whispering Forest',icon: 'F', color: 0x228b22, danger: 1, minLv: 1,  x: 160, y: 200, desc: 'Dense forest. Lv1+ mobs.',     adjacent: ['Capital','Shadow']                },
  { id: 'Mountains', label: 'Ironpeak Mts',     icon: 'M', color: 0x8b7355, danger: 2, minLv: 4,  x: 480, y: 180, desc: 'Rocky peaks. Lv4+ mobs.',     adjacent: ['Capital','Ruins']                 },
  { id: 'Shadow',    label: 'Shadow Depths',    icon: 'S', color: 0x2a0a3a, danger: 3, minLv: 8,  x: 160, y: 380, desc: 'Cursed dark. Lv8+ mobs.',     adjacent: ['Forest','Ruins']                  },
  { id: 'Ruins',     label: 'Ancient Ruins',    icon: 'R', color: 0x7a6a50, danger: 4, minLv: 15, x: 480, y: 380, desc: 'Lost civilization. Lv15+.',   adjacent: ['Mountains','Shadow']              },
  { id: 'Abyss',     label: 'Abyssal Depths',   icon: 'A', color: 0x0a0020, danger: 5, minLv: 25, x: 320, y: 460, desc: 'Unknown. Lv25+.',             adjacent: ['Shadow','Ruins'],   hidden: true  },
]

const ENEMIES = {
  'Goblin Scout':    { hp:30,  atk:5,  def:2,  exp:20,  gold:[3,8],     zone:'Forest',    minLv:1,  color:0x4a8a4a, loot:['Rusty Dagger'] },
  'Forest Wolf':     { hp:50,  atk:8,  def:3,  exp:35,  gold:[5,12],    zone:'Forest',    minLv:1,  color:0x8b7355, loot:['Wolf Pelt'] },
  'Giant Spider':    { hp:60,  atk:10, def:2,  exp:45,  gold:[4,10],    zone:'Forest',    minLv:2,  color:0x4a2a4a, loot:['Spider Silk'] },
  'Stone Golem':     { hp:130, atk:14, def:8,  exp:85,  gold:[15,30],   zone:'Mountains', minLv:5,  color:0x888888, loot:['Stone Core'] },
  'Iron Bat':        { hp:65,  atk:12, def:4,  exp:55,  gold:[8,18],    zone:'Mountains', minLv:4,  color:0x444444, loot:['Bat Wing'] },
  'Mountain Troll':  { hp:190, atk:20, def:10, exp:145, gold:[25,50],   zone:'Mountains', minLv:7,  color:0x6b8b3a, loot:['Troll Hide'] },
  'Shadow Wraith':   { hp:95,  atk:22, def:5,  exp:125, gold:[20,40],   zone:'Shadow',    minLv:8,  color:0x6a0dad, loot:['Shadow Essence'] },
  'Void Imp':        { hp:80,  atk:18, def:6,  exp:105, gold:[15,35],   zone:'Shadow',    minLv:10, color:0x9932cc, loot:['Void Dust'] },
  'Dark Knight':     { hp:230, atk:28, def:15, exp:210, gold:[40,80],   zone:'Shadow',    minLv:13, color:0x222244, loot:['Dark Plate Fragment'] },
  'Ancient Golem':   { hp:310, atk:35, def:20, exp:290, gold:[60,120],  zone:'Ruins',     minLv:15, color:0xc8a876, loot:['Ancient Core'] },
  'Lich Acolyte':    { hp:185, atk:40, def:8,  exp:330, gold:[70,140],  zone:'Ruins',     minLv:18, color:0xddddff, loot:['Death Tome'] },
  'Ruin Drake':      { hp:520, atk:50, def:25, exp:520, gold:[100,200], zone:'Ruins',     minLv:22, color:0xcc4422, loot:['Drake Scale'] },
  'Abyss Demon':     { hp:800, atk:70, def:35, exp:900, gold:[200,400], zone:'Abyss',     minLv:25, color:0x330033, loot:['Demon Core'] },
  'Void Titan':      { hp:1200,atk:90, def:50, exp:1500,gold:[400,800], zone:'Abyss',     minLv:30, color:0x110011, loot:['Void Crystal'] },
}

const ITEMS = {
  'Health Potion':      { type:'consumable', cost:25,  hp:60,           desc:'Restore 60 HP' },
  'Mana Elixir':        { type:'consumable', cost:20,  mp:40,           desc:'Restore 40 MP' },
  'Elixir':             { type:'consumable', cost:80,  hp:120,  mp:60,  desc:'Restore 120 HP + 60 MP' },
  'Iron Sword':         { type:'weapon',     cost:120, atk:8,           desc:'+8 ATK' },
  'Silver Blade':       { type:'weapon',     cost:300, atk:16,          desc:'+16 ATK' },
  'Shadow Fang':        { type:'weapon',     cost:700, atk:30, agi:4,   desc:'+30 ATK +4 AGI' },
  'Leather Armor':      { type:'armor',      cost:100, def:6,           desc:'+6 DEF' },
  'Chain Mail':         { type:'armor',      cost:260, def:13,          desc:'+13 DEF' },
  'Mage Robe':          { type:'armor',      cost:220, def:10, int:3,   desc:'+10 DEF +3 INT' },
  'Dragon Scale Armor': { type:'armor',      cost:1200,def:28,          desc:'+28 DEF' },
  'Wolf Pelt':          { type:'material',   cost:15,  sell:10,         desc:'Crafting material' },
  'Spider Silk':        { type:'material',   cost:20,  sell:15,         desc:'Crafting material' },
  'Stone Core':         { type:'material',   cost:60,  sell:40,         desc:'Crafting material' },
  'Shadow Essence':     { type:'material',   cost:80,  sell:55,         desc:'Dark crafting material' },
  'Drake Scale':        { type:'material',   cost:200, sell:140,        desc:'Rare crafting material' },
  'Troll Hide':         { type:'material',   cost:45,  sell:30,         desc:'Crafting material' },
  'Rusty Dagger':       { type:'weapon',     cost:30,  atk:3,           desc:'+3 ATK (salvaged)' },
}

// Job skills — each job gets 2 active skills in combat
const JOB_SKILLS = {
  Wanderer:      [],
  Vanguard:      [
    { name: 'Iron Shield', mpCost: 20, desc: 'DEF +50% for 2 turns', effect: 'shield', color: '#c06030' },
    { name: 'Taunt',       mpCost: 15, desc: 'Enemy focuses you, reduce dmg taken', effect: 'taunt', color: '#cc8844' },
  ],
  Berserker:     [
    { name: 'Berserk',     mpCost: 0,  desc: 'Trade 30 HP for +80% ATK this turn', effect: 'berserk', color: '#ff4444' },
    { name: 'Rend',        mpCost: 25, desc: 'Bleed: enemy loses HP each turn (3 turns)', effect: 'bleed', color: '#cc2222' },
  ],
  Scholar:       [
    { name: 'Arcane Bolt', mpCost: 30, desc: 'INT×6 magic damage, ignores DEF', effect: 'arcane', color: '#8040c0' },
    { name: 'Slow Field',  mpCost: 20, desc: 'Enemy ATK -40% next 2 turns', effect: 'slow', color: '#6020a0' },
  ],
  VoidWalker:    [
    { name: 'Void Tear',   mpCost: 35, desc: 'INT×8 void dmg + 20% chance to stun', effect: 'voidtear', color: '#9932cc' },
    { name: 'Phase Shift', mpCost: 25, desc: 'Dodge next attack (1 turn)', effect: 'phase', color: '#7722aa' },
  ],
  ShadowBlade:   [
    { name: 'Shadowstrike', mpCost:20, desc: 'AGI×4 dmg, guaranteed crit if enemy HP>50%', effect: 'shadowstrike', color: '#555577' },
    { name: 'Smoke Bomb',   mpCost:15, desc: '60% flee chance + enemy misses next turn', effect: 'smoke', color: '#444466' },
  ],
  MerchantPrince:[
    { name: 'Bribe',       mpCost: 0,  desc: 'Spend 100g to end battle (keep loot)', effect: 'bribe', color: '#ffd700' },
    { name: 'Hired Blade', mpCost: 40, desc: 'Summon a guard for 1 hit (STR×5 dmg)', effect: 'hired', color: '#ddaa00' },
  ],
  Paladin:       [
    { name: 'Holy Smite',  mpCost: 30, desc: '(STR+INT)×3 holy dmg, heals 20 HP', effect: 'smite', color: '#87ceeb' },
    { name: 'Lay Hands',   mpCost: 35, desc: 'Heal 60% max HP', effect: 'heal', color: '#aaddff' },
  ],
  Warden:        [
    { name: 'Trap',        mpCost: 20, desc: 'Set trap — enemy takes 2× dmg next turn', effect: 'trap', color: '#228b22' },
    { name: 'Scout',       mpCost: 10, desc: 'Reveal enemy weakness, +30% dmg for 3 turns', effect: 'scout', color: '#338833' },
  ],
}

// Boss enemies per zone (one unique boss each)
const BOSSES = {
  Forest:    { name: 'Gnarled Ancient',  hp:400,  atk:18, def:8,  exp:600,  gold:[80,120],  color:0x1a5c1a, loot:['Ancient Bark','Wolf Pelt','Health Potion'] },
  Mountains: { name: 'Iron Colossus',    hp:800,  atk:30, def:20, exp:1200, gold:[150,250], color:0x888888, loot:['Iron Core','Stone Core','Silver Blade'] },
  Shadow:    { name: 'Lord of Shadows',  hp:700,  atk:45, def:15, exp:1500, gold:[200,300], color:0x440066, loot:['Shadow Crystal','Shadow Essence','Mana Elixir'] },
  Ruins:     { name: 'Lich King',        hp:1500, atk:60, def:25, exp:3000, gold:[400,600], color:0xaaaaff, loot:['Phylactery Shard','Death Tome','Dragon Scale Armor'] },
  Abyss:     { name: 'Abyssal God',      hp:5000, atk:120,def:60, exp:9999, gold:[1000,2000],color:0x110011, loot:['Void Crystal','Demon Core','Shadow Fang'] },
}

// Crafting recipes: [ingredient1, ingredient2] → result
const CRAFTING = [
  { needs: ['Wolf Pelt', 'Wolf Pelt'],          result: 'Leather Armor',      desc: '2× Wolf Pelt → Leather Armor' },
  { needs: ['Stone Core', 'Iron Chunk'],         result: 'Chain Mail',         desc: 'Stone Core + Iron Chunk → Chain Mail' },
  { needs: ['Shadow Essence', 'Void Dust'],      result: 'Shadow Fang',        desc: 'Shadow Essence + Void Dust → Shadow Fang' },
  { needs: ['Drake Scale', 'Ancient Core'],      result: 'Dragon Scale Armor', desc: 'Drake Scale + Ancient Core → Dragon Scale Armor' },
  { needs: ['Health Potion', 'Mana Elixir'],     result: 'Elixir',             desc: 'HP Potion + Mana Elixir → Elixir' },
  { needs: ['Rusty Dagger', 'Stone Core'],       result: 'Iron Sword',         desc: 'Rusty Dagger + Stone Core → Iron Sword' },
  { needs: ['Bat Wing', 'Spider Silk'],          result: 'Mage Robe',          desc: 'Bat Wing + Spider Silk → Mage Robe' },
  { needs: ['Demon Core', 'Void Crystal'],       result: 'Shadow Fang',        desc: 'Demon Core + Void Crystal → Shadow Fang (rare)' },
]

// Expanded world events
const WORLD_EVENTS = [
  { id:'goblin_raid',   label:'Goblin Raid!',      desc:'Goblins storm the Capital. +50% EXP in Forest for 2 days.',     effect:'exp_forest',    duration:2 },
  { id:'market_boom',   label:'Trade Boom!',        desc:'Ocean ships arrived. Shop 20% cheaper for 3 days.',             effect:'shop_discount',  duration:3 },
  { id:'dark_storm',    label:'Dark Storm',          desc:'Shadow spreads. Shadow enemies 30% stronger but 2× gold.',      effect:'shadow_buff',    duration:2 },
  { id:'ancient_curse', label:'Ancient Curse',       desc:'Ruins pulse with energy. +100% EXP in Ruins for 3 days.',      effect:'exp_ruins',      duration:3 },
  { id:'war',           label:'Kingdom War!',        desc:'Iron and Arcanum clash. PK rewards tripled.',                   effect:'pk_bonus',       duration:4 },
  { id:'bounty_hunt',   label:'Bounty Hunt',         desc:'Guild pays 2× gold for monster kills everywhere.',              effect:'gold_bonus',     duration:2 },
  { id:'mana_surge',    label:'Mana Surge',          desc:'Magic crackles. All spell damage +60% for 2 days.',            effect:'spell_boost',    duration:2 },
  { id:'dragon_sighted',label:'Dragon Sighted!',     desc:'A drake was seen near the Ruins. Boss HP −30% for 1 day.',     effect:'boss_weak',      duration:1 },
  { id:'plague',        label:'Plague',              desc:'Dark plague spreads. Enemies deal +20% dmg but drop 3× loot.', effect:'plague',         duration:3 },
  { id:'festival',      label:'Festival of Light',   desc:'Capital festival! All shop items free for 1 day.',             effect:'free_shop',      duration:1 },
]

// ══════════════════════════════════════════════════════════
// PLAYER / STATE HELPERS
// ══════════════════════════════════════════════════════════

function checkQuests(player, overworldScene) {
  const quests = player.quests || {}
  const npcQuests = [
    { id:'first_blood', goal:'kills',        target:10,   reward:{ gold:200, exp:300 }},
    { id:'rich_quick',  goal:'trades',       target:5,    reward:{ gold:300, item:'Elixir' }},
    { id:'boss_slayer', goal:'bossKills',    target:3,    reward:{ gold:1000, exp:2000 }},
    { id:'rep_grind',   goal:'reputation',   target:1000, reward:{ gold:500 }},
    { id:'relic_hunt',  goal:'inventory_all',items:['Drake Scale','Ancient Core','Void Crystal'], reward:{ gold:2000, exp:5000 }},
  ]
  npcQuests.forEach(q => {
    if (quests[q.id]) return // already completed
    let done = false
    if (q.goal === 'kills')        done = (player.kills  || 0) >= q.target
    if (q.goal === 'trades')       done = (player.trades || 0) >= q.target
    if (q.goal === 'bossKills')    done = Object.keys(player.bossKills || {}).length >= q.target
    if (q.goal === 'reputation')   done = Math.max(...Object.values(player.reputation || {0:0})) >= q.target
    if (q.goal === 'inventory_all') done = q.items.every(it => (player.inventory || []).includes(it))
    if (done) {
      player.quests = player.quests || {}
      player.quests[q.id] = true
      const r = q.reward
      if (r.gold) player.gold += r.gold
      if (r.exp)  { player.exp += r.exp; checkLevelUp(player) }
      if (r.item) player.inventory.push(r.item)
      if (overworldScene) {
        overworldScene.showNotification(`QUEST COMPLETE!`, `+${r.gold||0}g${r.exp?` +${r.exp}EXP`:''}${r.item?` +${r.item}`:''}`, '#ffd700')
      }
    }
  })
}

function checkLevelUp(player) {
  while (player.exp >= expNeeded(player.level)) {
    player.exp -= expNeeded(player.level)
    player.level++
    player.statPoints = (player.statPoints||0) + 3
    player.maxHp = getMaxHp(player)
    player.hp    = player.maxHp
    player.maxMp = getMaxMp(player)
    player.mp    = player.maxMp
  }
}

function expNeeded(lv) { return Math.floor(100 * Math.pow(1.35, lv - 1)) }
function getMaxHp(p) { return 80 + p.vit * 12 + p.level * 8 }
function getMaxMp(p) { return 40 + p.int * 8 + p.level * 4 }
function getAtk(p)   { return p.str * 2 + p.weaponAtk + (p.job === 'Berserker' && p.hp < p.maxHp * 0.4 ? Math.floor(p.str * 2) : 0) }
function getDef(p)   { return Math.floor(p.vit * 0.8) + p.armorDef }

function initPlayer(name, kingdom) {
  const k = KINGDOMS[kingdom]
  const b = k.bonus
  const p = {
    name, kingdom,
    level: 1, exp: 0, statPoints: 0,
    str: 5 + (b.str||0), agi: 5 + (b.agi||0), int: 5 + (b.int||0), vit: 5 + (b.vit||0),
    weaponAtk: 0, armorDef: 0,
    job: 'Wanderer',
    zone: 'Capital',
    x: 320, y: 280,
    gold: 50,
    inventory: ['Health Potion', 'Health Potion'],
    equipment: { weapon: null, armor: null },
    kills: 0, explores: 0, trades: 0,
    reputation: { Iron: 0, Arcanum: 0, Ocean: 0 },
    pkKills: 0, pkDeaths: 0,
    worldDay: 1,
    reputation: { Iron: 0, Arcanum: 0, Ocean: 0 },
    bossKills: {},
    statusEffects: {},
    quests: {},
    title: '',
  }
  p.maxHp = getMaxHp(p)
  p.hp = p.maxHp
  p.maxMp = getMaxMp(p)
  p.mp = p.maxMp
  return p
}

function rankScore(p) {
  const repBonus = Object.values(p.reputation || {}).reduce((a,b)=>a+b,0)
  const bossBonus = Object.values(p.bossKills || {}).length * 500
  return p.level * 100 + p.kills * 5 + Math.floor(p.gold / 10) + p.pkKills * 20 + repBonus + bossBonus
}

function getRepTitle(rep) {
  if (rep >= 5000) return 'Legend'
  if (rep >= 2000) return 'Champion'
  if (rep >= 800)  return 'Hero'
  if (rep >= 300)  return 'Defender'
  if (rep >= 100)  return 'Known'
  if (rep >= 0)    return 'Neutral'
  if (rep >= -100) return 'Suspect'
  return 'Enemy'
}

function gainRep(player, kingdom, amount) {
  if (!player.reputation) player.reputation = { Iron: 0, Arcanum: 0, Ocean: 0 }
  player.reputation[kingdom] = (player.reputation[kingdom] || 0) + amount
  // Gaining rep with one kingdom costs rep with rival
  const rivals = { Iron: 'Arcanum', Arcanum: 'Iron', Ocean: null }
  if (rivals[kingdom]) player.reputation[rivals[kingdom]] = (player.reputation[rivals[kingdom]] || 0) - Math.floor(amount * 0.3)
}

function saveRanking(player) {
  try {
    const key = 'aethoria_rankings'
    const data = JSON.parse(localStorage.getItem(key) || '{}')
    const k = player.kingdom || 'Iron'
    if (!data[k]) data[k] = []
    data[k] = data[k].filter(r => r.name !== player.name)
    data[k].push({ name: player.name, level: player.level, job: player.job, kills: player.kills, gold: player.gold, pkKills: player.pkKills, score: rankScore(player) })
    data[k].sort((a, b) => b.score - a.score)
    data[k] = data[k].slice(0, 10)
    localStorage.setItem(key, JSON.stringify(data))
  } catch(e) {}
}

function loadRankings() {
  try { return JSON.parse(localStorage.getItem('aethoria_rankings') || '{}') } catch(e) { return {} }
}

function saveGame(player) {
  try { localStorage.setItem('aethoria_save', JSON.stringify(player)) } catch(e) {}
}

function loadGame() {
  try {
    const s = localStorage.getItem('aethoria_save')
    if (!s) return null
    const p = JSON.parse(s)
    p.maxHp = getMaxHp(p); p.maxMp = getMaxMp(p)
    return p
  } catch(e) { return null }
}

// ══════════════════════════════════════════════════════════
// PHASER SCENES
// ══════════════════════════════════════════════════════════

// Shared state bridge between React and Phaser
const bridge = { player: null, callbacks: {} }

// ── BootScene: draw all pixel-art textures programmatically ──
class BootScene extends Phaser.Scene {
  constructor() { super('Boot') }

  create() {
    this.createTextures()
    this.scene.start('Overworld')
  }

  createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false })

    // Player sprite 16x16
    g.clear()
    g.fillStyle(0xf5deb3); g.fillRect(5,1,6,6)   // head
    g.fillStyle(0x4169e1); g.fillRect(4,7,8,6)    // body
    g.fillStyle(0xf5deb3); g.fillRect(2,8,3,5)    // left arm
    g.fillStyle(0xf5deb3); g.fillRect(11,8,3,5)   // right arm
    g.fillStyle(0x4169e1); g.fillRect(4,13,3,3)   // left leg
    g.fillStyle(0x4169e1); g.fillRect(9,13,3,3)   // right leg
    g.fillStyle(0xd4a800); g.fillRect(6,2,4,1)    // hair
    g.generateTexture('player', 16, 16)

    // Enemy sprites
    const enemyDefs = [
      { key:'enemy_goblin',  body:0x4a8a4a, head:0x6ab86a },
      { key:'enemy_wolf',    body:0x8b7355, head:0xa08060 },
      { key:'enemy_golem',   body:0x888888, head:0xaaaaaa },
      { key:'enemy_wraith',  body:0x6a0dad, head:0x9a3ddd },
      { key:'enemy_knight',  body:0x222244, head:0x444488 },
      { key:'enemy_drake',   body:0xcc4422, head:0xff6644 },
      { key:'enemy_demon',   body:0x330033, head:0x660066 },
    ]
    enemyDefs.forEach(({ key, body, head }) => {
      g.clear()
      g.fillStyle(head); g.fillRect(4,1,8,7)
      g.fillStyle(body); g.fillRect(3,8,10,6)
      g.fillStyle(body); g.fillRect(1,9,3,4)
      g.fillStyle(body); g.fillRect(12,9,3,4)
      g.fillStyle(body); g.fillRect(4,14,3,3)
      g.fillStyle(body); g.fillRect(9,14,3,3)
      g.fillStyle(0xff2222); g.fillRect(5,3,2,2); g.fillRect(9,3,2,2) // eyes
      g.generateTexture(key, 16, 16)
    })

    // Tiles 16x16
    const tiles = [
      { key:'tile_grass',    base:0x2d5a1b, detail:0x3a7a25 },
      { key:'tile_dark',     base:0x0a0a1a, detail:0x15152a },
      { key:'tile_stone',    base:0x555555, detail:0x444444 },
      { key:'tile_water',    base:0x1a4d8a, detail:0x2060aa },
      { key:'tile_sand',     base:0xc8a850, detail:0xd4b860 },
      { key:'tile_ruin',     base:0x7a6a50, detail:0x6a5a40 },
      { key:'tile_abyss',    base:0x080010, detail:0x100020 },
    ]
    tiles.forEach(({ key, base, detail }) => {
      g.clear()
      g.fillStyle(base); g.fillRect(0,0,16,16)
      g.fillStyle(detail)
      for (let i = 0; i < 4; i++) {
        const rx = Math.floor(Math.random()*14)
        const ry = Math.floor(Math.random()*14)
        g.fillRect(rx, ry, 2, 2)
      }
      g.generateTexture(key, 16, 16)
    })

    // Tree 16x16
    g.clear()
    g.fillStyle(0x4a2e0a); g.fillRect(6,10,4,6)
    g.fillStyle(0x1a6a1a); g.fillRect(2,5,12,8)
    g.fillStyle(0x228b22); g.fillRect(4,2,8,6)
    g.fillStyle(0x2aaa2a); g.fillRect(6,0,4,4)
    g.generateTexture('tree', 16, 16)

    // Rock
    g.clear()
    g.fillStyle(0x888888); g.fillRect(2,6,12,8)
    g.fillStyle(0x999999); g.fillRect(4,4,8,4)
    g.fillStyle(0x666666); g.fillRect(2,12,12,2)
    g.generateTexture('rock', 16, 16)

    // Building
    g.clear()
    g.fillStyle(0x8b7355); g.fillRect(2,6,12,10)
    g.fillStyle(0xcc4422); g.fillRect(0,4,16,4)
    g.fillStyle(0x5a3a1a); g.fillRect(6,10,4,6)
    g.fillStyle(0xaaffff); g.fillRect(3,8,3,3); g.fillRect(10,8,3,3)
    g.generateTexture('building', 16, 16)

    // Portal
    g.clear()
    g.fillStyle(0x8800ff); g.fillRect(4,2,8,12)
    g.fillStyle(0xaa44ff); g.fillRect(6,4,4,8)
    g.fillStyle(0xffffff); g.fillRect(7,6,2,4)
    g.generateTexture('portal', 16, 16)

    // Chest
    g.clear()
    g.fillStyle(0x8b6914); g.fillRect(1,6,14,8)
    g.fillStyle(0xd4a800); g.fillRect(0,5,16,3)
    g.fillStyle(0x555500); g.fillRect(6,8,4,3)
    g.generateTexture('chest', 16, 16)

    // NPC
    g.clear()
    g.fillStyle(0xffe4b5); g.fillRect(5,1,6,6)
    g.fillStyle(0xcc4422); g.fillRect(4,7,8,6)
    g.fillStyle(0xffe4b5); g.fillRect(2,8,3,5)
    g.fillStyle(0xffe4b5); g.fillRect(11,8,3,5)
    g.fillStyle(0x8b4513); g.fillRect(4,13,3,3)
    g.fillStyle(0x8b4513); g.fillRect(9,13,3,3)
    g.fillStyle(0xffd700); g.fillRect(5,0,6,3) // crown
    g.generateTexture('npc', 16, 16)

    // Sword item drop
    g.clear()
    g.fillStyle(0xcccccc); g.fillRect(7,1,2,10)
    g.fillStyle(0xd4a800); g.fillRect(4,8,8,2)
    g.fillStyle(0x888888); g.fillRect(6,11,4,4)
    g.generateTexture('item_sword', 16, 16)

    // Potion item drop
    g.clear()
    g.fillStyle(0xff6688); g.fillRect(5,4,6,9)
    g.fillStyle(0xffffff); g.fillRect(6,5,2,3)
    g.fillStyle(0x888888); g.fillRect(6,2,4,3)
    g.fillStyle(0x888888); g.fillRect(7,1,2,2)
    g.generateTexture('item_potion', 16, 16)

    // Coin
    g.clear()
    g.fillStyle(0xffd700); g.fillRect(4,3,8,10)
    g.fillStyle(0xffee00); g.fillRect(5,4,6,8)
    g.fillStyle(0xcc9900); g.fillRect(6,6,4,4)
    g.generateTexture('coin', 16, 16)

    // UI panel bg
    g.clear()
    g.fillStyle(0x000000, 0.85); g.fillRect(0,0,1,1)
    g.generateTexture('panel', 1, 1)

    g.destroy()
  }
}

// ── OverworldScene ──
class OverworldScene extends Phaser.Scene {
  constructor() { super('Overworld') }

  create() {
    this.player = bridge.player
    this.cameras.main.setBackgroundColor('#0d1117')
    this.buildMap()
    this.createPlayer()
    this.createUI()
    this.createAnimations()
    this.setupInput()
    this.setupWorldTimer()

    // Spawn world event notification if active
    if (bridge.worldEvent) {
      this.showNotification(bridge.worldEvent.label, bridge.worldEvent.desc, '#ffdd44')
    }

    // Register scene-level callbacks
    bridge.callbacks.openShop = () => this.scene.start('Shop', { player: this.player })
    bridge.callbacks.openMap  = () => this.openZoneMap()
    bridge.callbacks.openRank = () => this.scene.launch('Rankings', { player: this.player })

    this.events.on('playerUpdate', () => this.updateUI())
  }

  buildMap() {
    const TILE = 16
    const MAP_W = 40, MAP_H = 30

    // Zone-based tile map
    const zoneMap = {
      Capital:   { tile: 'tile_sand',  x: [15,25], y: [14,21] },
      Forest:    { tile: 'tile_grass', x: [2,16],  y: [7,22]  },
      Mountains: { tile: 'tile_stone', x: [26,38], y: [7,20]  },
      Shadow:    { tile: 'tile_dark',  x: [2,16],  y: [22,28] },
      Ruins:     { tile: 'tile_ruin',  x: [26,38], y: [21,28] },
      Abyss:     { tile: 'tile_abyss', x: [15,25], y: [26,30] },
    }

    this.tileGroup = this.add.group()

    for (let ty = 0; ty < MAP_H; ty++) {
      for (let tx = 0; tx < MAP_W; tx++) {
        let tileKey = 'tile_grass'
        Object.values(zoneMap).forEach(z => {
          if (tx >= z.x[0] && tx < z.x[1] && ty >= z.y[0] && ty < z.y[1]) tileKey = z.tile
        })
        this.add.image(tx * TILE + 8, ty * TILE + 8, tileKey)
      }
    }

    // Place zone decorations
    this.placeDecorations()

    // Place zone portals (transition points)
    this.portals = this.physics.add.staticGroup()
    ZONES.forEach(zone => {
      if (zone.hidden && !bridge.discoveredZones?.includes(zone.id)) return
      const p = this.portals.create(zone.x, zone.y, 'portal')
      p.zoneId = zone.id
      p.setAlpha(0.8)

      const lbl = this.add.text(zone.x, zone.y + 12, zone.label, {
        font: '6px monospace', fill: '#ffffff', stroke: '#000000', strokeThickness: 2
      }).setOrigin(0.5, 0)
      lbl.setDepth(5)
    })

    // Place NPCs at capital
    this.npcs = this.physics.add.staticGroup()
    const npcPositions = [
      { x: 296, y: 264, name: 'Guild Master',
        dialog: ['Welcome, adventurer.', 'Kill 10 Goblins — earn your first rank.', 'Find hidden jobs through experience.', 'Press B near a zone portal to fight the boss!'],
        quest: { id:'first_blood', label:'First Blood', goal:'kills', target:10, reward:{ gold:200, exp:300 }, desc:'Kill 10 enemies.' }
      },
      { x: 344, y: 264, name: 'Shop Keeper',
        dialog: ['Buy, sell, or trade!', 'Press E to open the shop.', 'Craft materials into gear with C!'],
        quest: { id:'rich_quick', label:'Supply Run', goal:'trades', target:5, reward:{ gold:300, item:'Elixir' }, desc:'Buy or sell 5 times.' }
      },
      { x: 320, y: 300, name: 'Chronicle',
        dialog: ['The world records your deeds.', 'Rankings update with each kill.', 'Defeat bosses to climb the leaderboard!', 'Kill all 5 zone bosses to be crowned Champion.'],
        quest: { id:'boss_slayer', label:'Boss Slayer', goal:'bossKills', target:3, reward:{ gold:1000, exp:2000 }, desc:'Defeat 3 zone bosses.' }
      },
      { x: 280, y: 300, name: 'Old Hermit',
        dialog: ['I sense great darkness in the Abyss...', 'Three relics seal the Abyssal God.', 'Drake Scale, Ancient Core, Void Crystal — bring them to me.', 'Then you may face the true final boss.'],
        quest: { id:'relic_hunt', label:'Relic Hunt', goal:'inventory_all', items:['Drake Scale','Ancient Core','Void Crystal'], reward:{ gold:2000, exp:5000, unlock:'AbyssGod' }, desc:'Collect 3 relics for the hermit.' }
      },
      { x: 360, y: 300, name: 'Kingdom Envoy',
        dialog: ['Each kingdom seeks loyal champions.', 'Build reputation through battle.', 'Reach 1000 rep with your kingdom for a title!', 'True power comes from mastering all kingdoms.'],
        quest: { id:'rep_grind', label:'Kingdom Champion', goal:'reputation', target:1000, reward:{ gold:500, title:'Champion' }, desc:'Reach 1000 reputation with your home kingdom.' }
      },
    ]
    npcPositions.forEach(n => {
      const npc = this.npcs.create(n.x, n.y, 'npc')
      npc.npcData = n
      npc.setDepth(3)
      this.add.text(n.x, n.y - 10, n.name, {
        font: '5px monospace', fill: '#ffdd44', stroke: '#000', strokeThickness: 2
      }).setOrigin(0.5, 1).setDepth(6)
    })

    // World boundary
    this.physics.world.setBounds(0, 0, MAP_W * TILE, MAP_H * TILE)
  }

  placeDecorations() {
    const decors = [
      // Forest trees
      ...[...Array(20)].map(() => ({ x: Phaser.Math.Between(32, 250), y: Phaser.Math.Between(112, 352), key: 'tree' })),
      // Mountain rocks
      ...[...Array(15)].map(() => ({ x: Phaser.Math.Between(416, 610), y: Phaser.Math.Between(112, 320), key: 'rock' })),
      // Capital buildings
      { x: 272, y: 240, key: 'building' }, { x: 368, y: 240, key: 'building' },
      { x: 256, y: 288, key: 'building' }, { x: 384, y: 288, key: 'building' },
      // Ruins structures
      ...[...Array(8)].map(() => ({ x: Phaser.Math.Between(416, 608), y: Phaser.Math.Between(336, 448), key: 'rock' })),
    ]
    decors.forEach(d => {
      const s = this.add.image(d.x, d.y, d.key)
      s.setDepth(2)
    })
  }

  createPlayer() {
    const p = this.player
    const zone = ZONES.find(z => z.id === p.zone)
    this.playerSprite = this.physics.add.sprite(zone ? zone.x : 320, zone ? zone.y : 280, 'player')
    this.playerSprite.setCollideWorldBounds(true)
    this.playerSprite.setDepth(4)
    this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1)
    this.cameras.main.setZoom(2)

    // HP bar above player
    this.hpBarBg = this.add.rectangle(0, -12, 18, 3, 0x330000).setDepth(10)
    this.hpBar   = this.add.rectangle(0, -12, 18, 3, 0x00ff00).setDepth(11)

    // Name tag
    this.nameTag = this.add.text(0, -18, p.name, {
      font: '5px monospace', fill: '#ffffff', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5, 1).setDepth(12)
  }

  createUI() {
    // Fixed UI (not affected by camera)
    this.statusText = this.add.text(8, 8,  '', { font: '8px monospace', fill: '#00ff88', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(100)
    this.zoneText   = this.add.text(8, 60, '', { font: '7px monospace', fill: '#ffdd44', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(100)
    this.msgText    = this.add.text(8, 80, '', { font: '6px monospace', fill: '#aaccff', stroke: '#000', strokeThickness: 2, wordWrap:{width:200} }).setScrollFactor(0).setDepth(100)
    this.eventText  = this.add.text(8, 130,'', { font: '6px monospace', fill: '#ff8844', stroke: '#000', strokeThickness: 2 }).setScrollFactor(0).setDepth(100)

    // Bottom bar
    const W = this.scale.width
    const H = this.scale.height
    this.bottomBar = this.add.rectangle(0, H - 20, W, 20, 0x000000, 0.8).setOrigin(0,0).setScrollFactor(0).setDepth(99)
    this.helpText  = this.add.text(8, H - 16, 'WASD:Move  E:Shop  K:Fight  B:Boss  I:Inv  C:Craft  Q:Quests  M:Map  P:Rep  R:Rank', {
      font: '6px monospace', fill: '#888888'
    }).setScrollFactor(0).setDepth(100)

    this.updateUI()
  }

  updateUI() {
    const p = this.player
    const hp = `HP ${p.hp}/${p.maxHp}`
    const mp = `MP ${p.mp}/${p.maxMp}`
    const job = JOBS[p.job] || JOBS.Wanderer
    this.statusText.setText(
      `${p.name} [${job.label}] Lv.${p.level}\n${hp}  ${mp}\nATK:${getAtk(p)} DEF:${getDef(p)}  Gold:${p.gold}g\nSTR:${p.str} AGI:${p.agi} INT:${p.int} VIT:${p.vit}${p.statPoints > 0 ? `  [!${p.statPoints}pts]` : ''}`
    )
    const zone = ZONES.find(z => z.id === p.zone)
    this.zoneText.setText(zone ? `Zone: ${zone.label}  Danger: ${'★'.repeat(zone.danger)}` : '')

    if (bridge.worldEvent) {
      this.eventText.setText(`EVENT: ${bridge.worldEvent.label}`)
    }

    // Update HP bar on player sprite
    if (this.playerSprite) {
      const ratio = p.hp / p.maxHp
      const W = this.cameras.main.zoom > 0 ? 18 : 18
      this.hpBar.width = Math.max(1, Math.floor(18 * ratio))
      this.hpBar.fillColor = ratio > 0.5 ? 0x00ff00 : ratio > 0.25 ? 0xffaa00 : 0xff2200
    }

    // Check hidden job unlock
    if (p.level >= 10 && p.job === 'Wanderer') {
      Object.entries(JOBS).forEach(([key, job]) => {
        if (job.check && job.check(p)) {
          this.unlockJob(key)
        }
      })
    }
  }

  unlockJob(key) {
    const job = JOBS[key]
    bridge.player.job = key
    this.showNotification(`HIDDEN JOB UNLOCKED!`, `${job.icon} ${job.label}\n${job.desc}`, '#ffdd44')
    this.spawnParticles(this.playerSprite?.x || 320, this.playerSprite?.y || 280, 0xffd700, 20)
    saveGame(bridge.player)
    saveRanking(bridge.player)
  }

  spawnParticles(x, y, color, count = 12) {
    for (let i = 0; i < count; i++) {
      const px = this.add.rectangle(x, y, 3, 3, color).setDepth(20)
      const angle = (i / count) * Math.PI * 2
      const speed = Phaser.Math.Between(30, 80)
      this.tweens.add({
        targets: px,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0, scaleX: 0, scaleY: 0,
        duration: Phaser.Math.Between(400, 800),
        ease: 'Power2',
        onComplete: () => px.destroy(),
      })
    }
  }

  showNotification(title, body, color = '#ffffff') {
    const W = this.scale.width
    const box = this.add.rectangle(W/2, 40, W - 40, 40, 0x000000, 0.9).setScrollFactor(0).setDepth(200)
    box.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(color.replace('#','')).color)
    const t1 = this.add.text(W/2, 28, title, { font: '8px monospace', fill: color, stroke: '#000', strokeThickness: 2 }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(201)
    const t2 = this.add.text(W/2, 40, body,  { font: '6px monospace', fill: '#ffffff', stroke: '#000', strokeThickness: 2, align: 'center' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(201)
    this.time.delayedCall(3000, () => { box.destroy(); t1.destroy(); t2.destroy() })
  }

  showMessage(msg, color = '#aaccff') {
    this.msgText.setStyle({ fill: color })
    this.msgText.setText(msg)
    this.time.delayedCall(3000, () => this.msgText.setText(''))
  }

  createAnimations() {
    // Simple bob animation via tween
    this.tweens.add({
      targets: this.playerSprite,
      y: '-=1',
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys('W,A,S,D')

    // Interaction key
    this.input.keyboard.on('keydown-E', () => this.interact())
    this.input.keyboard.on('keydown-I', () => this.openInventory())
    this.input.keyboard.on('keydown-M', () => this.openZoneMap())
    this.input.keyboard.on('keydown-K', () => this.tryFight())
    this.input.keyboard.on('keydown-R', () => this.scene.launch('Rankings', { player: this.player }))
    this.input.keyboard.on('keydown-ESC', () => this.closeAllPanels())
    this.input.keyboard.on('keydown-F5', e => { e.preventDefault(); this.quickSave() })
    this.input.keyboard.on('keydown-B', () => this.tryBossFight())
    this.input.keyboard.on('keydown-C', () => this.openCraft())
    this.input.keyboard.on('keydown-P', () => this.openReputation())
    this.input.keyboard.on('keydown-Q', () => this.openQuestLog())

    // Portal overlap
    this.physics.add.overlap(this.playerSprite, this.portals, (pl, portal) => {
      this.enterZone(portal.zoneId)
    })

    // NPC overlap
    this.physics.add.overlap(this.playerSprite, this.npcs, (pl, npc) => {
      if (!this.npcCooldown) {
        this.npcCooldown = true
        this.showMessage(`[${npc.npcData.name}] ${npc.npcData.dialog[Math.floor(Math.random()*npc.npcData.dialog.length)]}`, '#ffdd44')
        this.time.delayedCall(2000, () => this.npcCooldown = false)
      }
    })
  }

  setupWorldTimer() {
    // Advance world day every 60 real seconds
    this.time.addEvent({
      delay: 60000,
      loop: true,
      callback: () => {
        bridge.player.worldDay = (bridge.player.worldDay || 1) + 1
        this.showMessage(`Day ${bridge.player.worldDay} begins.`, '#ffdd44')
        // Random world event
        if (Math.random() < 0.3 && !bridge.worldEvent) {
          const ev = WORLD_EVENTS[Math.floor(Math.random() * WORLD_EVENTS.length)]
          bridge.worldEvent = { ...ev, endsDay: bridge.player.worldDay + 2 }
          this.showNotification(`WORLD EVENT`, ev.desc, '#ff8844')
        }
        if (bridge.worldEvent && bridge.player.worldDay > bridge.worldEvent.endsDay) {
          this.showMessage(`Event "${bridge.worldEvent.label}" has ended.`, '#888888')
          bridge.worldEvent = null
        }
        saveGame(bridge.player)
        saveRanking(bridge.player)
      }
    })
  }

  update() {
    if (this.inventoryOpen || this.mapOpen) return

    const spd = 60 + bridge.player.agi * 2
    const vx = (this.cursors.left.isDown  || this.wasd.A.isDown) ? -spd :
               (this.cursors.right.isDown || this.wasd.D.isDown) ?  spd : 0
    const vy = (this.cursors.up.isDown    || this.wasd.W.isDown) ? -spd :
               (this.cursors.down.isDown  || this.wasd.S.isDown) ?  spd : 0

    this.playerSprite.setVelocity(vx, vy)

    // Sync HP bar and name tag with player sprite
    if (this.hpBarBg) {
      const sx = this.playerSprite.x
      const sy = this.playerSprite.y
      this.hpBarBg.setPosition(sx, sy - 12)
      this.hpBar.setPosition(sx - 9 + this.hpBar.width / 2, sy - 12)
      this.nameTag.setPosition(sx, sy - 18)
    }

    // Regen MP slowly
    if (this.time.now % 3000 < 50) {
      const p = bridge.player
      if (p.mp < p.maxMp) {
        p.mp = Math.min(p.maxMp, p.mp + 1)
        this.updateUI()
      }
    }
  }

  interact() {
    // Check proximity to NPC
    const p = this.playerSprite
    let closest = null, minDist = 40
    this.npcs.children.iterate(npc => {
      const d = Phaser.Math.Distance.Between(p.x, p.y, npc.x, npc.y)
      if (d < minDist) { minDist = d; closest = npc }
    })
    if (closest) {
      const npcData = closest.npcData
      if (npcData.name === 'Shop Keeper') {
        this.scene.launch('Shop', { player: bridge.player, overworldScene: this })
        return
      }
      // Check quest turn-in
      if (npcData.quest) {
        checkQuests(bridge.player, this)
        const q = npcData.quest
        const done = bridge.player.quests?.[q.id]
        const progress = this.getQuestProgress(bridge.player, q)
        const questLine = done
          ? `[Quest: ${q.label} COMPLETE ✓]`
          : `[Quest: ${q.label} — ${progress}]`
        this.showMessage(`[${npcData.name}] ${npcData.dialog[Math.floor(Math.random()*npcData.dialog.length)]}\n${questLine}`, '#ffdd44')
      } else {
        this.showMessage(`[${npcData.name}] ${npcData.dialog[Math.floor(Math.random()*npcData.dialog.length)]}`, '#ffdd44')
      }
      return
    }

    // Check proximity to portal
    let closestPortal = null; minDist = 24
    this.portals.children.iterate(portal => {
      const d = Phaser.Math.Distance.Between(p.x, p.y, portal.x, portal.y)
      if (d < minDist) { minDist = d; closestPortal = portal }
    })
    if (closestPortal) { this.enterZone(closestPortal.zoneId); return }

    // Default: try shop if in Capital
    if (bridge.player.zone === 'Capital') {
      this.scene.launch('Shop', { player: bridge.player, overworldScene: this })
    }
  }

  enterZone(zoneId) {
    const zone = ZONES.find(z => z.id === zoneId)
    if (!zone) return
    if (zone.minLv > bridge.player.level) {
      this.showMessage(`⚠ Danger too high. Need Lv ${zone.minLv}!`, '#ff4444')
      return
    }
    bridge.player.zone = zoneId
    this.updateUI()
    this.showMessage(`Entering ${zone.label}...`, '#88ffaa')

    // Auto-explore after entering non-safe zone
    if (zone.danger > 0) {
      this.time.delayedCall(800, () => this.tryFight())
    }
  }

  tryFight() {
    const zone = ZONES.find(z => z.id === bridge.player.zone)
    if (!zone || zone.danger === 0) {
      this.showMessage('No enemies here. Travel to a dangerous zone first.', '#888888')
      return
    }
    // Pick enemy for this zone
    const candidates = Object.entries(ENEMIES).filter(([,e]) => e.zone === zone.id && e.minLv <= bridge.player.level)
    if (candidates.length === 0) {
      this.showMessage('No enemies here at your level.', '#888888')
      return
    }
    const [name, data] = candidates[Math.floor(Math.random() * candidates.length)]
    this.scene.launch('Combat', { player: bridge.player, enemyName: name, enemyData: data, overworldScene: this })
  }

  openInventory() {
    this.inventoryOpen = !this.inventoryOpen
    if (this.inventoryOpen) {
      this.scene.launch('Inventory', { player: bridge.player, overworldScene: this })
    } else {
      this.scene.stop('Inventory')
    }
  }

  openCraft() {
    if (this.scene.isActive('Crafting')) { this.scene.stop('Crafting'); return }
    this.scene.launch('Crafting', { player: bridge.player, overworldScene: this })
  }

  openReputation() {
    if (this.scene.isActive('Reputation')) { this.scene.stop('Reputation'); return }
    this.scene.launch('Reputation', { player: bridge.player })
  }

  openQuestLog() {
    if (this.scene.isActive('QuestLog')) { this.scene.stop('QuestLog'); return }
    this.scene.launch('QuestLog', { player: bridge.player })
  }

  tryBossFight() {
    const zone = ZONES.find(z => z.id === bridge.player.zone)
    if (!zone || zone.danger === 0) { this.showMessage('No boss in this zone.', '#888888'); return }
    const boss = BOSSES[zone.id]
    if (!boss) { this.showMessage('No boss here.', '#888888'); return }
    if (bridge.player.level < zone.minLv) { this.showMessage(`Need Lv ${zone.minLv} for this boss!`, '#ff4444'); return }

    const alreadyKilled = bridge.player.bossKills?.[zone.id]
    let bossData = { ...boss }
    if (bridge.worldEvent?.effect === 'boss_weak') bossData.hp = Math.floor(bossData.hp * 0.7)
    if (alreadyKilled) bossData.hp = Math.floor(bossData.hp * 1.5) // respawn harder

    this.showMessage(`${boss.name} awakens!`, '#ff4444')
    this.scene.launch('Combat', {
      player: bridge.player, enemyName: boss.name, enemyData: bossData,
      overworldScene: this, isBoss: true, zoneId: zone.id,
    })
  }

  tryPKEncounter() {
    const zone = ZONES.find(z => z.id === bridge.player.zone)
    if (!zone || zone.danger < 2) return
    if (bridge.worldEvent?.effect === 'pk_bonus' && Math.random() < 0.15) this.spawnBandit()
    else if (Math.random() < 0.05) this.spawnBandit()
  }

  spawnBandit() {
    const p = bridge.player
    const banditLv = Math.max(1, p.level + Phaser.Math.Between(-2, 2))
    const bandit = {
      name: `Lv${banditLv} Bandit`,
      hp:  banditLv * 30 + 50,
      atk: banditLv * 5 + 10,
      def: banditLv * 2 + 3,
      exp: banditLv * 40,
      gold: [banditLv * 10, banditLv * 25],
      loot: p.inventory.length > 0 ? [p.inventory[0]] : [],
    }
    this.showMessage(`A ${bandit.name} attacks you!`, '#ff4444')
    this.scene.launch('Combat', { player: p, enemyName: bandit.name, enemyData: bandit, overworldScene: this, isPK: true })
  }

  openZoneMap() {
    this.mapOpen = !this.mapOpen
    if (this.mapOpen) {
      this.scene.launch('ZoneMap', { player: bridge.player, overworldScene: this })
    } else {
      this.scene.stop('ZoneMap')
      this.mapOpen = false
    }
  }

  closeAllPanels() {
    this.inventoryOpen = false
    this.mapOpen = false
    ;['Inventory', 'ZoneMap', 'Shop', 'Rankings', 'StatAlloc', 'Crafting', 'Reputation', 'QuestLog'].forEach(s => {
      if (this.scene.isActive(s)) this.scene.stop(s)
    })
  }

  getQuestProgress(p, q) {
    if (q.goal === 'kills')         return `${p.kills||0}/${q.target} kills`
    if (q.goal === 'trades')        return `${p.trades||0}/${q.target} trades`
    if (q.goal === 'bossKills')     return `${Object.keys(p.bossKills||{}).length}/${q.target} bosses`
    if (q.goal === 'reputation')    return `${Math.max(...Object.values(p.reputation||{0:0}))}/${q.target} rep`
    if (q.goal === 'inventory_all') return q.items.map(it => `${it}:${p.inventory?.includes(it)?'✓':'✗'}`).join(' ')
    return '?'
  }

  quickSave() {
    saveGame(bridge.player)
    saveRanking(bridge.player)
    this.showMessage('Game saved!', '#00ff88')
  }

  onCombatEnd(result) {
    this.updateUI()
    if (result.levelUp) {
      this.showNotification(`LEVEL UP!`, `Now Lv.${bridge.player.level}\nYou have ${bridge.player.statPoints} stat points!`, '#ffdd44')
      this.spawnParticles(this.playerSprite?.x || 320, this.playerSprite?.y || 280, 0x00ff88, 16)
      this.time.delayedCall(500, () => {
        this.scene.launch('StatAlloc', { player: bridge.player, overworldScene: this })
      })
    }
    if (result.jobUnlock) {
      this.unlockJob(result.jobUnlock)
    }
    if (result.loot && result.loot.length > 0) {
      this.showMessage(`Loot: ${result.loot.join(', ')}`, '#ffd700')
    }
    if (result.bossKill) {
      bridge.player.bossKills = bridge.player.bossKills || {}
      bridge.player.bossKills[result.zoneId] = true
      this.showNotification(`BOSS DEFEATED!`, `${result.enemyName} has fallen!\nAll kingdom reputation +200!`, '#ff4444')
      this.spawnParticles(this.scale.width/2, this.scale.height/2, 0xff4444, 30)
      gainRep(bridge.player, 'Iron', 200)
      gainRep(bridge.player, 'Arcanum', 200)
      gainRep(bridge.player, 'Ocean', 200)
      const bossCount = Object.keys(bridge.player.bossKills).length
      // Discover Abyss after 3 bosses
      if (bossCount >= 3 && !bridge.discoveredZones?.includes('Abyss')) {
        bridge.discoveredZones = [...(bridge.discoveredZones||[]), 'Abyss']
        this.time.delayedCall(1500, () =>
          this.showNotification(`ZONE DISCOVERED!`, 'The Abyssal Depths revealed!\nTravel to face the final trial.', '#9932cc')
        )
      }
      // Succession: killing Abyssal God = true ending
      if (result.enemyName === 'Abyssal God') {
        bridge.player.title = 'Abyssal Champion'
        saveRanking(bridge.player)
        saveGame(bridge.player)
        this.time.delayedCall(2000, () => {
          this.scene.launch('Ending', { player: bridge.player })
        })
      }
    }
    if (result.pkKill) {
      bridge.player.pkKills = (bridge.player.pkKills||0) + 1
      const mult = bridge.worldEvent?.effect === 'pk_bonus' ? 3 : 1
      const goldGain = result.pkGold * mult
      bridge.player.gold += goldGain
      this.showMessage(`PK Victory! +${goldGain}g (PK:${bridge.player.pkKills})`, '#ff8844')
    }
    checkQuests(bridge.player, this)
    saveGame(bridge.player)
    saveRanking(bridge.player)

    // Small chance of PK encounter after combat in dangerous zones
    this.time.delayedCall(1500, () => this.tryPKEncounter())
  }
}

// ── CombatScene ──
class CombatScene extends Phaser.Scene {
  constructor() { super('Combat') }

  init(data) {
    this.player     = data.player
    this.enemyName  = data.enemyName
    this.enemyData  = { ...data.enemyData }
    this.overworldScene = data.overworldScene
    this.isBoss     = data.isBoss || false
    this.isPK       = data.isPK   || false
    this.zoneId     = data.zoneId
    this.log        = []
    this.turn       = 'player'
    this.result     = { levelUp: false, jobUnlock: null, loot: [] }
    this.enemyStatus = {}
    this.playerBuff  = {}
    this.combatBuff  = {}
  }

  create() {
    const W = this.scale.width, H = this.scale.height
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.85)')

    // Background panel
    this.add.rectangle(W/2, H/2, W - 20, H - 20, 0x0d1117).setStrokeStyle(1, 0x00ff88)

    // Title
    this.add.text(W/2, 15, `⚔ BATTLE`, { font: '10px monospace', fill: '#ff4444', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5)

    // Enemy display
    const enemyKeyMap = {
      'Goblin Scout': 'enemy_goblin', 'Forest Wolf': 'enemy_wolf', 'Giant Spider': 'enemy_goblin',
      'Stone Golem': 'enemy_golem',  'Iron Bat': 'enemy_goblin',  'Mountain Troll': 'enemy_golem',
      'Shadow Wraith': 'enemy_wraith','Void Imp': 'enemy_wraith', 'Dark Knight': 'enemy_knight',
      'Ancient Golem': 'enemy_golem', 'Lich Acolyte': 'enemy_wraith', 'Ruin Drake': 'enemy_drake',
      'Abyss Demon': 'enemy_demon',  'Void Titan': 'enemy_demon',
    }
    const eKey = enemyKeyMap[this.enemyName] || 'enemy_goblin'
    this.enemySprite = this.add.image(W * 0.65, H * 0.3, eKey).setScale(4)
    this.playerSprite = this.add.image(W * 0.25, H * 0.35, 'player').setScale(4)

    // Names
    this.add.text(W * 0.65, H * 0.15, this.enemyName, { font: '8px monospace', fill: '#ff8888', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5)
    this.add.text(W * 0.25, H * 0.18, this.player.name, { font: '8px monospace', fill: '#88ffaa', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5)

    // HP bars
    this.enemyMaxHp = this.enemyData.hp
    this.createHpBars(W, H)

    // Battle log
    this.logTexts = []
    for (let i = 0; i < 4; i++) {
      this.logTexts.push(this.add.text(W/2, H * 0.55 + i * 11, '', { font: '6px monospace', fill: '#cccccc', stroke: '#000', strokeThickness: 1, wordWrap:{width: W-30} }).setOrigin(0.5, 0))
    }

    // Action buttons
    this.createButtons(W, H)

    this.addLog(`A ${this.enemyName} appears!`)
    this.addLog(`HP: ${this.player.hp}/${this.player.maxHp}  ATK: ${getAtk(this.player)}  DEF: ${getDef(this.player)}`)
  }

  createHpBars(W, H) {
    const BAR_W = 80, BAR_H = 6
    // Player HP
    this.add.rectangle(W * 0.25, H * 0.42, BAR_W, BAR_H, 0x330000)
    this.playerHpBar = this.add.rectangle(W * 0.25 - BAR_W/2 + BAR_W/2, H * 0.42, BAR_W, BAR_H, 0x00ff00).setOrigin(0.5)
    this.playerHpText = this.add.text(W * 0.25, H * 0.42, `${this.player.hp}/${this.player.maxHp}`, { font: '5px monospace', fill: '#ffffff' }).setOrigin(0.5)

    // Enemy HP
    this.add.rectangle(W * 0.65, H * 0.22, BAR_W, BAR_H, 0x330000)
    this.enemyHpBar = this.add.rectangle(W * 0.65 - BAR_W/2 + BAR_W/2, H * 0.22, BAR_W, BAR_H, 0xff2200).setOrigin(0.5)
    this.enemyHpText = this.add.text(W * 0.65, H * 0.22, `${this.enemyData.hp}/${this.enemyMaxHp}`, { font: '5px monospace', fill: '#ffffff' }).setOrigin(0.5)
  }

  updateBars() {
    const BAR_W = 80
    const pRatio = this.player.hp / this.player.maxHp
    this.playerHpBar.width = Math.max(1, BAR_W * pRatio)
    this.playerHpBar.fillColor = pRatio > 0.5 ? 0x00ff00 : pRatio > 0.25 ? 0xffaa00 : 0xff2200
    this.playerHpText.setText(`${this.player.hp}/${this.player.maxHp}`)

    const eRatio = this.enemyData.hp / this.enemyMaxHp
    this.enemyHpBar.width = Math.max(1, BAR_W * eRatio)
    this.enemyHpText.setText(`${this.enemyData.hp}/${this.enemyMaxHp}`)
  }

  createButtons(W, H) {
    const skills = JOB_SKILLS[this.player.job] || []

    // Row 1: base actions
    const row1 = [
      { label: 'Attack',   color: 0x224422, action: () => this.doAttack() },
      { label: 'Magic',    color: 0x222244, action: () => this.doMagic() },
      { label: 'Potion',   color: 0x442222, action: () => this.usePotion() },
      { label: 'Flee',     color: 0x333322, action: () => this.flee() },
    ]
    const totalRow1 = row1.length
    row1.forEach((b, i) => {
      const bx = W / (totalRow1 + 1) * (i + 1)
      const btn = this.add.rectangle(bx, H * 0.86, 46, 13, b.color).setInteractive().setStrokeStyle(1, 0x4488ff)
      this.add.text(bx, H * 0.86, b.label, { font: '6px monospace', fill: '#ffffff' }).setOrigin(0.5)
      btn.on('pointerover', () => btn.setFillStyle(0x336688))
      btn.on('pointerout',  () => btn.setFillStyle(b.color))
      btn.on('pointerdown', () => { if (this.turn === 'player' && !this.busy) b.action() })
    })

    // Row 2: job skills
    if (skills.length > 0) {
      skills.forEach((sk, i) => {
        const bx = W / (skills.length + 1) * (i + 1)
        const col = Phaser.Display.Color.HexStringToColor(sk.color.replace('#','')).color
        const btn = this.add.rectangle(bx, H * 0.95, 70, 13, 0x111122).setInteractive().setStrokeStyle(1, col)
        this.add.text(bx, H * 0.95, `${sk.name} (${sk.mpCost}MP)`, { font: '5px monospace', fill: sk.color }).setOrigin(0.5)
        btn.on('pointerover', () => btn.setFillStyle(0x223344))
        btn.on('pointerout',  () => btn.setFillStyle(0x111122))
        btn.on('pointerdown', () => { if (this.turn === 'player' && !this.busy) this.useSkill(sk) })
      })
    }
  }

  useSkill(sk) {
    const p = this.player
    if (sk.mpCost > 0 && p.mp < sk.mpCost) { this.addLog(`Not enough MP! (need ${sk.mpCost})`); return }
    if (sk.mpCost > 0) p.mp -= sk.mpCost
    this.busy = true

    switch (sk.effect) {
      case 'berserk': {
        const sacrifice = Math.min(30, p.hp - 1)
        p.hp = Math.max(1, p.hp - sacrifice)
        this.combatBuff = (this.combatBuff||{})
        this.combatBuff.atkBoost = (this.combatBuff.atkBoost||1) * 1.8
        this.combatBuff.atkTurns = 1
        this.addLog(`BERSERK! -${sacrifice}HP, ATK ×1.8 this turn!`)
        this.doAttackWithMult(1.8)
        return
      }
      case 'bleed': {
        this.enemyStatus = { bleed: 3, bleedDmg: Math.floor(getAtk(p) * 0.4) }
        this.addLog(`REND! Enemy bleeds for ${this.enemyStatus.bleedDmg}/turn × 3`)
        this.time.delayedCall(400, () => this.enemyTurn())
        return
      }
      case 'arcane': {
        const dmg = p.int * 6
        this.enemyData.hp = Math.max(0, this.enemyData.hp - dmg)
        this.addLog(`✦ Arcane Bolt: ${dmg} magic dmg (ignores DEF)!`)
        this.updateBars()
        if (this.enemyData.hp <= 0) { this.victory(); return }
        this.time.delayedCall(400, () => this.enemyTurn())
        return
      }
      case 'voidtear': {
        const dmg = p.int * 8
        this.enemyData.hp = Math.max(0, this.enemyData.hp - dmg)
        const stun = Math.random() < 0.2
        this.addLog(`◈ Void Tear: ${dmg} dmg!${stun ? ' Enemy STUNNED!' : ''}`)
        if (stun) this.enemyStunned = 1
        this.updateBars()
        if (this.enemyData.hp <= 0) { this.victory(); return }
        this.time.delayedCall(400, () => this.enemyTurn())
        return
      }
      case 'shadowstrike': {
        const isCrit = this.enemyData.hp / this.enemyMaxHp > 0.5
        const dmg = p.agi * 4 * (isCrit ? 2 : 1)
        this.enemyData.hp = Math.max(0, this.enemyData.hp - dmg)
        this.addLog(`† Shadow Strike: ${dmg} dmg!${isCrit ? ' CRITICAL!' : ''}`)
        this.updateBars()
        if (this.enemyData.hp <= 0) { this.victory(); return }
        this.time.delayedCall(400, () => this.enemyTurn())
        return
      }
      case 'smite': {
        const dmg = (p.str + p.int) * 3
        const heal = 20
        this.enemyData.hp = Math.max(0, this.enemyData.hp - dmg)
        p.hp = Math.min(p.maxHp, p.hp + heal)
        this.addLog(`✟ Holy Smite: ${dmg} dmg, +${heal} HP!`)
        this.updateBars()
        if (this.enemyData.hp <= 0) { this.victory(); return }
        this.time.delayedCall(400, () => this.enemyTurn())
        return
      }
      case 'heal': {
        const heal = Math.floor(p.maxHp * 0.6)
        p.hp = Math.min(p.maxHp, p.hp + heal)
        this.addLog(`✟ Lay Hands: +${heal} HP (${p.hp}/${p.maxHp})`)
        this.updateBars()
        this.time.delayedCall(400, () => this.enemyTurn())
        return
      }
      case 'bribe': {
        if (p.gold < 100) { this.addLog('Need 100g to bribe!'); this.busy = false; return }
        p.gold -= 100
        this.addLog('Bribed enemy — ending battle, keeping loot!')
        this.time.delayedCall(600, () => this.victory())
        return
      }
      case 'trap': {
        this.enemyStatus = (this.enemyStatus||{})
        this.enemyStatus.trap = true
        this.addLog('Trap set! Enemy takes 2× damage next hit.')
        this.time.delayedCall(400, () => this.enemyTurn())
        return
      }
      case 'scout': {
        this.combatBuff = (this.combatBuff||{})
        this.combatBuff.dmgMult = 1.3; this.combatBuff.dmgTurns = 3
        this.addLog(`Scouted enemy weakness! +30% dmg for 3 turns.`)
        this.time.delayedCall(400, () => this.enemyTurn())
        return
      }
      case 'shield': {
        this.playerBuff = (this.playerBuff||{})
        this.playerBuff.shieldTurns = 2
        this.addLog('Iron Shield! DEF +50% for 2 turns.')
        this.time.delayedCall(400, () => this.enemyTurn())
        return
      }
      case 'slow': {
        this.enemyStatus = (this.enemyStatus||{})
        this.enemyStatus.slow = 2
        this.addLog('Slow Field! Enemy ATK -40% for 2 turns.')
        this.time.delayedCall(400, () => this.enemyTurn())
        return
      }
      case 'phase': {
        this.playerBuff = (this.playerBuff||{})
        this.playerBuff.dodge = 1
        this.addLog('Phase Shift! Will dodge next attack.')
        this.time.delayedCall(400, () => this.enemyTurn())
        return
      }
      case 'smoke': {
        if (Math.random() < 0.6) {
          this.enemyStatus = (this.enemyStatus||{})
          this.enemyStatus.miss = 1
          this.addLog('Smoke Bomb! Enemy misses next turn.')
          this.endCombat(false)
        } else {
          this.addLog('Smoke failed!')
          this.time.delayedCall(400, () => this.enemyTurn())
        }
        return
      }
      case 'hired': {
        const dmg = p.str * 5
        this.enemyData.hp = Math.max(0, this.enemyData.hp - dmg)
        this.addLog(`Hired Blade strikes for ${dmg}!`)
        this.updateBars()
        if (this.enemyData.hp <= 0) { this.victory(); return }
        this.time.delayedCall(400, () => this.enemyTurn())
        return
      }
      default:
        this.busy = false
    }
  }

  doAttackWithMult(mult) {
    const p = this.player
    const atk = Math.floor(getAtk(p) * mult)
    let dmg = Math.max(1, atk - this.enemyData.def + Phaser.Math.Between(-3, 3))
    if (this.enemyStatus?.trap) { dmg *= 2; this.enemyStatus.trap = false; this.addLog('TRAP triggered! 2× damage!') }
    this.enemyData.hp = Math.max(0, this.enemyData.hp - dmg)
    this.addLog(`Berserk attack: ${dmg} dmg!`)
    this.updateBars()
    if (this.enemyData.hp <= 0) { this.victory(); return }
    this.time.delayedCall(400, () => this.enemyTurn())
  }

  addLog(msg) {
    this.log.push(msg)
    const recent = this.log.slice(-4)
    recent.forEach((m, i) => {
      if (this.logTexts[i]) this.logTexts[i].setText(m)
    })
  }

  doAttack() {
    this.busy = true
    const p = this.player
    let atk = getAtk(p)
    if (this.combatBuff?.dmgMult && this.combatBuff.dmgTurns > 0) {
      atk = Math.floor(atk * this.combatBuff.dmgMult)
      this.combatBuff.dmgTurns--
    }
    let dmg = Math.max(1, atk - this.enemyData.def + Phaser.Math.Between(-3, 3))
    if (this.enemyStatus?.trap) { dmg *= 2; this.enemyStatus.trap = false; this.addLog('TRAP!') }
    this.enemyData.hp = Math.max(0, this.enemyData.hp - dmg)
    this.addLog(`You attack for ${dmg} dmg!`)
    this.tweens.add({ targets: this.playerSprite, x: '+=20', duration: 100, yoyo: true, onComplete: () => {
      this.updateBars()
      if (this.enemyData.hp <= 0) { this.victory(); return }
      this.time.delayedCall(400, () => this.enemyTurn())
    }})
  }

  doMagic() {
    const p = this.player
    const mpCost = 15 + p.level * 2
    if (p.mp < mpCost) { this.addLog('Not enough MP!'); return }
    this.busy = true
    p.mp = Math.max(0, p.mp - mpCost)
    const magDmg = Math.max(1, p.int * 4 - Math.floor(this.enemyData.def * 0.5) + Phaser.Math.Between(-5, 5))
    this.enemyData.hp = Math.max(0, this.enemyData.hp - magDmg)
    this.addLog(`✦ Magic blast: ${magDmg} dmg! (MP: ${p.mp}/${p.maxMp})`)
    this.updateBars()
    if (this.enemyData.hp <= 0) { this.victory(); return }
    this.time.delayedCall(400, () => this.enemyTurn())
  }

  usePotion() {
    const p = this.player
    const idx = p.inventory.indexOf('Health Potion')
    if (idx === -1) { this.addLog('No Health Potion!'); return }
    this.busy = true
    p.inventory.splice(idx, 1)
    const heal = 60
    p.hp = Math.min(p.maxHp, p.hp + heal)
    this.addLog(`Used Health Potion. +${heal} HP (${p.hp}/${p.maxHp})`)
    this.updateBars()
    this.time.delayedCall(400, () => this.enemyTurn())
  }

  flee() {
    const chance = 0.4 + bridge.player.agi * 0.02
    if (Math.random() < chance) {
      this.addLog('Escaped!')
      this.time.delayedCall(600, () => this.endCombat(false))
    } else {
      this.busy = true
      this.addLog('Failed to flee!')
      this.time.delayedCall(400, () => this.enemyTurn())
    }
  }

  enemyTurn() {
    this.turn = 'enemy'
    const p = this.player

    // Apply bleed to enemy
    if (this.enemyStatus?.bleed > 0) {
      const bd = this.enemyStatus.bleedDmg
      this.enemyData.hp = Math.max(0, this.enemyData.hp - bd)
      this.enemyStatus.bleed--
      this.addLog(`Bleed: ${bd} dmg! (${this.enemyStatus.bleed} turns left)`)
      if (this.enemyData.hp <= 0) { this.victory(); return }
    }

    // Stun check
    if (this.enemyStunned > 0) {
      this.enemyStunned--
      this.addLog(`${this.enemyName} is stunned!`)
      this.turn = 'player'; this.busy = false
      this.updateBars()
      return
    }

    // Slow
    let eAtk = this.enemyData.atk
    if (this.enemyStatus?.slow > 0) { eAtk = Math.floor(eAtk * 0.6); this.enemyStatus.slow-- }
    if (this.enemyStatus?.miss > 0) { this.enemyStatus.miss--; this.addLog(`${this.enemyName} missed!`); this.turn = 'player'; this.busy = false; return }

    // Dodge
    if (this.playerBuff?.dodge > 0) {
      this.playerBuff.dodge--
      this.addLog('Phase Shift! Dodged attack!')
      this.turn = 'player'; this.busy = false
      return
    }

    let def = getDef(p)
    if (this.playerBuff?.shieldTurns > 0) { def = Math.floor(def * 1.5); this.playerBuff.shieldTurns-- }

    const eDmg = Math.max(1, eAtk - def + Phaser.Math.Between(-2, 4))
    p.hp = Math.max(0, p.hp - eDmg)
    this.addLog(`${this.enemyName} attacks for ${eDmg}!`)
    this.tweens.add({ targets: this.enemySprite, x: '-=20', duration: 100, yoyo: true })
    this.updateBars()

    if (p.hp <= 0) {
      this.addLog('You have been defeated...')
      p.hp = Math.floor(p.maxHp * 0.15)
      p.pkDeaths = (p.pkDeaths||0) + 1
      this.time.delayedCall(1200, () => {
        // Drop random item on death (PK-lite: lose some gold)
        const goldLoss = Math.floor(p.gold * 0.1)
        p.gold = Math.max(0, p.gold - goldLoss)
        this.addLog(`Lost ${goldLoss} gold on defeat.`)
        this.time.delayedCall(800, () => this.endCombat(false))
      })
      return
    }

    // Check Berserker
    if (p.job === 'Wanderer' || p.job === 'Berserker') {
      if (JOBS.Berserker.check && JOBS.Berserker.check(p) && p.job === 'Wanderer') {
        this.result.jobUnlock = 'Berserker'
      }
    }
    this.turn = 'player'
    this.busy = false
  }

  victory() {
    const p = this.player
    const eData = this.enemyData
    p.kills = (p.kills || 0) + 1
    p.explores = (p.explores || 0) + 1

    let goldGain = Phaser.Math.Between(eData.gold[0], eData.gold[1])
    let expGain  = eData.exp

    // World event bonuses
    if (bridge.worldEvent) {
      const ev = bridge.worldEvent.effect
      const zoneNow = ZONES.find(z => z.id === p.zone)
      if (ev === 'exp_forest' && zoneNow?.id === 'Forest') expGain = Math.floor(expGain * 2)
      if (ev === 'exp_ruins'  && zoneNow?.id === 'Ruins')  expGain = Math.floor(expGain * 2)
      if (ev === 'gold_bonus') goldGain *= 2
      if (ev === 'spell_boost' && p.int > p.str)           expGain = Math.floor(expGain * 1.4)
      if (ev === 'plague') {
        goldGain *= 3
        if (eData.loot?.[0]) p.inventory.push(eData.loot[0])
      }
    }

    p.gold += goldGain
    p.exp  += expGain
    this.addLog(`Victory! +${expGain} EXP  +${goldGain}g`)

    // Reputation gain (based on zone's kingdom affinity)
    const zone = ZONES.find(z => z.id === p.zone)
    const repGain = Math.floor(expGain / 20)
    if (zone) {
      if (zone.id === 'Forest' || zone.id === 'Mountains') gainRep(p, 'Iron', repGain)
      if (zone.id === 'Shadow' || zone.id === 'Ruins')    gainRep(p, 'Arcanum', repGain)
      if (zone.id === 'Capital')                          gainRep(p, 'Ocean', repGain)
    }

    // Loot drop
    let loot = []
    if (eData.loot && Math.random() < 0.4) {
      const item = eData.loot[Math.floor(Math.random() * eData.loot.length)]
      p.inventory.push(item)
      loot.push(item)
      this.result.loot = loot
    }

    // Level up check
    while (p.exp >= expNeeded(p.level)) {
      p.exp -= expNeeded(p.level)
      p.level++
      p.statPoints = (p.statPoints||0) + 3
      p.maxHp = getMaxHp(p); p.hp = p.maxHp
      p.maxMp = getMaxMp(p); p.mp = p.maxMp
      this.result.levelUp = true
      this.addLog(`LEVEL UP! Now Lv ${p.level}! +3 stat points`)
    }

    // Check job unlock
    if (p.level >= 10 && p.job === 'Wanderer') {
      Object.entries(JOBS).forEach(([key, job]) => {
        if (job.check && job.check(p)) this.result.jobUnlock = key
      })
    }

    if (this.isBoss) {
      this.cameras.main.flash(500, 255, 50, 50)
    }
    this.time.delayedCall(1200, () => this.endCombat(true))
  }

  endCombat(won) {
    if (won && this.isBoss) {
      this.result.bossKill  = true
      this.result.zoneId    = this.zoneId
      this.result.enemyName = this.enemyName
    }
    if (won && this.isPK) {
      this.result.pkKill = true
      this.result.pkGold = Phaser.Math.Between(30, 80) + this.player.level * 5
    }
    this.scene.stop('Combat')
    if (this.overworldScene) {
      this.overworldScene.onCombatEnd(this.result)
    }
  }
}

// ── ShopScene ──
class ShopScene extends Phaser.Scene {
  constructor() { super('Shop') }
  init(data) { this.player = data.player; this.overworldScene = data.overworldScene }

  create() {
    const W = this.scale.width, H = this.scale.height
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.88)')

    this.add.rectangle(W/2, H/2, W-20, H-20, 0x0d1117).setStrokeStyle(1, 0xffd700)
    this.add.text(W/2, 15, '◆ SHOP', { font: '10px monospace', fill: '#ffd700', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5)
    this.add.text(W/2, 28, `Gold: ${this.player.gold}g`, { font: '7px monospace', fill: '#ffffff' }).setOrigin(0.5)
    this.goldText = this.add.text(W/2, 28, `Gold: ${this.player.gold}g`, { font: '7px monospace', fill: '#ffd700' }).setOrigin(0.5)

    const shopItems = Object.entries(ITEMS).filter(([,v]) => v.cost && v.type !== 'material')
    let y = 44
    shopItems.forEach(([name, item]) => {
      const row = this.add.text(W/2, y, `${name.padEnd(20)} ${item.cost}g  ${item.desc}`, {
        font: '6px monospace', fill: '#cccccc', stroke: '#000', strokeThickness: 1
      }).setOrigin(0.5, 0).setInteractive()
      row.on('pointerover', () => row.setStyle({ fill: '#ffd700' }))
      row.on('pointerout',  () => row.setStyle({ fill: '#cccccc' }))
      row.on('pointerdown', () => this.buyItem(name, item))
      y += 10
    })

    // Sell section
    y += 5
    this.add.text(W/2, y, '── SELL ──', { font: '6px monospace', fill: '#888888' }).setOrigin(0.5)
    y += 10
    this.sellGroup = []
    this.refreshSell(y, W)

    this.add.text(W - 16, H - 12, '[ESC] Close', { font: '6px monospace', fill: '#888888' }).setOrigin(1, 1)
    this.input.keyboard.on('keydown-ESC', () => this.scene.stop('Shop'))
  }

  refreshSell(baseY, W) {
    this.sellGroup.forEach(t => t.destroy())
    this.sellGroup = []
    const mats = this.player.inventory.filter(name => ITEMS[name]?.type === 'material' || ITEMS[name]?.sell)
    const unique = [...new Set(mats)]
    let y = baseY
    unique.forEach(name => {
      const item = ITEMS[name]
      if (!item?.sell) return
      const count = this.player.inventory.filter(n => n === name).length
      const row = this.add.text(W/2, y, `${name} x${count}  [${item.sell}g each]`, {
        font: '6px monospace', fill: '#aaffaa', stroke: '#000', strokeThickness: 1
      }).setOrigin(0.5, 0).setInteractive()
      row.on('pointerdown', () => this.sellItem(name, item))
      this.sellGroup.push(row)
      y += 10
    })
  }

  buyItem(name, item) {
    const p = this.player
    let cost = item.cost
    if (bridge.worldEvent?.effect === 'shop_discount') cost = Math.floor(cost * 0.8)
    if (p.gold < cost) { this.showMsg('Not enough gold!', '#ff4444'); return }
    p.gold -= cost
    p.trades = (p.trades || 0) + 1

    if (item.type === 'consumable') {
      p.inventory.push(name)
    } else if (item.type === 'weapon') {
      const prev = p.equipment.weapon
      if (prev && ITEMS[prev]) { p.inventory.push(prev); p.weaponAtk -= ITEMS[prev].atk || 0 }
      p.equipment.weapon = name
      p.weaponAtk = item.atk || 0
    } else if (item.type === 'armor') {
      const prev = p.equipment.armor
      if (prev && ITEMS[prev]) { p.inventory.push(prev); p.armorDef -= ITEMS[prev].def || 0; if (ITEMS[prev].int) p.int -= ITEMS[prev].int }
      p.equipment.armor = name
      p.armorDef = item.def || 0
      if (item.int) p.int += item.int
    }

    this.goldText.setText(`Gold: ${p.gold}g`)
    this.showMsg(`Bought ${name}!`, '#00ff88')
    saveGame(p)
  }

  sellItem(name, item) {
    const p = this.player
    const idx = p.inventory.indexOf(name)
    if (idx === -1) return
    p.inventory.splice(idx, 1)
    p.gold += item.sell
    p.trades = (p.trades || 0) + 1
    this.goldText.setText(`Gold: ${p.gold}g`)
    this.showMsg(`Sold ${name} for ${item.sell}g`, '#ffd700')
    saveGame(p)
  }

  showMsg(msg, color) {
    if (this.msgT) this.msgT.destroy()
    this.msgT = this.add.text(this.scale.width/2, this.scale.height - 25, msg, {
      font: '7px monospace', fill: color, stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5)
    this.time.delayedCall(2000, () => { if (this.msgT) this.msgT.destroy() })
  }
}

// ── InventoryScene ──
class InventoryScene extends Phaser.Scene {
  constructor() { super('Inventory') }
  init(data) { this.player = data.player }

  create() {
    const W = this.scale.width, H = this.scale.height
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.88)')
    this.add.rectangle(W/2, H/2, W-20, H-20, 0x0d1117).setStrokeStyle(1, 0x8888ff)
    this.add.text(W/2, 14, 'INVENTORY', { font: '10px monospace', fill: '#8888ff', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5)

    const p = this.player
    this.add.text(16, 28, `Equipment: Weapon: ${p.equipment?.weapon || 'None'}  Armor: ${p.equipment?.armor || 'None'}`, { font: '6px monospace', fill: '#aaaaff' })
    this.add.text(16, 38, `ATK: ${getAtk(p)}  DEF: ${getDef(p)}  STR:${p.str} AGI:${p.agi} INT:${p.int} VIT:${p.vit}`, { font: '6px monospace', fill: '#aaffaa' })

    const counts = {}
    p.inventory.forEach(name => { counts[name] = (counts[name]||0)+1 })
    let y = 52
    this.add.text(16, y, 'Items:', { font: '7px monospace', fill: '#ffffff' }); y += 12
    Object.entries(counts).forEach(([name, cnt]) => {
      const item = ITEMS[name] || {}
      const row = this.add.text(20, y, `${name} x${cnt}  ${item.desc || ''}`, { font: '6px monospace', fill: '#cccccc' }).setInteractive()
      row.on('pointerover', () => row.setStyle({ fill: '#ffffff' }))
      row.on('pointerdown', () => this.useItem(name))
      y += 10
    })

    this.add.text(W - 16, H - 12, '[I/ESC] Close', { font: '6px monospace', fill: '#888888' }).setOrigin(1, 1)
    this.input.keyboard.on('keydown-I',   () => this.scene.stop('Inventory'))
    this.input.keyboard.on('keydown-ESC', () => this.scene.stop('Inventory'))
  }

  useItem(name) {
    const p = this.player
    const item = ITEMS[name]
    if (!item || item.type !== 'consumable') return
    const idx = p.inventory.indexOf(name)
    if (idx === -1) return
    p.inventory.splice(idx, 1)
    if (item.hp) p.hp = Math.min(p.maxHp, p.hp + item.hp)
    if (item.mp) p.mp = Math.min(p.maxMp, p.mp + item.mp)
    if (item.mpRestore) p.mp = Math.min(p.maxMp, p.mp + item.mpRestore)
    saveGame(p)
    this.scene.restart()
  }
}

// ── ZoneMapScene ──
class ZoneMapScene extends Phaser.Scene {
  constructor() { super('ZoneMap') }
  init(data) { this.player = data.player; this.overworldScene = data.overworldScene }

  create() {
    const W = this.scale.width, H = this.scale.height
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.9)')
    this.add.rectangle(W/2, H/2, W-20, H-20, 0x0d1117).setStrokeStyle(1, 0x44aaff)
    this.add.text(W/2, 14, 'WORLD MAP', { font: '10px monospace', fill: '#44aaff', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5)

    ZONES.forEach(zone => {
      if (zone.hidden && !bridge.discoveredZones?.includes(zone.id)) return
      const isHere = this.player.zone === zone.id
      const canEnter = zone.minLv <= this.player.level
      const color = isHere ? '#ffdd44' : canEnter ? '#00ff88' : '#ff4444'
      const alpha = canEnter ? 1 : 0.5

      // Zone node
      const cx = zone.x * (W / 640)
      const cy = zone.y * (H / 480)
      const dot = this.add.circle(cx, cy, 8, isHere ? 0xffdd44 : 0x224466).setAlpha(alpha)
      dot.setInteractive()
      dot.on('pointerdown', () => this.travelTo(zone))

      this.add.text(cx, cy - 12, zone.label, { font: '5px monospace', fill: color, stroke: '#000', strokeThickness: 2 }).setOrigin(0.5, 1).setAlpha(alpha)
      this.add.text(cx, cy + 10, `Lv${zone.minLv}+  ${'★'.repeat(zone.danger)}`, { font: '5px monospace', fill: '#888888' }).setOrigin(0.5, 0).setAlpha(alpha)

      if (isHere) {
        this.add.text(cx, cy + 18, '← YOU', { font: '5px monospace', fill: '#ffdd44' }).setOrigin(0.5, 0)
      }

      // Draw connections
      zone.adjacent?.forEach(adjId => {
        const adj = ZONES.find(z => z.id === adjId)
        if (adj) {
          const ax = adj.x * (W / 640)
          const ay = adj.y * (H / 480)
          const line = this.add.line(0, 0, cx, cy, ax, ay, 0x334455).setOrigin(0, 0)
          line.setDepth(-1)
        }
      })
    })

    this.add.text(W - 16, H - 12, '[M/ESC] Close', { font: '6px monospace', fill: '#888888' }).setOrigin(1, 1)
    this.input.keyboard.on('keydown-M',   () => { this.scene.stop('ZoneMap'); if(this.overworldScene) this.overworldScene.mapOpen = false })
    this.input.keyboard.on('keydown-ESC', () => { this.scene.stop('ZoneMap'); if(this.overworldScene) this.overworldScene.mapOpen = false })
  }

  travelTo(zone) {
    if (zone.minLv > this.player.level) return
    this.player.zone = zone.id
    this.scene.stop('ZoneMap')
    if (this.overworldScene) {
      this.overworldScene.mapOpen = false
      this.overworldScene.updateUI()
      // Move player sprite to zone
      const ow = this.overworldScene
      if (ow.playerSprite) {
        ow.playerSprite.x = zone.x
        ow.playerSprite.y = zone.y
      }
      this.overworldScene.showMessage(`Traveled to ${zone.label}`, '#88ffaa')
    }
  }
}

// ── StatAllocScene ──
class StatAllocScene extends Phaser.Scene {
  constructor() { super('StatAlloc') }
  init(data) { this.player = data.player; this.overworldScene = data.overworldScene }

  create() {
    const W = this.scale.width, H = this.scale.height
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.92)')
    this.add.rectangle(W/2, H/2, 200, 180, 0x0d1117).setStrokeStyle(2, 0xffdd44)
    this.add.text(W/2, H/2 - 82, 'LEVEL UP!', { font: '12px monospace', fill: '#ffdd44', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5)
    this.add.text(W/2, H/2 - 68, `Lv ${this.player.level}  —  Allocate stat points`, { font: '7px monospace', fill: '#ffffff' }).setOrigin(0.5)

    this.ptsText = this.add.text(W/2, H/2 - 56, '', { font: '8px monospace', fill: '#00ff88' }).setOrigin(0.5)
    this.statTexts = {}

    const stats = ['str','agi','int','vit']
    const labels = { str:'STR (ATK)', agi:'AGI (SPD)', int:'INT (MAG/MP)', vit:'VIT (HP/DEF)' }
    stats.forEach((stat, i) => {
      const y = H/2 - 40 + i * 22
      this.statTexts[stat] = this.add.text(W/2 - 30, y, '', { font: '7px monospace', fill: '#cccccc' }).setOrigin(0, 0.5)

      const btn = this.add.rectangle(W/2 + 50, y, 30, 14, 0x224466).setInteractive().setStrokeStyle(1, 0x4488ff)
      this.add.text(W/2 + 50, y, `+  ${labels[stat]}`, { font: '6px monospace', fill: '#aaccff' }).setOrigin(0.5)
      btn.on('pointerover', () => btn.setFillStyle(0x336688))
      btn.on('pointerout',  () => btn.setFillStyle(0x224466))
      btn.on('pointerdown', () => this.allocate(stat))
    })

    this.doneBtn = this.add.rectangle(W/2, H/2 + 55, 80, 16, 0x004400).setInteractive().setStrokeStyle(1, 0x00ff44)
    this.doneTxt = this.add.text(W/2, H/2 + 55, 'Continue', { font: '7px monospace', fill: '#00ff44' }).setOrigin(0.5)
    this.doneBtn.on('pointerdown', () => { if (this.player.statPoints === 0) this.scene.stop('StatAlloc') })

    this.refresh()
  }

  allocate(stat) {
    const p = this.player
    if (p.statPoints <= 0) return
    p[stat]++
    p.statPoints--
    p.maxHp = getMaxHp(p)
    p.maxMp = getMaxMp(p)
    if (stat === 'vit') p.hp = Math.min(p.hp + 12, p.maxHp)
    if (stat === 'int') p.mp = Math.min(p.mp + 8,  p.maxMp)
    saveGame(p)
    this.refresh()
  }

  refresh() {
    const p = this.player
    this.ptsText.setText(`Points remaining: ${p.statPoints}`)
    ;['str','agi','int','vit'].forEach(s => {
      if (this.statTexts[s]) this.statTexts[s].setText(`${s.toUpperCase()}: ${p[s]}`)
    })
    const done = p.statPoints === 0
    this.doneBtn.setFillStyle(done ? 0x004400 : 0x333333)
    this.doneTxt.setStyle({ fill: done ? '#00ff44' : '#666666' })
  }
}

// ── RankingsScene ──
class RankingsScene extends Phaser.Scene {
  constructor() { super('Rankings') }
  init(data) { this.player = data.player }

  create() {
    const W = this.scale.width, H = this.scale.height
    const rankings = loadRankings()
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.92)')
    this.add.rectangle(W/2, H/2, W-20, H-20, 0x0d1117).setStrokeStyle(1, 0xffd700)
    this.add.text(W/2, 14, 'KINGDOM RANKINGS', { font: '10px monospace', fill: '#ffd700', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5)

    let y = 30
    Object.entries(KINGDOMS).forEach(([kid, k]) => {
      this.add.text(20, y, `${k.icon} ${k.label}`, { font: '8px monospace', fill: k.hexStr }).setDepth(1)
      y += 12
      const entries = rankings[kid] || []
      if (entries.length === 0) {
        this.add.text(30, y, 'No records yet.', { font: '6px monospace', fill: '#555555' })
        y += 10
      } else {
        entries.slice(0, 5).forEach((r, i) => {
          const isMe = r.name === this.player.name
          this.add.text(30, y, `${i+1}. ${r.name.padEnd(12)} Lv${r.level} ${r.job}  Score:${r.score}  PK:${r.pkKills||0}`, {
            font: '6px monospace', fill: isMe ? '#ffdd44' : '#aaaaaa', stroke: '#000', strokeThickness: 1
          })
          y += 9
        })
      }
      y += 4
    })

    this.add.text(W - 16, H - 12, '[R/ESC] Close', { font: '6px monospace', fill: '#888888' }).setOrigin(1, 1)
    this.input.keyboard.on('keydown-R',   () => this.scene.stop('Rankings'))
    this.input.keyboard.on('keydown-ESC', () => this.scene.stop('Rankings'))
  }
}

// ── EndingScene ──
class EndingScene extends Phaser.Scene {
  constructor() { super('Ending') }
  init(data) { this.player = data.player }

  create() {
    const W = this.scale.width, H = this.scale.height
    const p = this.player
    const k = KINGDOMS[p.kingdom] || KINGDOMS.Iron

    this.cameras.main.setBackgroundColor('#000000')
    this.cameras.main.fadeIn(2000, 0, 0, 0)

    // Starfield
    for (let i = 0; i < 80; i++) {
      const star = this.add.rectangle(
        Phaser.Math.Between(0, W), Phaser.Math.Between(0, H),
        1, 1, 0xffffff
      ).setAlpha(Math.random())
      this.tweens.add({ targets: star, alpha: 0, duration: Phaser.Math.Between(1000, 3000), yoyo: true, repeat: -1 })
    }

    const lines = [
      { text: '⚔ KINGDOM OF AETHORIA ⚔', color: '#ffd700', size: '14px', y: H * 0.12 },
      { text: 'THE ABYSSAL GOD HAS FALLEN', color: '#ff4444', size: '11px', y: H * 0.22 },
      { text: `${p.name} of ${k.label}`, color: k.hexStr, size: '10px', y: H * 0.33 },
      { text: `${JOBS[p.job]?.label || 'Wanderer'}  ·  Lv.${p.level}  ·  ${p.kills} Kills`, color: '#ffffff', size: '8px', y: H * 0.42 },
      { text: `Gold: ${p.gold}g  ·  PK: ${p.pkKills||0}  ·  Score: ${rankScore(p)}`, color: '#aaaaaa', size: '7px', y: H * 0.50 },
      { text: 'ABYSSAL CHAMPION', color: '#ffd700', size: '12px', y: H * 0.61 },
      { text: 'The void bows before you.', color: '#888888', size: '7px', y: H * 0.70 },
      { text: 'Your legend is recorded in the Kingdom Rankings forever.', color: '#666666', size: '6px', y: H * 0.78 },
    ]

    lines.forEach((l, i) => {
      const t = this.add.text(W/2, l.y, l.text, {
        font: `${l.size} monospace`, fill: l.color, stroke: '#000', strokeThickness: 2, align: 'center'
      }).setOrigin(0.5).setAlpha(0)
      this.tweens.add({ targets: t, alpha: 1, duration: 800, delay: 500 + i * 600 })
    })

    // Particle celebration
    this.time.delayedCall(2000, () => {
      for (let i = 0; i < 5; i++) {
        this.time.delayedCall(i * 300, () => {
          const colors = [0xffd700, 0xff4444, 0x00ff88, 0x8040c0, 0x4488ff]
          colors.forEach(c => {
            for (let j = 0; j < 4; j++) {
              const px = this.add.rectangle(Phaser.Math.Between(50, W-50), Phaser.Math.Between(50, H-50), 3, 3, c)
              this.tweens.add({ targets: px, alpha: 0, y: '-=60', duration: 1000, onComplete: () => px.destroy() })
            }
          })
        })
      }
    })

    // Back button
    const btn = this.add.text(W/2, H * 0.9, '[ Return to Menu ]', {
      font: '8px monospace', fill: '#ffd700', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0).setInteractive()
    this.tweens.add({ targets: btn, alpha: 1, duration: 800, delay: 5000 })
    btn.on('pointerdown', () => {
      this.scene.stop('Ending')
      this.scene.stop('Overworld')
      bridge.callbacks.returnToMenu?.()
    })
    btn.on('pointerover', () => btn.setStyle({ fill: '#ffffff' }))
    btn.on('pointerout',  () => btn.setStyle({ fill: '#ffd700' }))
  }
}

// ── QuestLogScene ──
class QuestLogScene extends Phaser.Scene {
  constructor() { super('QuestLog') }
  init(data) { this.player = data.player }

  create() {
    const W = this.scale.width, H = this.scale.height
    const p = this.player
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.9)')
    this.add.rectangle(W/2, H/2, W-20, H-20, 0x0d1117).setStrokeStyle(1, 0xffd700)
    this.add.text(W/2, 14, '📜 QUEST LOG', { font: '10px monospace', fill: '#ffd700', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5)

    const allQuests = [
      { id:'first_blood', label:'First Blood',     goal:'kills',        target:10,   items:null, desc:'Kill 10 enemies.',           reward:'200g + 300EXP' },
      { id:'rich_quick',  label:'Supply Run',      goal:'trades',       target:5,    items:null, desc:'Buy or sell 5 times.',       reward:'300g + Elixir' },
      { id:'boss_slayer', label:'Boss Slayer',      goal:'bossKills',   target:3,    items:null, desc:'Defeat 3 zone bosses.',      reward:'1000g + 2000EXP' },
      { id:'rep_grind',   label:'Kingdom Champion', goal:'reputation',  target:1000, items:null, desc:'1000 rep with home kingdom.',reward:'500g' },
      { id:'relic_hunt',  label:'Relic Hunt',       goal:'inventory_all',target:null,items:['Drake Scale','Ancient Core','Void Crystal'], desc:'Collect the 3 ancient relics.', reward:'2000g + 5000EXP' },
    ]

    let y = 32
    allQuests.forEach(q => {
      const done = p.quests?.[q.id]
      let prog = ''
      if (!done) {
        if (q.goal === 'kills')          prog = `${p.kills||0}/${q.target}`
        if (q.goal === 'trades')         prog = `${p.trades||0}/${q.target}`
        if (q.goal === 'bossKills')      prog = `${Object.keys(p.bossKills||{}).length}/${q.target}`
        if (q.goal === 'reputation')     prog = `${Math.max(...Object.values(p.reputation||{0:0}))}/${q.target}`
        if (q.goal === 'inventory_all')  prog = q.items.map(it => `${it.split(' ')[0]}:${p.inventory?.includes(it)?'✓':'✗'}`).join(' ')
      }

      const statusColor = done ? '#00ff88' : '#ffdd44'
      const statusLabel = done ? '✓ COMPLETE' : `⋯ ${prog}`

      this.add.text(20, y, `${q.label}`, { font: '8px monospace', fill: statusColor }).setOrigin(0, 0)
      this.add.text(W - 20, y, statusLabel, { font: '7px monospace', fill: statusColor }).setOrigin(1, 0)
      y += 10
      this.add.text(24, y, q.desc, { font: '6px monospace', fill: '#888888' }).setOrigin(0, 0)
      this.add.text(W - 20, y, `Reward: ${q.reward}`, { font: '6px monospace', fill: '#aa8833' }).setOrigin(1, 0)
      y += 14
    })

    // Succession quest hint
    y += 4
    const bossCount = Object.keys(p.bossKills || {}).length
    const hasRelics = ['Drake Scale','Ancient Core','Void Crystal'].every(it => p.inventory?.includes(it))
    const succUnlocked = bossCount >= 5 || hasRelics
    this.add.text(W/2, y, '── SUCCESSION QUEST ──', { font: '7px monospace', fill: succUnlocked ? '#ff4444' : '#444444' }).setOrigin(0.5); y += 12
    this.add.text(W/2, y, succUnlocked
      ? 'Travel to Abyss and face the Abyssal God! (Lv 25+)'
      : 'Defeat 5 bosses or collect 3 relics to unlock the final trial.',
      { font: '6px monospace', fill: succUnlocked ? '#ff8888' : '#555555', align:'center', wordWrap:{width:W-40} }).setOrigin(0.5)

    this.add.text(W - 16, H - 12, '[Q/ESC] Close', { font: '6px monospace', fill: '#888888' }).setOrigin(1, 1)
    this.input.keyboard.on('keydown-Q',   () => this.scene.stop('QuestLog'))
    this.input.keyboard.on('keydown-ESC', () => this.scene.stop('QuestLog'))
  }
}

// ── CraftingScene ──
class CraftingScene extends Phaser.Scene {
  constructor() { super('Crafting') }
  init(data) { this.player = data.player }

  create() {
    const W = this.scale.width, H = this.scale.height
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.9)')
    this.add.rectangle(W/2, H/2, W-20, H-20, 0x0d1117).setStrokeStyle(1, 0x44ff88)
    this.add.text(W/2, 14, '⚒ CRAFTING', { font: '10px monospace', fill: '#44ff88', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5)
    this.add.text(W/2, 27, 'Click a recipe to craft it', { font: '6px monospace', fill: '#888888' }).setOrigin(0.5)

    let y = 42
    CRAFTING.forEach(recipe => {
      const canCraft = recipe.needs.every(ingredient => this.player.inventory.includes(ingredient))
      const color = canCraft ? '#88ff88' : '#555555'

      const row = this.add.text(W/2, y, `${recipe.desc}`, {
        font: '6px monospace', fill: color, stroke: '#000', strokeThickness: 1
      }).setOrigin(0.5, 0)

      if (canCraft) {
        row.setInteractive()
        row.on('pointerover', () => row.setStyle({ fill: '#ffffff' }))
        row.on('pointerout',  () => row.setStyle({ fill: color }))
        row.on('pointerdown', () => this.craft(recipe))
      }
      y += 12
    })

    // Inventory summary
    y += 10
    this.add.text(W/2, y, '── Your Materials ──', { font: '6px monospace', fill: '#888888' }).setOrigin(0.5)
    y += 10
    const mats = this.player.inventory.filter(n => ITEMS[n]?.type === 'material')
    const counts = {}
    mats.forEach(m => { counts[m] = (counts[m]||0)+1 })
    Object.entries(counts).forEach(([name, cnt]) => {
      this.add.text(W/2, y, `${name} ×${cnt}`, { font: '6px monospace', fill: '#aaffaa' }).setOrigin(0.5)
      y += 9
    })
    if (Object.keys(counts).length === 0) {
      this.add.text(W/2, y, 'No materials.', { font: '6px monospace', fill: '#555555' }).setOrigin(0.5)
    }

    this.add.text(W - 16, H - 12, '[C/ESC] Close', { font: '6px monospace', fill: '#888888' }).setOrigin(1, 1)
    this.input.keyboard.on('keydown-C',   () => this.scene.stop('Crafting'))
    this.input.keyboard.on('keydown-ESC', () => this.scene.stop('Crafting'))
  }

  craft(recipe) {
    const p = this.player
    // Remove ingredients
    recipe.needs.forEach(ingredient => {
      const idx = p.inventory.indexOf(ingredient)
      if (idx !== -1) p.inventory.splice(idx, 1)
    })
    p.inventory.push(recipe.result)
    saveGame(p)
    // Restart scene to refresh
    this.scene.restart()
  }
}

// ── ReputationScene ──
class ReputationScene extends Phaser.Scene {
  constructor() { super('Reputation') }
  init(data) { this.player = data.player }

  create() {
    const W = this.scale.width, H = this.scale.height
    const p = this.player
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0.9)')
    this.add.rectangle(W/2, H/2, W-20, H-20, 0x0d1117).setStrokeStyle(1, 0xff8844)
    this.add.text(W/2, 14, '◎ REPUTATION', { font: '10px monospace', fill: '#ff8844', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5)

    let y = 36
    Object.entries(KINGDOMS).forEach(([kid, k]) => {
      const rep = (p.reputation?.[kid] || 0)
      const title = getRepTitle(rep)
      const barW = Math.min(200, Math.max(0, Math.floor((rep / 5000) * 200)))
      const barColor = rep >= 0 ? Phaser.Display.Color.HexStringToColor(k.hexStr.replace('#','')).color : 0xff2222

      this.add.text(30, y, `${k.icon} ${k.label}`, { font: '8px monospace', fill: k.hexStr }).setOrigin(0, 0.5)
      this.add.text(W - 30, y, `${title} (${rep})`, { font: '7px monospace', fill: rep >= 0 ? '#88ff88' : '#ff4444' }).setOrigin(1, 0.5)
      y += 12

      // Bar
      this.add.rectangle(30 + 100, y, 200, 6, 0x222222).setOrigin(0.5)
      if (barW > 0) this.add.rectangle(30, y, barW, 6, barColor).setOrigin(0, 0.5)
      y += 14
    })

    // Boss kills
    y += 8
    this.add.text(W/2, y, '── Boss Kills ──', { font: '7px monospace', fill: '#ff4444' }).setOrigin(0.5); y += 12
    const bossKills = p.bossKills || {}
    Object.entries(BOSSES).forEach(([zid, boss]) => {
      const killed = bossKills[zid]
      this.add.text(W/2, y, `${boss.name}: ${killed ? '✓ SLAIN' : '○ Alive'}`, {
        font: '6px monospace', fill: killed ? '#ff4444' : '#555555'
      }).setOrigin(0.5); y += 10
    })

    // PK stats
    y += 4
    this.add.text(W/2, y, `PK Kills: ${p.pkKills||0}  Deaths: ${p.pkDeaths||0}`, { font: '6px monospace', fill: '#ff8844' }).setOrigin(0.5)

    this.add.text(W - 16, H - 12, '[P/ESC] Close', { font: '6px monospace', fill: '#888888' }).setOrigin(1, 1)
    this.input.keyboard.on('keydown-P',   () => this.scene.stop('Reputation'))
    this.input.keyboard.on('keydown-ESC', () => this.scene.stop('Reputation'))
  }
}

// ══════════════════════════════════════════════════════════
// REACT COMPONENT
// ══════════════════════════════════════════════════════════

export default function Game() {
  const containerRef = useRef(null)
  const gameRef      = useRef(null)

  const [screen, setScreen] = useState('menu') // menu | create | play | loading
  const [savedPlayer, setSavedPlayer] = useState(null)
  const [charName, setCharName]   = useState('')
  const [kingdom,  setKingdom]    = useState('Iron')
  const [error,    setError]      = useState('')
  const [rankings, setRankings]   = useState({})

  useEffect(() => {
    const saved = loadGame()
    if (saved) setSavedPlayer(saved)
    setRankings(loadRankings())
  }, [])

  // Start Phaser when entering 'play'
  useEffect(() => {
    if (screen !== 'play') return
    if (!containerRef.current) return

    const config = {
      type: Phaser.AUTO,
      width:  containerRef.current.offsetWidth  || 640,
      height: containerRef.current.offsetHeight || 480,
      parent: containerRef.current,
      backgroundColor: '#0d1117',
      pixelArt: true,
      antialias: false,
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      scene: [BootScene, OverworldScene, CombatScene, ShopScene, InventoryScene, ZoneMapScene, StatAllocScene, RankingsScene, CraftingScene, ReputationScene, QuestLogScene, EndingScene],
    }

    const game = new Phaser.Game(config)
    gameRef.current = game

    bridge.callbacks.returnToMenu = () => {
      if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null }
      setScreen('menu')
      setSavedPlayer(loadGame())
      setRankings(loadRankings())
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [screen])

  function startNewGame() {
    if (!charName.trim()) { setError('Enter a name!'); return }
    const player = initPlayer(charName.trim(), kingdom)
    bridge.player = player
    bridge.worldEvent = null
    bridge.discoveredZones = ['Capital','Forest','Mountains']
    saveGame(player)
    saveRanking(player)
    setScreen('play')
  }

  function continueGame() {
    if (!savedPlayer) return
    bridge.player = savedPlayer
    bridge.worldEvent = null
    bridge.discoveredZones = ['Capital','Forest','Mountains','Shadow','Ruins']
    setScreen('play')
  }

  function quitGame() {
    if (bridge.player) { saveGame(bridge.player); saveRanking(bridge.player) }
    if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null }
    setScreen('menu')
    setSavedPlayer(loadGame())
    setRankings(loadRankings())
  }

  // ── MENU ──
  if (screen === 'menu') {
    const topRankers = Object.entries(rankings).flatMap(([kid, entries]) =>
      (entries || []).slice(0, 3).map(e => ({ ...e, kingdom: kid }))
    ).sort((a, b) => b.score - a.score).slice(0, 8)

    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(180deg, #0d1117 0%, #1a0d2e 50%, #0d1117 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Courier New", monospace', color: '#fff', padding: '20px',
        userSelect: 'none',
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 32, fontWeight: 'bold', letterSpacing: 8, color: '#ffd700', textShadow: '0 0 20px #ffd70088' }}>
            ⚔ KINGDOM OF AETHORIA ⚔
          </div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 8, letterSpacing: 4 }}>
            PIXEL MMORPG — SINGLE PLAYER EDITION
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', marginBottom: 40 }}>
          {savedPlayer && (
            <button onClick={continueGame} style={btnStyle('#00cc66', '#004422')}>
              ▶ Continue — {savedPlayer.name} Lv.{savedPlayer.level} [{JOBS[savedPlayer.job]?.label || 'Wanderer'}]
            </button>
          )}
          <button onClick={() => setScreen('create')} style={btnStyle('#4488ff', '#112244')}>
            ✦ New Game
          </button>
          <button onClick={() => setScreen('rankings')} style={btnStyle('#ffd700', '#332200')}>
            ◆ Rankings
          </button>
        </div>

        {/* Top rankings preview */}
        {topRankers.length > 0 && (
          <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #333', borderRadius: 4, padding: '16px 24px', minWidth: 340 }}>
            <div style={{ color: '#ffd700', fontSize: 11, letterSpacing: 2, marginBottom: 10 }}>★ HALL OF LEGENDS ★</div>
            {topRankers.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#aaa', marginBottom: 4 }}>
                <span style={{ color: KINGDOMS[r.kingdom]?.hexStr }}>{i+1}. {r.name}</span>
                <span>Lv.{r.level} {r.job}</span>
                <span style={{ color: '#ffd700' }}>{r.score}pts</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 20, fontSize: 10, color: '#555', textAlign: 'center' }}>
          WASD: Move  |  E: Shop  |  K: Fight  |  B: Boss  |  I: Inventory  |  C: Craft  |  M: Map  |  P: Reputation  |  R: Rankings
        </div>
      </div>
    )
  }

  // ── RANKINGS PAGE ──
  if (screen === 'rankings') {
    return (
      <div style={{
        minHeight: '100vh', background: '#0d1117', display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '40px 20px', fontFamily: '"Courier New", monospace', color: '#fff',
      }}>
        <div style={{ fontSize: 22, color: '#ffd700', letterSpacing: 4, marginBottom: 30 }}>◆ KINGDOM RANKINGS ◆</div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Object.entries(KINGDOMS).map(([kid, k]) => (
            <div key={kid} style={{ background: 'rgba(0,0,0,0.6)', border: `1px solid ${k.hexStr}`, borderRadius: 4, padding: '16px 20px', minWidth: 200 }}>
              <div style={{ color: k.hexStr, fontSize: 14, marginBottom: 10 }}>{k.icon} {k.label}</div>
              {(rankings[kid] || []).length === 0
                ? <div style={{ color: '#555', fontSize: 11 }}>No records.</div>
                : (rankings[kid] || []).map((r, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#aaa', marginBottom: 4 }}>
                    <span style={{ color: '#ffd700' }}>{i+1}.</span> {r.name} Lv{r.level} [{r.job}] — {r.score}pts
                  </div>
                ))
              }
            </div>
          ))}
        </div>
        <button onClick={() => setScreen('menu')} style={{ ...btnStyle('#888', '#222'), marginTop: 30 }}>← Back</button>
      </div>
    )
  }

  // ── CHARACTER CREATE ──
  if (screen === 'create') {
    return (
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(180deg, #0d1117 0%, #1a0d2e 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Courier New", monospace', color: '#fff', padding: '20px',
      }}>
        <div style={{ fontSize: 20, color: '#ffd700', letterSpacing: 4, marginBottom: 30 }}>CREATE HERO</div>

        {/* Name input */}
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 8, letterSpacing: 2 }}>HERO NAME</div>
          <input
            value={charName}
            onChange={e => { setCharName(e.target.value); setError('') }}
            maxLength={16}
            placeholder="Enter name..."
            style={{
              background: '#111', border: '1px solid #444', color: '#fff', padding: '8px 16px',
              fontFamily: '"Courier New", monospace', fontSize: 14, borderRadius: 2, outline: 'none',
              textAlign: 'center', letterSpacing: 2,
            }}
          />
          {error && <div style={{ color: '#ff4444', fontSize: 11, marginTop: 6 }}>{error}</div>}
        </div>

        {/* Kingdom selection */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: '#888', letterSpacing: 2, textAlign: 'center', marginBottom: 12 }}>CHOOSE KINGDOM</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {Object.entries(KINGDOMS).map(([kid, k]) => (
              <div
                key={kid}
                onClick={() => setKingdom(kid)}
                style={{
                  border: `2px solid ${kingdom === kid ? k.hexStr : '#333'}`,
                  background: kingdom === kid ? `${k.hexStr}22` : '#0a0a15',
                  borderRadius: 4, padding: '16px 20px', cursor: 'pointer', width: 180,
                  transition: 'all 0.2s', userSelect: 'none',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 6 }}>{k.icon}</div>
                <div style={{ color: k.hexStr, fontSize: 12, marginBottom: 6, letterSpacing: 1 }}>{k.label}</div>
                <div style={{ color: '#aaa', fontSize: 10, marginBottom: 10, lineHeight: 1.5 }}>{k.desc}</div>
                <div style={{ fontSize: 10, color: '#666' }}>
                  {Object.entries(k.bonus).map(([s,v]) => (
                    <span key={s} style={{ color: '#88ff88', marginRight: 8 }}>+{v} {s.toUpperCase()}</span>
                  ))}
                </div>
                <div style={{ fontSize: 9, color: '#555', marginTop: 6, fontStyle: 'italic' }}>{k.lore}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stat preview */}
        <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #333', borderRadius: 4, padding: '12px 24px', marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#888', letterSpacing: 2, marginBottom: 8 }}>BASE STATS PREVIEW</div>
          {(() => {
            const b = KINGDOMS[kingdom].bonus
            const base = { str: 5 + (b.str||0), agi: 5 + (b.agi||0), int: 5 + (b.int||0), vit: 5 + (b.vit||0) }
            return (
              <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
                {Object.entries(base).map(([s, v]) => (
                  <div key={s}>
                    <span style={{ color: '#888' }}>{s.toUpperCase()} </span>
                    <span style={{ color: '#88ff88', fontWeight: 'bold' }}>{v}</span>
                    {(b[s]||0) > 0 && <span style={{ color: KINGDOMS[kingdom].hexStr }}> (+{b[s]})</span>}
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setScreen('menu')} style={btnStyle('#666', '#222')}>← Back</button>
          <button onClick={startNewGame} style={btnStyle(KINGDOMS[kingdom].hexStr, '#110a00')}>
            Begin Journey ⚔
          </button>
        </div>
      </div>
    )
  }

  // ── PLAY (Phaser canvas) ──
  if (screen === 'play') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100vh', background: '#0d1117' }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        <button
          onClick={quitGame}
          style={{
            position: 'absolute', top: 8, right: 8, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)', border: '1px solid #444', color: '#888',
            fontFamily: '"Courier New", monospace', fontSize: 10, padding: '4px 10px',
            cursor: 'pointer', borderRadius: 2,
          }}
        >
          Menu
        </button>
      </div>
    )
  }

  return null
}

function btnStyle(border, bg) {
  return {
    background: bg, border: `1px solid ${border}`, color: '#fff',
    fontFamily: '"Courier New", monospace', fontSize: 13, padding: '10px 28px',
    cursor: 'pointer', borderRadius: 2, letterSpacing: 2, transition: 'all 0.2s',
  }
}
