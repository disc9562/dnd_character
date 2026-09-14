#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'))
const write = (f, o) => fs.writeFileSync(path.join(root, f), JSON.stringify(o, null, 2) + '\n')

const feats = read('data/feats.json')
Object.assign(feats, {
  'dungeon-delver': { name: '地城探勘者', nameEn: 'Dungeon Delver', text: '密門檢定優勢。陷阱的感知／敏捷豁免優勢；陷阱傷害抗性。' },
  'fey-touched': { name: '妖精接觸', nameEn: 'Fey Touched', text: '智力／感知／魅力 +1。學會迷蹤步與一個 1 環預言或惑控。' },
  'shadow-touched': { name: '暗影接觸', nameEn: 'Shadow Touched', text: '智力／感知／魅力 +1。學會隱形術與一個 1 環幻術或死靈。' },
  telekinetic: { name: '心靈遙控', nameEn: 'Telekinetic', text: '智力／感知／魅力 +1。法師之手加強；附贈動作推或拉 5 呎。' },
  telepathic: { name: '心靈感應', nameEn: 'Telepathic', text: '智力／感知／魅力 +1。60 呎傳心。每日一次施偵測思想。' },
  'fighting-initiate': { name: '戰鬥入門', nameEn: 'Fighting Initiate', text: '學會一個戰鬥風格。' },
  gunner: { name: '槍械手', nameEn: 'Gunner', text: '敏捷 +1。槍械熟練。近戰時用槍不吃劣勢。忽略裝填。' },
  'metamagic-adept': { name: '超魔法擅長', nameEn: 'Metamagic Adept', text: '學兩個超魔法，得 2 術法點。' },
  'skill-expert': { name: '技能專家', nameEn: 'Skill Expert', text: '任一屬性 +1。一項技能熟練，另一項專精。' },
  crusher: { name: '鈍擊者', nameEn: 'Crusher', text: '力量或體質 +1。鈍擊可推 5 呎。重擊時本回合攻擊該目標有優勢。' },
  piercer: { name: '穿刺者', nameEn: 'Piercer', text: '力量或敏捷 +1。每回合可重骰一顆穿刺傷害。重擊多一顆傷害骰。' },
  slasher: { name: '揮砍者', nameEn: 'Slasher', text: '力量或敏捷 +1。揮砍可減其速度 10 呎。重擊時其攻擊有劣勢。' },
  'eldritch-adept': { name: '魔能擅長', nameEn: 'Eldritch Adept', text: '學會一個魔能祈喚。' },
  chef: { name: '廚師', nameEn: 'Chef', text: '體質或感知 +1。熟練廚具。短休料理給額外生命骰；點心給暫時 HP。' },
  poisoner: { name: '用毒者', nameEn: 'Poisoner', text: '忽略毒素抗性。熟練毒具。一小時製毒，命中上毒。' },
  'artificer-initiate': { name: '奇械入門', nameEn: 'Artificer Initiate', text: '一個奇械師戲法與一個 1 環奇械師法術。熟練工匠工具。' }
})
write('data/feats.json', feats)

const choices = read('data/choices.json')
const fsOpts = choices['fighting-style'].options
const extraFs = [
  { id: 'blind-fighting', name: '盲戰', text: '10 呎盲視。', classes: ['fighter', 'ranger', 'paladin'] },
  { id: 'interception', name: '攔截', text: '5 呎內友方被打中時，反應減傷害＝1d10＋熟練。', classes: ['fighter', 'paladin'] },
  { id: 'thrown-weapon', name: '投擲武器', text: '抽武器並投擲可作為攻擊的一部分。投擲傷害 +2。', classes: ['fighter', 'ranger'] },
  { id: 'unarmed-fighting', name: '徒手戰鬥', text: '徒手 1d6（空手時 1d8）。擒抱時每回合 1d4 鈍擊。', classes: ['fighter'] }
]
for (const o of extraFs) if (!fsOpts.some(x => x.id === o.id)) fsOpts.push(o)

