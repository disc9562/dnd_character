#!/usr/bin/env node
const fs = require('fs')
const root = require('path').join(__dirname, '..')
const srd = JSON.parse(fs.readFileSync('/tmp/srd-spells.json', 'utf8'))
const have = JSON.parse(fs.readFileSync(root + '/data/spells.json', 'utf8'))

const SCHOOL = {
  abjuration: '防護', conjuration: '咒法', divination: '預言', enchantment: '惑控',
  evocation: '塑能', illusion: '幻術', necromancy: '死靈', transmutation: '變化'
}
const DMG = {
  acid: '強酸', bludgeoning: '鈍擊', cold: '寒冷', fire: '火焰', force: '力場',
  lightning: '閃電', necrotic: '死靈', piercing: '穿刺', poison: '毒素',
  psychic: '心靈', radiant: '光耀', slashing: '揮砍', thunder: '雷鳴'
}
const ZH = {
  'acid-arrow': '酸液箭', 'acid-splash': '酸液飛濺', aid: '援助術', alarm: '警報術',
  'alter-self': '變身術', 'animal-friendship': '動物友善', 'animal-messenger': '動物信使',
  'animal-shapes': '群體動物形態', 'animate-dead': '活化死屍', 'animate-objects': '活化物件',
  'antilife-shell': '反生命護罩', 'antimagic-field': '反魔法力場',
  'antipathy-sympathy': '厭惡／同情術', 'arcane-eye': '秘法眼', 'arcane-hand': '秘法之手',
  'arcane-lock': '秘法鎖', 'arcane-sword': '秘法劍', 'arcanists-magic-aura': '魔法靈光',
  'astral-projection': '星界投射', augury: '占兆術', awaken: '啟智術', bane: '災禍術',
  banishment: '放逐術', barkskin: '樹膚術', 'beacon-of-hope': '希望信標',
  'bestow-curse': '降咒', 'black-tentacles': '黑觸手', 'blade-barrier': '劍刃護壁',
  bless: '祝福術', blight: '凋死術', 'blindness-deafness': '目盲／耳聾', blink: '閃現術',
  blur: '朦朧術', 'branding-smite': '烙印斬', 'burning-hands': '燃燒之手',
  'call-lightning': '召雷術', 'calm-emotions': '安定心神', 'chain-lightning': '連鎖閃電',
  'charm-person': '魅惑人類', 'chill-touch': '寒冷之觸', 'circle-of-death': '死亡法陣',
  clairvoyance: '千里眼', clone: '複製術', cloudkill: '死雲術', 'color-spray': '七彩噴射',
  command: '命令術', commune: '通神術', 'commune-with-nature': '問道自然',
  'comprehend-languages': '通曉語言', compulsion: '強制術', 'cone-of-cold': '寒冰錐',
  confusion: '困惑術', 'conjure-animals': '召喚動物', 'conjure-celestial': '召喚天界生物',
  'conjure-elemental': '召喚元素', 'conjure-fey': '召喚妖精',
  'conjure-minor-elementals': '召喚次級元素', 'conjure-woodland-beings': '召喚林木生物',
  'contact-other-plane': '異界通訊', contagion: '傳染術', contingency: '觸發術',
  'continual-flame': '不滅明焰', 'control-water': '操控水體', 'control-weather': '操控天氣',
  counterspell: '反制法術', 'create-food-and-water': '造糧術',
  'create-or-destroy-water': '造水／毀水', 'create-undead': '創造不死', creation: '造物術',
  'cure-wounds': '療傷術', 'dancing-lights': '舞光術', darkness: '黑暗術',
  darkvision: '黑暗視覺', daylight: '日光術', 'death-ward': '死亡結界',
  'delayed-blast-fireball': '延時火球', demiplane: '半位面',
  'detect-evil-and-good': '偵測善惡', 'detect-magic': '偵測魔法',
  'detect-poison-and-disease': '偵測毒與疾病', 'detect-thoughts': '偵測思想',
  'dimension-door': '任意門', 'disguise-self': '易容術', disintegrate: '解離術',
  'dispel-evil-and-good': '驅散善惡', 'dispel-magic': '解除魔法', divination: '預言術',
  'divine-favor': '神恩', 'divine-word': '聖言術', 'dominate-beast': '支配野獸',
  'dominate-monster': '支配怪物', 'dominate-person': '支配人類', dream: '夢境',
  druidcraft: '德魯伊伎倆', earthquake: '地震術', 'eldritch-blast': '魔能爆',
  'enhance-ability': '強化能力', 'enlarge-reduce': '放大／縮小', entangle: '糾纏術',
  enthrall: '攝心術', etherealness: '以太化', 'expeditious-retreat': '加速撤退',
  eyebite: '攝魂凝視', fabricate: '製造術', 'faerie-fire': '妖火',
  'faithful-hound': '忠犬', 'false-life': '虛假生命', fear: '恐懼術',
  'feather-fall': '羽落術', feeblemind: '弱智術', 'find-familiar': '尋獲魔寵',
  'find-steed': '尋獲坐騎', 'find-the-path': '尋路術', 'find-traps': '尋找陷阱',
  'finger-of-death': '死亡一指', 'fire-bolt': '火焰箭', 'fire-shield': '火焰護盾',
  'fire-storm': '火焰風暴', fireball: '火球術', 'flame-blade': '火焰刀',
  'flame-strike': '焰擊術', 'flaming-sphere': '熾焰法球', 'flesh-to-stone': '石化術',
  'floating-disk': '浮空碟', fly: '飛行術', 'fog-cloud': '霧雲術',
  forbiddance: '禁制術', forcecage: '力場監牢', foresight: '預視術',
  'freedom-of-movement': '自由行動', 'freezing-sphere': '冰封法球',
  'gaseous-form': '氣化形態', gate: '異界之門', geas: '指使術',
  'gentle-repose': '安息術', 'giant-insect': '巨蟲術', glibness: '花言巧語',
  'globe-of-invulnerability': '法術無效結界', 'glyph-of-warding': '守衛雕文',
  goodberry: '神莓術', grease: '油膩術', 'greater-invisibility': '高等隱形',
  'greater-restoration': '高等復原術', 'guardian-of-faith': '信仰守衛',
  'guards-and-wards': '守衛與結界', guidance: '導引術', 'guiding-bolt': '導引箭',
  'gust-of-wind': '造風術', hallow: '聖居術', 'hallucinatory-terrain': '幻景',
  harm: '傷害術', haste: '加速術', heal: '醫療術', 'healing-word': '治療真言',
  'heat-metal': '灼熱金屬', 'hellish-rebuke': '煉獄叱喝', 'heroes-feast': '英雄宴',
  heroism: '英雄氣概', 'hideous-laughter': '狂笑術', 'hold-monster': '怪物定身',
  'hold-person': '人類定身', 'holy-aura': '神聖靈光', 'hunters-mark': '獵人印記',
  'hypnotic-pattern': '催眠圖紋', 'ice-storm': '冰風暴', identify: '鑑定術',
  'illusory-script': '幻影手稿', imprisonment: '禁錮術', 'incendiary-cloud': '焚雲術',
  'inflict-wounds': '造成傷害', 'insect-plague': '蟲群災禍',
  'instant-summons': '即時召喚', invisibility: '隱形術',
  'irresistible-dance': '強制舞步', jump: '跳躍術', knock: '敲擊術',
  'legend-lore': '通曉傳奇', 'lesser-restoration': '次等復原術', levitate: '漂浮術',
  light: '光亮術', 'lightning-bolt': '閃電束',
  'locate-animals-or-plants': '定位動植物', 'locate-creature': '定位生物',
  'locate-object': '定位物件', longstrider: '大步奔行', 'mage-armor': '法師護甲',
  'mage-hand': '法師之手', 'magic-circle': '魔法法陣', 'magic-jar': '魔魂壺',
  'magic-missile': '魔法飛彈', 'magic-mouth': '魔嘴術', 'magic-weapon': '魔法武器',
  'magnificent-mansion': '豪宅術', 'major-image': '高等幻影',
  'mass-cure-wounds': '群體療傷', 'mass-heal': '群體醫療',
  'mass-healing-word': '群體治療真言', 'mass-suggestion': '群體暗示', maze: '迷宮術',
  'meld-into-stone': '融身入石', mending: '修復術', message: '傳訊術',
  'meteor-swarm': '流星爆', 'mind-blank': '心靈屏障', 'minor-illusion': '次級幻象',
  'mirage-arcane': '秘法蜃景', 'mirror-image': '鏡影術', mislead: '誤導術',
  'misty-step': '迷蹤步', 'modify-memory': '修改記憶', moonbeam: '月光束',
  'move-earth': '移土術', nondetection: '回避偵測', 'pass-without-trace': '無蹤步',
  passwall: '穿牆術', 'phantasmal-killer': '幻影殺手', 'phantom-steed': '魅影駒',
  'planar-ally': '異界盟友', 'planar-binding': '異界誓縛', 'plane-shift': '異界傳送',
  'plant-growth': '植物滋長', 'poison-spray': '毒噴霧', polymorph: '變形術',
  'power-word-kill': '律令死亡', 'power-word-stun': '律令震懾',
  'prayer-of-healing': '治療禱言', prestidigitation: '魔法伎倆',
  'prismatic-spray': '虹光噴射', 'prismatic-wall': '虹光法牆',
  'private-sanctum': '私密聖所', 'produce-flame': '燃火術',
  'programmed-illusion': '預設幻象', 'project-image': '投影術',
  'protection-from-energy': '防護能量', 'protection-from-evil-and-good': '防護善惡',
  'protection-from-poison': '防護毒素', 'purify-food-and-drink': '淨化飲食',
  'raise-dead': '死者復活', 'ray-of-enfeeblement': '衰弱射線',
  'ray-of-frost': '冷凍射線', regenerate: '再生術', reincarnate: '轉生術',
  'remove-curse': '移除詛咒', 'resilient-sphere': '彈力法球', resistance: '抵抗術',
  resurrection: '復活術', 'reverse-gravity': '反轉重力', revivify: '回生術',
  'rope-trick': '繩術', 'sacred-flame': '聖火術', sanctuary: '聖域術',
  'scorching-ray': '灼熱射線', scrying: '探知術', 'secret-chest': '秘藏箱',
  'see-invisibility': '識破隱形', seeming: '偽裝術', sending: '短訊術',
  sequester: '隔離術', shapechange: '形體變化', shatter: '粉碎音波',
  shield: '護盾術', 'shield-of-faith': '虔誠護盾', shillelagh: '橡棍術',
  'shocking-grasp': '電爪', silence: '沉默術', 'silent-image': '無聲幻影',
  simulacrum: '擬像術', sleep: '睡眠術', 'sleet-storm': '雨雪風暴', slow: '緩慢術',
  'spare-the-dying': '穩定傷勢', 'speak-with-animals': '動物交談',
  'speak-with-dead': '死者交談', 'speak-with-plants': '植物交談',
  'spider-climb': '蛛行術', 'spike-growth': '荊棘叢生',
  'spirit-guardians': '靈體衛士', 'spiritual-weapon': '靈體武器',
  'stinking-cloud': '臭雲術', 'stone-shape': '塑石術', stoneskin: '石膚術',
  'storm-of-vengeance': '復仇風暴', suggestion: '暗示術', sunbeam: '陽光束',
  sunburst: '陽炎爆', symbol: '徽記術', telekinesis: '心靈遙控',
  'telepathic-bond': '心靈感應', teleport: '傳送術',
  'teleportation-circle': '傳送法陣', thaumaturgy: '奇術', thunderwave: '雷鳴波',
  'time-stop': '時間停止', 'tiny-hut': '小屋術', tongues: '巧言術',
  'transport-via-plants': '植物傳送', 'tree-stride': '樹躍術',
  'true-polymorph': '完全變形', 'true-resurrection': '完全復活',
  'true-seeing': '真視術', 'true-strike': '克敵機先', 'unseen-servant': '隱形僕役',
  'vampiric-touch': '吸血鬼之觸', 'vicious-mockery': '惡毒嘲諷',
  'wall-of-fire': '火牆術', 'wall-of-force': '力場牆', 'wall-of-ice': '冰牆術',
  'wall-of-stone': '石牆術', 'wall-of-thorns': '棘牆術', 'warding-bond': '守護之絆',
  'water-breathing': '水下呼吸', 'water-walk': '水上行走', web: '蛛網術',
  weird: '怪影殺手', 'wind-walk': '風行術', 'wind-wall': '風牆術', wish: '祈願術',
  'word-of-recall': '回語術', 'zone-of-truth': '誠實之域'
}

