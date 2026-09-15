function abilityMod(score) {
  return Math.floor((score - 10) / 2)
}

function proficiencyBonus(level) {
  return 2 + Math.floor((level - 1) / 4)
}

function hitDieAverage(die) {
  return Math.floor(die / 2) + 1
}

function hpGain(roll, conMod, extraPerLevel) {
  return Math.max(1, roll + conMod) + (extraPerLevel || 0)
}

function maxHp({ hitDie, conMod, extraPerLevel, rolls }) {
  const extra = extraPerLevel || 0
  let hp = hitDie + conMod + extra
  for (const roll of rolls || []) hp += hpGain(roll, conMod, extra)
  return hp
}

const FULL = {
  1: [2],
  2: [3],
  3: [4, 2],
  4: [4, 3],
  5: [4, 3, 2],
  6: [4, 3, 3],
  7: [4, 3, 3, 1],
  8: [4, 3, 3, 2],
  9: [4, 3, 3, 3, 1],
  10: [4, 3, 3, 3, 2],
  11: [4, 3, 3, 3, 2, 1],
  12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1],
  14: [4, 3, 3, 3, 2, 1, 1],
  15: [4, 3, 3, 3, 2, 1, 1, 1],
  16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
}

const HALF = {
  2: [2],
  3: [3],
  4: [3],
  5: [4, 2],
  6: [4, 2],
  7: [4, 3],
  8: [4, 3],
  9: [4, 3, 2],
  10: [4, 3, 2],
  11: [4, 3, 3],
  12: [4, 3, 3],
  13: [4, 3, 3, 1],
  14: [4, 3, 3, 1],
  15: [4, 3, 3, 2],
  16: [4, 3, 3, 2],
  17: [4, 3, 3, 3, 1],
  18: [4, 3, 3, 3, 1],
  19: [4, 3, 3, 3, 2],
  20: [4, 3, 3, 3, 2]
}

const THIRD = {
  3: [2],
  4: [3],
  5: [3],
  6: [3],
  7: [4, 2],
  8: [4, 2],
  9: [4, 2],
  10: [4, 3],
  11: [4, 3],
  12: [4, 3],
  13: [4, 3, 2],
  14: [4, 3, 2],
  15: [4, 3, 2],
  16: [4, 3, 3],
  17: [4, 3, 3],
  18: [4, 3, 3],
  19: [4, 3, 3, 1],
  20: [4, 3, 3, 1]
}

function warlockSlots(level) {
  if (level <= 2) return { circle: 1, max: 1 }
  if (level <= 4) return { circle: 2, max: 2 }
  if (level <= 6) return { circle: 3, max: 2 }
  if (level <= 8) return { circle: 4, max: 2 }
  if (level <= 10) return { circle: 5, max: 2 }
  if (level <= 16) return { circle: 5, max: 3 }
  return { circle: 5, max: 4 }
}

function toSlots(arr) {
  const out = {}
  if (!arr) return out
  arr.forEach((max, i) => {
    if (max > 0) out[i + 1] = { max, used: 0 }
  })
  return out
}

function slotsFor(caster, level) {
  if (caster === 'full') return toSlots(FULL[level])
  if (caster === 'half') return toSlots(HALF[level])
  if (caster === 'third') return toSlots(THIRD[level])
  if (caster === 'warlock') {
    const w = warlockSlots(level)
    return { [w.circle]: { max: w.max, used: 0 } }
  }
  return {}
}

function maxSlotLevel(caster, level) {
  const slots = slotsFor(caster, level)
  let m = 0
  for (const k of Object.keys(slots)) {
    const n = Number(k)
    if (n > m) m = n
  }
  return m
}

function canLearnSpell(spell, classId, maxLevel) {
  if (!spell) return false
  if ((spell.classes || []).indexOf(classId) < 0) return false
  if (spell.level < 1 || spell.level > maxLevel) return false
  return true
}

function casterOf(classDef, subclass) {
  if (subclass === 'eldritch-knight' || subclass === 'arcane-trickster') return 'third'
  return classDef.caster
}

function catalogPick(catalog, level) {
  if (catalog.pickAt) {
    let p = 0
    for (const row of catalog.pickAt) {
      if (level >= row.level) p = row.pick
    }
    return p
  }
  return catalog.pick || 1
}

function choiceDue(catalog, character) {
  const need = catalogPick(catalog, character.level)
  if (!need) return false
  const have = (character.choices && character.choices[catalog.id]) || []
  if (have.length >= need) return false
  return (catalog.when || []).some(w => {
    if (w.class && w.class !== character.class) return false
    if (w.subclass && w.subclass !== character.subclass) return false
    if ((w.level || 1) > character.level) return false
    return true
  })
}