choices.invocation.options = [
  { id: 'agonizing-blast', name: '痛苦魔能', text: '魔能爆傷害加上魅力調整值。' },
  { id: 'repelling-blast', name: '擊退魔能', text: '魔能爆命中可把目標推 10 呎。' },
  { id: 'eldritch-spear', name: '魔能長槍', text: '魔能爆射程 300 呎。' },
  { id: 'armor-of-shadows', name: '暗影護甲', text: '隨意施法師護甲（自己）。' },
  { id: 'devils-sight', name: '魔鬼視覺', text: '黑暗中（含魔法黑暗）能見 120 呎。' },
  { id: 'fiendish-vigor', name: '邪魔活力', text: '隨意施虛假生命，視為 1 環。' },
  { id: 'mask-of-many-faces', name: '千面之罩', text: '隨意施易容術。' },
  { id: 'misty-visions', name: '霧景幻象', text: '隨意施無聲幻影。' },
  { id: 'beguiling-influence', name: '誘人風采', text: '獲得欺瞞與說服熟練。' },
  { id: 'eyes-of-rune-keeper', name: '符文守護者之眼', text: '能讀懂所有文字。' },
  { id: 'beast-speech', name: '野獸之語', text: '隨意施動物交談。' },
  { id: 'eldritch-sight', name: '魔能視覺', text: '隨意施偵測魔法。' },
  { id: 'gaze-of-two-minds', name: '雙心凝視', text: '接觸一個同意的類人，分享其感官。' },
  { id: 'voice-of-the-chain-master', name: '鎖鏈宗主之聲', text: '透過魔寵感知、說話。需鎖鏈契約。' },
  { id: 'book-of-ancient-secrets', name: '遠古秘典', text: '秘法書可抄儀式法術。需書冊契約。' },
  { id: 'thief-of-five-fates', name: '五劫盜賊', text: '每日一次施災禍術。', minLevel: 5 },
  { id: 'one-with-shadows', name: '暗影合一', text: '黑暗或微光中可隱形直到移動。', minLevel: 5 },
  { id: 'mire-the-mind', name: '泥沼心智', text: '每日一次施緩慢術。', minLevel: 5 },
  { id: 'sign-of-ill-omen', name: '凶兆印記', text: '每日一次施降咒。', minLevel: 5 },
  { id: 'thirsting-blade', name: '渴血之刃', text: '契約武器攻擊兩下。需利刃契約。', minLevel: 5 },
  { id: 'sculptor-of-flesh', name: '血肉塑造者', text: '每日一次施變形術。', minLevel: 7 },
  { id: 'dreadful-word', name: '可怖真言', text: '每日一次施困惑術。', minLevel: 7 },
  { id: 'bewitching-whispers', name: '蠱惑低語', text: '每日一次施強制術。', minLevel: 7 },
  { id: 'ascendant-step', name: '升騰步伐', text: '隨意施漂浮術（自己）。', minLevel: 9 },
  { id: 'otherworldly-leap', name: '異界躍進', text: '隨意施跳躍術。', minLevel: 9 },
  { id: 'whispers-of-the-grave', name: '墳墓低語', text: '隨意施死者交談。', minLevel: 9 },
  { id: 'minions-of-chaos', name: '混沌爪牙', text: '每日一次施召喚元素。', minLevel: 9 },
  { id: 'lifedrinker', name: '飲命者', text: '契約武器額外死靈傷害＝魅力調整值。需利刃。', minLevel: 12 },
  { id: 'witch-sight', name: '巫視', text: '30 呎內看破變形與隱形。', minLevel: 15 },
  { id: 'visions-of-distant-realms', name: '遙域異象', text: '隨意施秘法眼。', minLevel: 15 },
  { id: 'master-of-myriad-forms', name: '萬形主宰', text: '隨意施變身術。', minLevel: 15 },
  { id: 'chains-of-carceri', name: '卡瑟瑞鎖鏈', text: '隨意對天界／邪魔／元素施人類定身。', minLevel: 15 }
]