function timeZh(t) {
  return String(t || '')
    .replace('1 action', '1 動作')
    .replace('1 bonus action', '附贈動作')
    .replace('1 reaction', '反應')
    .replace('1 minute', '1 分鐘')
    .replace('10 minutes', '10 分鐘')
    .replace('1 hour', '1 小時')
    .replace('8 hours', '8 小時')
    .replace('24 hours', '24 小時')
}
function rangeZh(r) {
  return String(r || '')
    .replace('Self', '自身')
    .replace('Touch', '觸碰')
    .replace('feet', '呎')
    .replace('mile', '哩')
    .replace('Special', '特殊')
    .replace('Unlimited', '無限')
    .replace('Sight', '視線')
}
function durZh(d) {
  return String(d || '')
    .replace('Instantaneous', '即時')
    .replace('Up to ', '最長 ')
    .replace('Until dispelled', '直到被解除')
    .replace('Special', '特殊')
    .replace('1 round', '1 輪')
    .replace('1 minute', '1 分鐘')
    .replace('10 minutes', '10 分鐘')
    .replace('1 hour', '1 小時')
    .replace('8 hours', '8 小時')
    .replace('24 hours', '24 小時')
    .replace('1 day', '1 日')
    .replace('7 days', '7 日')
    .replace('10 days', '10 日')
    .replace('30 days', '30 日')
    .replace('feet', '呎')
}