function pendingFor(character, classDef, catalogs) {
  const pending = []
  const level = character.level
  if (classDef && classDef.subclassLevel && classDef.subclassLevel <= level && !character.subclass) {
    pending.push({
      id: 'subclass-' + classDef.subclassLevel,
      type: 'subclass',
      level: classDef.subclassLevel
    })
  }
  const taken = character.asiTaken || []
  for (const L of (classDef && classDef.asiLevels) || []) {
    if (L <= level && !taken.includes(L)) {
      pending.push({ id: 'asi-' + L, type: 'asi', level: L })
    }
  }
  const picks = classDef && classDef.spellPicks
  if (picks) {
    let need = 0
    if (level >= 1) need += picks[1] || 0
    for (let L = 2; L <= level; L++) need += picks.later || 0
    const have = (character.spells || []).length
    const missing = need - have
    if (missing > 0) pending.push({ id: 'spells', type: 'spells', count: missing })
  }
  if (catalogs) {
    for (const cat of Object.values(catalogs)) {
      if (!choiceDue(cat, character)) continue
      const have = (character.choices && character.choices[cat.id]) || []
      const need = catalogPick(cat, character.level)
      pending.push({
        id: 'choice-' + cat.id,
        type: 'choice',
        catalog: cat.id,
        pick: need,
        have: have.length,
        name: cat.name,
        label: cat.name + '（選 ' + need + '）'
      })
    }
  }
  return pending
}

function createCharacter(input, data) {
  const race = data.races[input.race]
  const cls = data.classes[input.class]
  const abilities = Object.assign({}, input.abilities)
  if ((input.ruleset || '2014') !== '2024') {
    const bonuses = (race && race.bonuses) || {}
    for (const k of Object.keys(bonuses)) abilities[k] = (abilities[k] || 0) + bonuses[k]
  }
  const conMod = abilityMod(abilities.con)
  const extra = (race && race.extraHpPerLevel) || 0
  const hpRolls = (input.hpRolls || []).slice()
  const hp = input.hpMax != null
    ? input.hpMax
    : maxHp({ hitDie: cls.hitDie, conMod, extraPerLevel: extra, rolls: hpRolls })
  const prof = proficiencyBonus(input.level)
  const dexMod = abilityMod(abilities.dex)
  const strMod = abilityMod(abilities.str)
  const caster = casterOf(cls, null)
  const saves = { str: false, dex: false, con: false, int: false, wis: false, cha: false }
  for (const s of cls.saves) saves[s] = true
  const atk = cls.defaultAttack || { name: '徒手', damageDie: 1 }
  const dmg =
    strMod >= 0 ? '1d' + atk.damageDie + '+' + strMod : '1d' + atk.damageDie + strMod
  const character = {
    id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: input.name,
    race: input.race,
    class: input.class,
    level: input.level,
    abilities,
    hp: { current: hp, max: hp },
    hpRolls,
    ac: 10 + dexMod,
    spellSlots: slotsFor(caster, input.level),
    spells: [],
    attacks: [{ name: atk.name, bonus: prof + strMod, damage: dmg }],
    feats: [],
    subclass: null,
    pendingChoices: [],
    proficiency: prof,
    speed: race.speed,
    initiative: dexMod,
    saves,
    skillProf: [],
    resources: (cls.resources || []).map(r => ({ id: r.id, name: r.name, rest: r.rest, used: 0, max: r.max || 1 })),
    conditions: [],
    deathSaves: { success: 0, fail: 0 },
    asiTaken: [],
    ruleset: input.ruleset || '2014',
    money: { gp: 0, sp: 0, cp: 0 },
    concentrating: false,
    gear: [],
    choices: {}
  }
  character.pendingChoices = pendingFor(character, cls, data.choices)
  return character
}

function clone(c) {
  return JSON.parse(JSON.stringify(c))
}

function mergeSlots(oldSlots, fresh) {
  const merged = {}
  for (const k of Object.keys(fresh || {})) {
    const used = (oldSlots && oldSlots[k] && oldSlots[k].used) || 0
    merged[k] = { max: fresh[k].max, used: Math.min(used, fresh[k].max) }
  }
  return merged
}

function setSubclass(character, subclassId, data) {
  const next = clone(character)
  const cls = data.classes[next.class]
  next.subclass = subclassId || null
  next.pendingChoices = pendingFor(next, cls, data.choices)
  next.spellSlots = mergeSlots(next.spellSlots, slotsFor(casterOf(cls, next.subclass), next.level))
  return next
}