choices['totem-aspect'] = {
  id: 'totem-aspect',
  name: '圖騰靈性',
  pick: 1,
  when: [{ class: 'barbarian', subclass: 'totem', level: 6 }],
  options: [
    { id: 'bear', name: '熊', text: '負重加倍。可推、拖、抬巨大重量。' },
    { id: 'eagle', name: '鷹', text: '睜眼時看得見的東西，黑暗中視同微光。' },
    { id: 'wolf', name: '狼', text: '追蹤時感知優勢。與他人同行時隱匿優勢。' }
  ]
}
choices['totem-attune'] = {
  id: 'totem-attune',
  name: '圖騰共鳴',
  pick: 1,
  when: [{ class: 'barbarian', subclass: 'totem', level: 14 }],
  options: [
    { id: 'bear', name: '熊', text: '狂暴時，5 呎內敵對你的攻擊有劣勢（你以外）。' },
    { id: 'eagle', name: '鷹', text: '狂暴時飛一段等於你速度的距離。' },
    { id: 'wolf', name: '狼', text: '狂暴時，命中後附贈動作可把大型或更小目標擊倒。' }
  ]
}
choices['hunter-defense'] = {
  id: 'hunter-defense',
  name: '防禦戰術',
  pick: 1,
  when: [{ class: 'ranger', subclass: 'hunter', level: 7 }],
  options: [
    { id: 'escape-horde', name: '脫離敵群', text: '機會攻擊對你有劣勢。' },
    { id: 'multiattack-defense', name: '多重防禦', text: '同一生物本回合第二次起打你，AC +4。' },
    { id: 'steel-will', name: '鋼鐵意志', text: '對抗恐懼有優勢。' }
  ]
}
choices['hunter-multi'] = {
  id: 'hunter-multi',
  name: '多重攻擊',
  pick: 1,
  when: [{ class: 'ranger', subclass: 'hunter', level: 11 }],
  options: [
    { id: 'volley', name: '齊射', text: '動作對 10 呎半徑內你看得見的生物各射一箭。' },
    { id: 'whirlwind', name: '旋風', text: '動作對 5 呎內每個生物做一次近戰攻擊。' }
  ]
}
choices['four-elements'] = {
  id: 'four-elements',
  name: '四象法門',
  pickAt: [{ level: 3, pick: 2 }, { level: 6, pick: 3 }, { level: 11, pick: 4 }, { level: 17, pick: 5 }],
  when: [{ class: 'monk', subclass: 'four-elements', level: 3 }],
  options: [
    { id: 'elemental-attunement', name: '元素調和', text: '小把戲：移土、點火、熄火、水形。' },
    { id: 'fangs-of-the-fire-snake', name: '火蛇之牙', text: '花氣讓徒手攻擊達 10 呎並加火焰傷害。' },
    { id: 'fist-of-four-thunders', name: '四雷拳', text: '花氣施雷鳴波。' },
    { id: 'fist-of-unbroken-air', name: '不破氣拳', text: '花氣遠程氣擊，傷害並可推開。' },
    { id: 'rush-of-the-gale-spirits', name: '狂風之靈', text: '花氣施造風術。' },
    { id: 'shape-the-flowing-river', name: '塑流河', text: '花氣結冰或融冰、改變水面。' },
    { id: 'sweeping-cinder-strike', name: '掃燼擊', text: '花氣施燃燒之手。' },
    { id: 'water-whip', name: '水鞭', text: '花氣水鞭攻擊，可拉近或擊倒。' },
    { id: 'clench-of-the-north-wind', name: '北風之握', text: '花氣施人類定身。', minLevel: 6 },
    { id: 'gong-of-the-summit', name: '山巔鑼', text: '花氣施粉碎音波。', minLevel: 6 },
    { id: 'flames-of-the-phoenix', name: '鳳凰焰', text: '花氣施火球術。', minLevel: 11 },
    { id: 'mist-stance', name: '霧隱勢', text: '花氣施氣化形態。', minLevel: 11 },
    { id: 'ride-the-wind', name: '乘風', text: '花氣施飛行術。', minLevel: 11 },
    { id: 'breath-of-winter', name: '冬之息', text: '花氣施寒冰錐。', minLevel: 17 },
    { id: 'eternal-mountain-defense', name: '不朽山防', text: '花氣施石膚術（自己）。', minLevel: 17 },
    { id: 'river-of-hungry-flame', name: '噬焰之河', text: '花氣施火牆術。', minLevel: 17 }
  ]
}
if (choices['arcane-shot']) {
  choices['arcane-shot'].pickAt = [
    { level: 3, pick: 2 }, { level: 7, pick: 3 }, { level: 10, pick: 4 },
    { level: 15, pick: 5 }, { level: 18, pick: 6 }
  ]
  delete choices['arcane-shot'].pick
}
write('data/choices.json', choices)