function blurb(s) {
  const bits = []
  if (s.ritual) bits.push('儀式')
  if (s.concentration) bits.push('專注')
  bits.push(timeZh(s.casting_time))
  bits.push(rangeZh(s.range))
  bits.push(durZh(s.duration))
  const dmg = (s.damage && s.damage[0]) || null
  if (dmg) {
    const slot = dmg.damage_at_slot_level
    const char = dmg.damage_at_character_level
    const dice = (slot && (slot[String(s.level)] || slot[s.level])) ||
      (char && (char['1'] || char[1]))
    const typ = DMG[dmg.damage_type && dmg.damage_type.index] || ''
    if (dice) bits.push(dice + typ)
  }
  if (s.dc && s.dc.dc_type) {
    const ab = { STR: '力量', DEX: '敏捷', CON: '體質', INT: '智力', WIS: '感知', CHA: '魅力' }
    bits.push((ab[s.dc.dc_type.name] || s.dc.dc_type.name) + '豁免')
  }
  return bits.filter(Boolean).join('，') + '。'
}

const out = {}
for (const s of srd) {
  const old = have[s.index]
  out[s.index] = {
    name: (old && old.name) || ZH[s.index] || s.name,
    nameEn: s.name,
    level: s.level,
    school: SCHOOL[s.school && s.school.index] || (old && old.school) || '',
    classes: (s.classes || []).map(c => c.index),
    text: (old && old.text) || blurb(s)
  }
}
if (have.hex) out.hex = have.hex

const miss = Object.keys(out).filter(id => !ZH[id] && id !== 'hex' && !(have[id] && have[id].name))
if (miss.length) {
  console.error('missing zh', miss.join(','))
  process.exit(1)
}
fs.writeFileSync(root + '/data/spells.json', JSON.stringify(out, null, 2) + '\n')
console.log('wrote', Object.keys(out).length)