function setChoices(character, catalogId, optionIds, data) {
  const cat = data.choices && data.choices[catalogId]
  if (!cat) return { ok: false }
  const allowed = {}
  for (const o of cat.options || []) {
    if (o.classes && o.classes.indexOf(character.class) < 0) continue
    if (o.minLevel && character.level < o.minLevel) continue
    allowed[o.id] = true
  }
  const ids = []
  for (const id of optionIds || []) {
    if (allowed[id] && ids.indexOf(id) < 0) ids.push(id)
  }
  if (ids.length !== catalogPick(cat, character.level)) return { ok: false }
  const next = clone(character)
  next.choices = Object.assign({}, next.choices || {})
  next.choices[catalogId] = ids
  next.pendingChoices = pendingFor(next, data.classes[next.class], data.choices)
  return { ok: true, character: next }
}

function clearChoices(character, catalogId, data) {
  const next = clone(character)
  next.choices = Object.assign({}, next.choices || {})
  delete next.choices[catalogId]
  next.pendingChoices = pendingFor(next, data.classes[next.class], data.choices)
  return next
}

function selectedPowers(character, catalogs) {
  const out = []
  if (!catalogs) return out
  for (const cid of Object.keys(character.choices || {})) {
    const cat = catalogs[cid]
    if (!cat) continue
    for (const id of character.choices[cid] || []) {
      const opt = (cat.options || []).filter(o => o.id === id)[0]
      if (opt) out.push({ catalog: cid, catalogName: cat.name, id: opt.id, name: opt.name, text: opt.text })
    }
  }
  return out
}

function addSpell(character, spellId, data) {
  const next = clone(character)
  next.spells = (next.spells || []).slice()
  if (spellId && next.spells.indexOf(spellId) < 0) next.spells.push(spellId)
  next.pendingChoices = pendingFor(next, data.classes[next.class], data.choices)
  return next
}

function removeSpell(character, spellId, data) {
  const next = clone(character)
  next.spells = (next.spells || []).filter(id => id !== spellId)
  next.pendingChoices = pendingFor(next, data.classes[next.class], data.choices)
  return next
}

function extraHp(character, data) {
  const race = data.races[character.race]
  return (race && race.extraHpPerLevel) || 0
}

function checklistFor(character, data) {
  const cls = data.classes && data.classes[character.class]
  const next = character.level + 1
  if (!cls || next > 20) {
    return [{ id: 'missing', type: 'missing', label: '這筆資料還沒做' }]
  }
  const conMod = abilityMod(character.abilities.con)
  const extra = extraHp(character, data)
  const items = [{
    id: 'hp',
    type: 'hp',
    hitDie: cls.hitDie,
    conMod,
    extra,
    label: '生命骰 d' + cls.hitDie + ' ＋體質 ' + (conMod >= 0 ? '+' : '') + conMod
  }]
  if (cls.subclassLevel === next && !character.subclass) {
    items.push({ id: 'subclass-' + next, type: 'subclass', level: next })
  }
  if ((cls.asiLevels || []).includes(next)) {
    items.push({ id: 'asi-' + next, type: 'asi', level: next })
  }
  if (cls.spellPicks && (cls.spellPicks.later || 0) > 0) {
    items.push({ id: 'spells', type: 'spells', count: cls.spellPicks.later })
  }
  if (data.choices) {
    const probe = Object.assign({}, character, { level: next })
    for (const cat of Object.values(data.choices)) {
      if (!choiceDue(cat, probe)) continue
      items.push({
        id: 'choice-' + cat.id,
        type: 'choice',
        catalog: cat.id,
        pick: catalogPick(cat, next),
        name: cat.name,
        label: cat.name + '（選 ' + catalogPick(cat, next) + '）'
      })
    }
  }
  return items
}

