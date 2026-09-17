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

function slotsFor(caster, level, ruleset) {
  if (caster === 'half' && ruleset === '2024') return toSlots(HALF[Math.min(20, (level || 1) + 1)])
  if (caster === 'full') return toSlots(FULL[level])
  if (caster === 'half') return toSlots(HALF[level])
  if (caster === 'third') return toSlots(THIRD[level])
  if (caster === 'warlock') {
    const w = warlockSlots(level)
    return { [w.circle]: { max: w.max, used: 0 } }
  }
  return {}
}

function maxSlotLevel(caster, level, ruleset) {
  const slots = slotsFor(caster, level, ruleset)
  let m = 0
  for (const k of Object.keys(slots)) {
    const n = Number(k)
    if (n > m) m = n
  }
  return m
}

function spellListClass(classId, subclass) {
  if (subclass === 'eldritch-knight' || subclass === 'arcane-trickster') return 'wizard'
  return classId
}

function subclassSchools(subclass) {
  if (subclass === 'eldritch-knight') return ['防護', '塑能']
  if (subclass === 'arcane-trickster') return ['惑控', '幻術']
  return null
}

function canLearnSpell(spell, classId, maxLevel, opts) {
  if (!spell) return false
  if ((spell.classes || []).indexOf(classId) < 0) return false
  const min = opts && opts.cantrips ? 0 : 1
  if (spell.level < min || spell.level > maxLevel) return false
  if (!(opts && opts.cantrips)) {
    const schools = subclassSchools(opts && opts.subclass)
    if (schools && schools.indexOf(spell.school) < 0 && !(opts && opts.allowOffSchool)) return false
  }
  return true
}

function knownSpellNeed(picks, level) {
  if (!picks || !level) return 0
  if (picks.byLevel) return picks.byLevel[level] || 0
  const start = picks.start || 1
  if (level < start) return 0
  let need = picks[start] || picks[1] || 0
  for (let L = start + 1; L <= level; L++) need += picks.later || 0
  return need
}

function anySchoolCap(level) {
  if (level >= 20) return 4
  if (level >= 14) return 3
  if (level >= 8) return 2
  if (level >= 3) return 1
  return 0
}

function offSchoolCount(character, data, schools) {
  let n = 0
  const spells = data && data.spells
  for (const id of character.spells || []) {
    const s = spells && spells[id]
    if (!s || s.level < 1) continue
    if (schools.indexOf(s.school) < 0) n++
  }
  return n
}

function resourceDefs(character) {
  const L = character.level || 1
  const sub = character.subclass
  const y = character.ruleset || '2014'
  const cha = abilityMod((character.abilities && character.abilities.cha) || 10)
  const pb = proficiencyBonus(L)
  const out = []
  const add = (id, name, rest, max) => { if (max > 0) out.push({ id, name, rest, max }) }
  const id = character.class
  if (y === '2024') add('inspiration', '英雄激勵', 'longRest', 1)
  if (id === 'barbarian') add('rage', '狂暴', 'longRest', L >= 17 ? 6 : L >= 12 ? 5 : L >= 6 ? 4 : L >= 3 ? 3 : 2)
  if (id === 'bard') add('bardic-inspiration', '詩人激勵', L >= 5 ? 'shortRest' : 'longRest', y === '2024' ? pb : Math.max(1, cha))
  if (id === 'cleric' && L >= 2) add('channel-divinity', '引導神力', 'shortRest', y === '2024' ? (L >= 18 ? 4 : L >= 6 ? 3 : 2) : (L >= 18 ? 3 : L >= 6 ? 2 : 1))
  if (id === 'fighter') {
    add('second-wind', '重整旗鼓', y === '2024' ? 'longRest' : 'shortRest', y === '2024' ? (L >= 16 ? 5 : L >= 10 ? 4 : L >= 4 ? 3 : 2) : 1)
    add('action-surge', '動作如潮', 'shortRest', L >= 17 ? 2 : 1)
    if (sub === 'battlemaster' && L >= 3) add('superiority', '優越骰', 'shortRest', L >= 15 ? 6 : L >= 7 ? 5 : 4)
  }
  if (id === 'monk' && L >= 2) add('ki', y === '2024' ? '專注' : '氣', 'shortRest', L)
  if (id === 'paladin') {
    add('lay-on-hands', '聖療', 'longRest', 5 * L)
    if (L >= 3) add('channel-divinity', '引導神力', 'shortRest', y === '2024' ? 2 : 1)
  }
  if (id === 'ranger' && y === '2024') add('hunters-mark', '獵人印記', 'longRest', pb)
  if (id === 'sorcerer' && (y !== '2024' || L >= 2)) add('sorcery-points', '術法點', 'longRest', L)
  return out
}

