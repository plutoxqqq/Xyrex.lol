import { svgIcons } from './icons.js';

export const tagSymbolMap = {
  Verified: { symbol: '✓', cls: 'verified' },
  Warning: { symbol: svgIcons.warning, cls: 'warning', isSvg: true },
  Trending: { symbol: svgIcons.trending, cls: 'trending', isSvg: true },
  Internal: { symbol: 'I', cls: 'internal' },
  External: { symbol: 'E', cls: 'external' }
};