function applyLevelUp(character, checkedIds, data, opts) {
  const list = checklistFor(character, data)
  if (list.some(x => x.type === 'missing')) return { ok: false }
  const missing = list.filter(x => checkedIds.indexOf(x.id) === -1).map(x => x.id)
  if (missing.length) return { ok: false, missing }
  const cls = data.classes[character.class]
  const roll = opts && Number(opts.hpRoll)
  if (!roll || roll < 1 || roll > cls.hitDie) return { ok: false, missing: ['hpRoll'] }
  const next = clone(character)
  const newLevel = next.level + 1
  next.level = newLevel
  const conMod = abilityMod(next.abilities.con)
  const gained = hpGain(roll, conMod, extraHp(next, data))
  next.hp.max += gained
  next.hp.current = Math.min(next.hp.max, next.hp.current + gained)
  next.hpRolls = (next.hpRolls || []).concat([roll])
  next.proficiency = proficiencyBonus(newLevel)
  const fresh = slotsFor(casterOf(cls, next.subclass), newLevel)
  const merged = {}
  for (const k of Object.keys(fresh)) {
    const used = (next.spellSlots[k] && next.spellSlots[k].used) || 0
    merged[k] = { max: fresh[k].max, used: Math.min(used, fresh[k].max) }
  }
  next.spellSlots = merged
  if ((cls.asiLevels || []).includes(newLevel)) {
    next.asiTaken = (next.asiTaken || []).concat([newLevel])
  }
  next.pendingChoices = pendingFor(next, cls, data.choices)
  return { ok: true, character: next }
}

function spellMod(character, classDef) {
  const abi = (classDef && classDef.primary) || 'int'
  return abilityMod(character.abilities[abi] || 10)
}

function spellSaveDC(character, classDef) {
  return 8 + (character.proficiency || 2) + spellMod(character, classDef)
}

function spellAttack(character, classDef) {
  return (character.proficiency || 2) + spellMod(character, classDef)
}

function changeHp(character, delta) {
  const next = clone(character)
  next.hp.current = Math.max(0, Math.min(next.hp.max, next.hp.current + delta))
  return next
}

function useSpellSlot(character, circle) {
  const slot = character.spellSlots && character.spellSlots[circle]
  if (!slot || slot.used >= slot.max) return { ok: false }
  const next = clone(character)
  next.spellSlots[String(circle)].used += 1
  return { ok: true, character: next }
}

function setSlotUsed(character, circle, used) {
  const slot = character.spellSlots && character.spellSlots[circle]
  if (!slot) return { ok: false }
  const next = clone(character)
  const key = String(circle)
  next.spellSlots[key].used = Math.max(0, Math.min(next.spellSlots[key].max, Number(used) || 0))
  return { ok: true, character: next }
}

function syncSpellSlots(character, data) {
  const cls = data.classes && data.classes[character.class]
  if (!cls) return character
  const fresh = slotsFor(casterOf(cls, character.subclass), character.level)
  const cur = character.spellSlots || {}
  let changed = false
  const next = {}
  for (const k of Object.keys(cur)) next[k] = cur[k]
  for (const k of Object.keys(fresh)) {
    if (!next[k]) {
      next[k] = { max: fresh[k].max, used: 0 }
      changed = true
    } else if (fresh[k].max > next[k].max) {
      next[k] = { max: fresh[k].max, used: Math.min(next[k].used, fresh[k].max) }
      changed = true
    }
  }
  if (!changed) return character
  const out = clone(character)
  out.spellSlots = next
  return out
}

function setSlotMax(character, circle, max) {
  const next = clone(character)
  const key = String(circle)
  const n = Number(max)
  if (!n || n < 0) return next
  const prev = (next.spellSlots && next.spellSlots[key]) || { max: 0, used: 0 }
  next.spellSlots = next.spellSlots || {}
  next.spellSlots[key] = { max: n, used: Math.min(prev.used, n) }
  return next
}

function longRest(character) {
  const next = clone(character)
  next.hp.current = next.hp.max
  for (const k of Object.keys(next.spellSlots || {})) next.spellSlots[k].used = 0
  next.deathSaves = { success: 0, fail: 0 }
  for (const r of next.resources || []) r.used = 0
  return next
}

function shortRest(character) {
  const next = clone(character)
  if (next.class === 'warlock') {
    for (const k of Object.keys(next.spellSlots || {})) next.spellSlots[k].used = 0
  }
  for (const r of next.resources || []) {
    if (r.rest === 'shortRest') r.used = 0
  }
  return next
}

const Rules = {
  abilityMod,
  proficiencyBonus,
  hitDieAverage,
  hpGain,
  maxHp,
  slotsFor,
  maxSlotLevel,
  canLearnSpell,
  pendingFor,
  createCharacter,
  casterOf,
  checklistFor,
  applyLevelUp,
  spellSaveDC,
  spellAttack,
  changeHp,
  useSpellSlot,
  setSlotUsed,
  setSlotMax,
  syncSpellSlots,
  longRest,
  shortRest,
  setSubclass,
  setChoices,
  clearChoices,
  selectedPowers,
  choiceDue,
  catalogPick,
  addSpell,
  removeSpell
}

if (typeof module !== 'undefined') module.exports = Rules
if (typeof globalThis !== 'undefined') globalThis.Rules = Rules