function syncResources(character) {
  const next = clone(character)
  const old = {}
  for (const r of next.resources || []) old[r.id] = r
  next.resources = resourceDefs(next).map(d => ({
    id: d.id,
    name: d.name,
    rest: d.rest,
    max: d.max,
    used: Math.min((old[d.id] && old[d.id].used) || 0, d.max)
  }))
  return next
}

function armorProf(classId, subclass) {
  const map = {
    barbarian: ['light', 'medium', 'shield'],
    bard: ['light'],
    cleric: ['light', 'medium', 'shield'],
    druid: ['light', 'medium', 'shield'],
    fighter: ['light', 'medium', 'heavy', 'shield'],
    monk: [],
    paladin: ['light', 'medium', 'heavy', 'shield'],
    ranger: ['light', 'medium', 'shield'],
    rogue: ['light'],
    sorcerer: [],
    warlock: ['light'],
    wizard: []
  }
  const prof = (map[classId] || []).slice()
  if (subclass === 'war' || subclass === 'tempest' || subclass === 'forge' || subclass === 'life') {
    if (subclass !== 'life' && prof.indexOf('heavy') < 0) prof.push('heavy')
  }
  if (subclass === 'valor' && prof.indexOf('medium') < 0) {
    prof.push('medium')
    if (prof.indexOf('shield') < 0) prof.push('shield')
  }
  return prof
}

function canWearArmor(character, armorId, data) {
  if (!armorId) return true
  const arm = data && data.equipment && data.equipment.armor && data.equipment.armor[armorId]
  if (!arm) return false
  return armorProf(character.class, character.subclass).indexOf(arm.type) >= 0
}

function canUseShield(character) {
  return armorProf(character.class, character.subclass).indexOf('shield') >= 0
}

function spellPicksOf(classDef, subclassId) {
  const sub = ((classDef && classDef.subclasses) || []).filter(s => s.id === subclassId)[0]
  return (sub && sub.spellPicks) || (classDef && classDef.spellPicks) || null
}

function togglePick(arr, id, need) {
  if (!id) return { ok: false, arr: (arr || []).slice() }
  const next = (arr || []).slice()
  const i = next.indexOf(id)
  if (i >= 0) {
    next.splice(i, 1)
    return { ok: true, arr: next }
  }
  if (need && next.length >= need) return { ok: false, arr: next }
  next.push(id)
  return { ok: true, arr: next }
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
  if (catalog.ruleset && catalog.ruleset !== (character.ruleset || '2014')) return false
  return (catalog.when || []).some(w => {
    if (w.race && w.race !== character.race) return false
    if (w.class && w.class !== character.class) return false
    if (w.subclass && w.subclass !== character.subclass) return false
    if (w.ruleset && w.ruleset !== (character.ruleset || '2014')) return false
    if ((w.level || 1) > character.level) return false
    return true
  })
}

function pendingFor(character, classDef, catalogs, spells) {
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
  const picks = isPreparedCaster(character.class, character.ruleset) ? null : spellPicksOf(classDef, character.subclass)
  if (picks) {
    const need = knownSpellNeed(picks, level)
    const have = (character.spells || []).filter(id => {
      if (!spells || !spells[id]) return true
      return spells[id].level >= 1
    }).length
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
    spellSlots: slotsFor(caster, input.level, input.ruleset || '2014'),
    spells: [],
    cantrips: [],
    attacks: [{ name: atk.name, bonus: prof + strMod, damage: dmg }],
    feats: [],
    subclass: null,
    pendingChoices: [],
    proficiency: prof,
    speed: race.speed,
    initiative: dexMod,
    saves,
    skillProf: [],
    resources: resourceDefs({ class: input.class, level: input.level, subclass: null, abilities, ruleset: input.ruleset || '2014' }).map(d => ({ id: d.id, name: d.name, rest: d.rest, max: d.max, used: 0 })),
    conditions: [],
    deathSaves: { success: 0, fail: 0 },
    asiTaken: [],
    ruleset: input.ruleset || '2014',
    money: { gp: 0, sp: 0, cp: 0 },
    concentrating: false,
    gear: [],
    armor: null,
    shield: false,
    magicItems: [],
    choices: {},
    background: input.background || null
  }
  if ((character.ruleset || '2014') === '2024' && character.background && data.backgrounds && data.backgrounds[character.background]) {
    const feat = data.backgrounds[character.background].feat
    if (feat && character.feats.indexOf(feat) < 0) character.feats = character.feats.concat([feat])
  }
  character.pendingChoices = pendingFor(character, cls, data.choices, data.spells)
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
  next.pendingChoices = pendingFor(next, cls, data.choices, data.spells)
  next.spellSlots = mergeSlots(next.spellSlots, slotsFor(casterOf(cls, next.subclass), next.level, next.ruleset))
  next.resources = syncResources(next).resources
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
  const prev = (next.choices && next.choices[catalogId]) || []
  if (cat.apply === 'abi1') {
    for (const id of prev) next.abilities[id] = (next.abilities[id] || 10) - 1
    for (const id of ids) next.abilities[id] = (next.abilities[id] || 10) + 1
  }
  next.choices = Object.assign({}, next.choices || {})
  next.choices[catalogId] = ids
  next.pendingChoices = pendingFor(next, data.classes[next.class], data.choices, data.spells)
  return { ok: true, character: next }
}

