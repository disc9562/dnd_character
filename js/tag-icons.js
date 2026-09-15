/* Original silhouettes inspired by 5e/BG3 tooltip language — not game assets. */
const TAG_SVG = {
  '防護': '<path fill="currentColor" d="M12 3l7 3v5.2c0 4.4-2.8 8.2-7 10.3-4.2-2.1-7-5.9-7-10.3V6z"/><path fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="1.4" d="M12 7v9M8.5 11.5h7"/>',
  '咒法': '<path fill="currentColor" d="M12 4.2l1.4 3.8 4 .2-3.2 2.5 1.1 3.8L12 12.8 8.7 14.5l1.1-3.8L6.6 8.2l4-.2z"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="2 3"/>',
  '預言': '<path fill="currentColor" d="M12 6c4.2 0 7.5 3.2 8.8 6-1.3 2.8-4.6 6-8.8 6s-7.5-3.2-8.8-6C4.5 9.2 7.8 6 12 6z"/><circle cx="12" cy="12" r="2.6" fill="#fff" fill-opacity=".9"/>',
  '惑控': '<path fill="currentColor" d="M12 20s-7.2-4.4-7.2-9.1C4.8 8.2 6.7 6.6 8.8 6.6c1.3 0 2.4.6 3.2 1.6.8-1 1.9-1.6 3.2-1.6 2.1 0 4 1.6 4 4.3C19.2 15.6 12 20 12 20z"/>',
  '塑能': '<path fill="currentColor" d="M12 2l2.2 6.4L21 10l-5.2 3.6L17.5 21 12 17.2 6.5 21l1.7-7.4L3 10l6.8-1.6z"/>',
  '幻術': '<path fill="currentColor" d="M4 9.5c0-3 3.2-5.5 8-5.5s8 2.5 8 5.5v6.2c0 1.4-1.3 2.3-2.8 2.3H15l-3 3-3-3H6.8C5.3 18 4 17.1 4 15.7z"/><path fill="#fff" fill-opacity=".55" d="M9 10.2h2.2v2.2H9zm3.8 0H15v2.2h-2.2z"/>',
  '死靈': '<path fill="currentColor" d="M12 4c3.6 0 6 2.6 6 6.1 0 2.2-1 3.5-1.8 4.3V17h-2.2v2.4h-4V17H7.8v-2.6C7 13.6 6 12.3 6 10.1 6 6.6 8.4 4 12 4z"/><circle cx="9.6" cy="10" r="1" fill="#fff"/><circle cx="14.4" cy="10" r="1" fill="#fff"/>',
  '變化': '<path fill="currentColor" d="M7 5h10l-5 7h5L7 19l3-7H7z"/>',
  '火焰': '<path fill="currentColor" d="M13 2s3 4.2 3 8.2c0 3.4-2 6.8-4.8 7.8C8 19.2 6 16.6 6 13.4c0-2.6 1.4-4.4 2.4-6.2C9 9.6 10.6 11 12 10.2 12.8 7.4 13 4.4 13 2z"/>',
  '寒冷': '<path fill="currentColor" d="M11.2 2h1.6v6.2l4.4-2.5.8 1.4-4.4 2.5 4.4 2.5-.8 1.4-4.4-2.5V17l4.4 2.5-.8 1.4-4.4-2.5V22h-1.6v-3.6l-4.4 2.5-.8-1.4 4.4-2.5V12.9L4.8 15.4l-.8-1.4 4.4-2.5-4.4-2.5.8-1.4 4.4 2.5z"/>',
  '閃電': '<path fill="currentColor" d="M13.2 2L6 13.2h5.2L9.4 22 20 9.4h-5.6z"/>',
  '強酸': '<path fill="currentColor" d="M12 3c3.2 5.4 6 8.6 6 12.2A6 6 0 0 1 6 15.2C6 11.6 8.8 8.4 12 3z"/><circle cx="10" cy="15" r="1" fill="#fff" fill-opacity=".5"/>',
  '毒素': '<path fill="currentColor" d="M9 4h6v3l2.6 3.2A6.2 6.2 0 1 1 6.4 10.2L9 7zm1.6 9.2c.6 0 1 .6 1 1.4S11.2 16 10.6 16s-1-.6-1-1.4.4-1.4 1-1.4zm4 0c.6 0 1 .6 1 1.4s-.4 1.4-1 1.4-1-.6-1-1.4.4-1.4 1-1.4z"/>',
  '雷鳴': '<path fill="none" stroke="currentColor" stroke-width="1.8" d="M12 5v14M7.5 8.5 12 12l4.5-3.5M7.5 15.5 12 12l4.5 3.5"/><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.3"/>',
  '力場': '<path fill="currentColor" d="M12 2 14 8l6 .4-4.6 3.6L17 18l-5-3.2L7 18l1.6-6L4 8.4 10 8z"/>',
  '光耀': '<path fill="currentColor" d="M12 7.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2zM11.2 1h1.6v4h-1.6zM11.2 19h1.6v4h-1.6zM1 11.2h4v1.6H1zm18 0h4v1.6h-4zM4.1 3.5l1.1-1.1 2.8 2.8-1.1 1.1zm11.9 11.9 1.1-1.1 2.8 2.8-1.1 1.1zM3.5 19.9l1.1 1.1 2.8-2.8-1.1-1.1zm14.1-8.3 1.1 1.1-2.8 2.8-1.1-1.1z"/>',
  '心靈': '<path fill="currentColor" d="M12 4c3.8 0 6.5 2.5 6.5 6.2 0 2.6-1.5 4.4-3.1 5.6L12 21l-3.4-5.2C7 14.6 5.5 12.8 5.5 10.2 5.5 6.5 8.2 4 12 4z"/>',
  '專注': '<path fill="currentColor" d="M12 3 4 7.5V16l8 4.5 8-4.5V7.5z"/><circle cx="12" cy="12" r="2.2" fill="#fff" fill-opacity=".75"/>',
  '儀式': '<path fill="currentColor" d="M7 4h10v2H7zm0 3h10v13H7z"/><path fill="#fff" fill-opacity=".45" d="M9 9h6v1.4H9zm0 3h6v1.4H9zm0 3h4v1.4H9z"/>',
  '動作': '<path fill="currentColor" d="M12 2 20 12 12 22 4 12z"/>',
  '附贈': '<path fill="currentColor" d="M12 3 21 19H3z"/>',
  '反應': '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M7 8a6 6 0 1 1-1.2 6"/><path fill="currentColor" d="M7 4.5 10.5 9H3.5z"/>'
}

function tagIcon(val) {
  const inner = TAG_SVG[val]
  if (!inner) return ''
  return `<svg class="tag-ic" viewBox="0 0 24 24" aria-hidden="true">${inner}</svg>`
}

if (typeof globalThis !== 'undefined') globalThis.tagIcon = tagIcon