const features = read('data/features.json')
const add = (cls, rows) => {
  const have = new Set((features[cls] || []).map(x => x.level + ':' + x.name))
  for (const r of rows) if (!have.has(r.level + ':' + r.name)) features[cls].push(r)
  features[cls].sort((a, b) => a.level - b.level)
}
add('barbarian', [
  { level: 9, name: '殘暴重擊', text: '力量近戰重擊時多一顆傷害骰。更高級更多。' },
  { level: 15, name: '持久狂暴', text: '狂暴只在你昏迷或自己結束時結束。' }
])
add('bard', [
  { level: 14, name: '魔法奧秘', text: '再學兩個任意職業法術。' }
])
add('druid', [
  { level: 6, name: '荒野形態改良', text: '可變成挑戰等級更高的野獸。' },
  { level: 10, name: '荒野形態改良', text: '可變成飛行野獸。' }
])
add('fighter', [
  { level: 4, name: '屬性值提升', text: '4／6／8／12／14／16／19 級提升屬性或專長。' }
])
add('monk', [
  { level: 4, name: '緩落', text: '反應減墜落傷害。' },
  { level: 6, name: '真氣拳', text: '徒手視為魔法武器。' },
  { level: 10, name: '純潔之身', text: '免疫疾病與毒素。' },
  { level: 13, name: '萬語舌', text: '懂所有語言；別人懂你說的話。' },
  { level: 15, name: '不朽之體', text: '不因年齡衰弱，不需飲食。' },
  { level: 18, name: '空身', text: '花氣隱形；花更多氣施以太化。' }
])
add('paladin', [
  { level: 18, name: '靈光強化', text: '靈光範圍 30 呎。' }
])
add('ranger', [
  { level: 6, name: '額外宿敵與地形', text: '再選一種宿敵與喜愛地形。' },
  { level: 10, name: '偽裝／額外地形', text: '可偽裝自己。再選喜愛地形。' },
  { level: 18, name: '野性感知', text: '30 呎內對不可見的生物有感知。' }
])
add('rogue', [
  { level: 14, name: '盲感', text: '10 呎內能感知隱藏或隱形生物。' },
  { level: 18, name: '難以捉摸', text: '沒有攻擊檢定對你有優勢。' }
])
add('sorcerer', [
  { level: 4, name: '屬性值提升', text: '4／8／12／16／19 級提升屬性或專長。' },
  { level: 10, name: '超魔法', text: '再選一個超魔法。' },
  { level: 17, name: '超魔法', text: '再選一個超魔法。' }
])
add('warlock', [
  { level: 4, name: '屬性值提升', text: '4／8／12／16／19 級提升屬性或專長。' },
  { level: 13, name: '魔能奧秘', text: '獲得 7 環秘法，每日一次。' },
  { level: 15, name: '魔能奧秘', text: '獲得 8 環秘法，每日一次。' },
  { level: 17, name: '魔能奧秘', text: '獲得 9 環秘法，每日一次。' }
])
add('wizard', [
  { level: 4, name: '屬性值提升', text: '4／8／12／16／19 級提升屬性或專長。' }
])
add('cleric', [
  { level: 4, name: '屬性值提升', text: '4／8／12／16／19 級提升屬性或專長。' }
])
write('data/features.json', features)
console.log('feats', Object.keys(feats).length, 'choices', Object.keys(choices).length, 'inv', choices.invocation.options.length)