function clearChoices(character, catalogId, data) {
  const next = clone(character)
  const cat = data.choices && data.choices[catalogId]
  const prev = (next.choices && next.choices[catalogId]) || []
  if (cat && cat.apply === 'abi1') {
    for (const id of prev) next.abilities[id] = (next.abilities[id] || 10) - 1
  }
  next.choices = Object.assign({}, next.choices || {})
  delete next.choices[catalogId]
  next.pendingChoices = pendingFor(next, data.classes[next.class], data.choices, data.spells)
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

function isPreparedCaster(classId, ruleset) {
  if (ruleset === '2024') {
    return ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock'].indexOf(classId) >= 0
  }
  return classId === 'cleric' || classId === 'druid' || classId === 'paladin'
}

function preparedCap(character) {
  if (!isPreparedCaster(character.class, character.ruleset)) return 0
  if (character.ruleset === '2024') {
    const L = character.level || 1
    const half = [0, 2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15]
    const full = [0, 4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22]
    const sorc = [0, 2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22]
    if (character.class === 'paladin' || character.class === 'ranger') return half[L] || 2
    if (character.class === 'sorcerer') return sorc[L] || 2
    if (character.class === 'warlock') return Math.min(15, L + 1)
    return full[L] || 4
  }
  if (character.class === 'paladin') {
    if (character.level < 2) return 0
    return Math.max(1, Math.floor(character.level / 2) + abilityMod((character.abilities && character.abilities.cha) || 10))
  }
  return Math.max(1, character.level + abilityMod((character.abilities && character.abilities.wis) || 10))
}

function alwaysPreparedIds(character, data) {
  const ids = []
  const add = table => {
    if (!table) return
    for (const k of Object.keys(table)) {
      if (character.level < Number(k)) continue
      for (const id of table[k]) {
        if (data.spells && data.spells[id] && ids.indexOf(id) < 0) ids.push(id)
      }
    }
  }
  const prep = data && data.prepared
  if (!prep) return ids
  add(prep[character.subclass])
  if (character.subclass === 'land') {
    const terrain = character.choices && character.choices.land && character.choices.land[0]
    if (terrain) add(prep['land-' + terrain])
  }
  return ids
}

function visibleSpells(character, data) {
  const out = []
  for (const id of character.cantrips || []) if (out.indexOf(id) < 0) out.push(id)
  for (const id of alwaysPreparedIds(character, data)) if (out.indexOf(id) < 0) out.push(id)
  for (const id of character.spells || []) if (out.indexOf(id) < 0) out.push(id)
  return out
}

function addSpell(character, spellId, data) {
  if (!spellId) return character
  const spell = data && data.spells && data.spells[spellId]
  const auto = alwaysPreparedIds(character, data)
  if (auto.indexOf(spellId) >= 0) return character
  if (spell && spell.level === 0) {
    if ((character.cantrips || []).indexOf(spellId) >= 0) return character
    const next = clone(character)
    next.cantrips = (next.cantrips || []).concat([spellId])
    next.pendingChoices = pendingFor(next, data.classes[next.class], data.choices, data.spells)
    return next
  }
  if ((character.spells || []).indexOf(spellId) >= 0) return character
  if (isPreparedCaster(character.class, character.ruleset)) {
    const used = (character.spells || []).filter(id => auto.indexOf(id) < 0).length
    if (used >= preparedCap(character)) return character
  }
  const next = clone(character)
  next.spells = (next.spells || []).concat([spellId])
  next.pendingChoices = pendingFor(next, data.classes[next.class], data.choices, data.spells)
  return next
}

function removeSpell(character, spellId, data) {
  if (alwaysPreparedIds(character, data).indexOf(spellId) >= 0) return character
  const next = clone(character)
  next.spells = (next.spells || []).filter(id => id !== spellId)
  next.cantrips = (next.cantrips || []).filter(id => id !== spellId)
  next.pendingChoices = pendingFor(next, data.classes[next.class], data.choices, data.spells)
  return next
}

function acFor(character, equipment) {
  const dex = abilityMod((character.abilities && character.abilities.dex) || 10)
  const arm = equipment && equipment.armor && character.armor && equipment.armor[character.armor]
  let ac
  if (!arm) ac = 10 + dex
  else {
    ac = arm.ac
    if (arm.addDex) {
      const bonus = arm.maxDex == null ? dex : Math.min(dex, arm.maxDex)
      ac += bonus
    }
  }
  if (character.shield) ac += 2
  const magic = arguments[2]
  for (const id of character.magicItems || []) {
    const it = magic && magic[id]
    if (it && it.ac) ac += it.ac
    if (it && it.acUnarmored && !arm && !character.shield) ac += it.acUnarmored
  }
  return ac
}

function setArmor(character, armorId, data) {
  if (armorId && !canWearArmor(character, armorId, data)) return character
  const next = clone(character)
  next.armor = armorId || null
  next.ac = acFor(next, data && data.equipment, data && data.magicItems)
  return next
}

function setShield(character, on, data) {
  if (on && !canUseShield(character)) return character
  const next = clone(character)
  next.shield = !!on
  next.ac = acFor(next, data && data.equipment, data && data.magicItems)
  return next
}

function addMagicItem(character, itemId, data) {
  const it = data && data.magicItems && data.magicItems[itemId]
  if (!it) return character
  const next = clone(character)
  next.magicItems = (next.magicItems || []).concat([itemId])
  next.ac = acFor(next, data.equipment, data.magicItems)
  return next
}

function removeMagicItem(character, index, data) {
  const next = clone(character)
  next.magicItems = (next.magicItems || []).slice()
  next.magicItems.splice(Number(index), 1)
  next.ac = acFor(next, data && data.equipment, data && data.magicItems)
  return next
}

function weaponAttack(character, w) {
  const prof = character.proficiency || 2
  const str = abilityMod((character.abilities && character.abilities.str) || 10)
  const dex = abilityMod((character.abilities && character.abilities.dex) || 10)
  let mod = str
  if (w.ability === 'dex') mod = dex
  if (w.ability === 'finesse') mod = Math.max(str, dex)
  const dmg = mod >= 0 ? w.damage + '+' + mod : w.damage + String(mod)
  return { name: w.name, bonus: prof + mod, damage: dmg }
}

function addWeapon(character, weaponId, data) {
  const w = data && data.equipment && data.equipment.weapons && data.equipment.weapons[weaponId]
  if (!w) return character
  const next = clone(character)
  next.attacks = (next.attacks || []).concat([weaponAttack(next, w)])
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
  if (!isPreparedCaster(character.class, character.ruleset)) {
    const picks = spellPicksOf(cls, character.subclass)
    const gained = knownSpellNeed(picks, next) - knownSpellNeed(picks, character.level)
    if (gained > 0) items.push({ id: 'spells', type: 'spells', count: gained })
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
  const fresh = slotsFor(casterOf(cls, next.subclass), newLevel, next.ruleset)
  const merged = {}
  for (const k of Object.keys(fresh)) {
    const used = (next.spellSlots[k] && next.spellSlots[k].used) || 0
    merged[k] = { max: fresh[k].max, used: Math.min(used, fresh[k].max) }
  }
  next.spellSlots = merged
  if ((cls.asiLevels || []).includes(newLevel)) {
    next.asiTaken = (next.asiTaken || []).concat([newLevel])
  }
  next.pendingChoices = pendingFor(next, cls, data.choices, data.spells)
  next.resources = syncResources(next).resources
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
  const fresh = slotsFor(casterOf(cls, character.subclass), character.level, character.ruleset)
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
  subclassSchools,
  spellListClass,
  knownSpellNeed,
  spellPicksOf,
  togglePick,
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
  removeSpell,
  isPreparedCaster,
  preparedCap,
  alwaysPreparedIds,
  visibleSpells,
  acFor,
  setArmor,
  setShield,
  addWeapon,
  syncResources,
  resourceDefs,
  armorProf,
  canWearArmor,
  canUseShield,
  anySchoolCap,
  offSchoolCount,
  addMagicItem,
  removeMagicItem
}

if (typeof module !== 'undefined') module.exports = Rules
if (typeof globalThis !== 'undefined') globalThis.Rules = Rules
