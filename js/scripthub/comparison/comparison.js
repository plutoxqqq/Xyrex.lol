import { qs } from '../../core/dom.js';
import { escapeHtml } from '../../core/utils.js';

let comparisonSelection = [];
export function initComparison(ctx) {
  const { products, stabilityScoreMap, detectionRiskScore, detectionRiskLabel, estimatedPriceValue } = ctx;
  const selector = qs('#comparisonSelector');
  const tableWrap = qs('#comparisonTableWrap');
  const winnerSummary = qs('#comparisonWinnerSummary');
  const verdictsWrap = qs('#comparisonVerdicts');
  const table = qs('#comparisonTable');
  const selectedRow = qs('#comparisonSelectedRow');
  if (!selector || !tableWrap || !winnerSummary || !verdictsWrap || !table || !selectedRow) return;
  selector.querySelectorAll('[data-compare-name]').forEach(button => button.addEventListener('click', () => {
    const name = button.getAttribute('data-compare-name'); if (!name) return;
    if (comparisonSelection.includes(name)) comparisonSelection = comparisonSelection.filter(i=>i!==name); else if (comparisonSelection.length < 3) comparisonSelection = [...comparisonSelection,name];
    initComparison(ctx);
  }));
  selectedRow.innerHTML = comparisonSelection.length ? `Selected: ${comparisonSelection.map(name => `${escapeHtml(name)} ×`).join(' ').replace(/ ×$/, '')}` : 'Selected: None';
  const selectedProducts = comparisonSelection.map(name => products.find(item => item.name === name)).filter(Boolean).slice(0,3);
  if (selectedProducts.length < 2) { tableWrap.hidden = winnerSummary.hidden = verdictsWrap.hidden = true; table.innerHTML=''; return; }
  const rows=[{ label: 'sUNC', values: selectedProducts.map(i=>Number.isFinite(i.sunc)?i.sunc:-1), display:selectedProducts.map(i=>Number.isFinite(i.sunc)?`${i.sunc}%`:'None'), best:'max' },{ label:'Stability', values:selectedProducts.map(i=>stabilityScoreMap[i.stability]||0), display:selectedProducts.map(i=>i.stability), best:'max' },{ label:'Detection Risk', values:selectedProducts.map(i=>detectionRiskScore(i)), display:selectedProducts.map(i=>`${detectionRiskLabel(i)} (${detectionRiskScore(i)}/10)`), best:'min' },{ label:'Price', values:selectedProducts.map(i=>estimatedPriceValue(i)), display:selectedProducts.map(i=>i.pricingOptions?.[0]||i.freeOrPaid), best:'min' }];
  const win=(vals,m='max')=>{const valid=vals.filter(Number.isFinite); if(!valid.length)return []; const v=m==='max'?Math.max(...valid):Math.min(...valid); return vals.filter(x=>x===v).length===1?[vals.findIndex(x=>x===v)]:[];};
  table.innerHTML=`<thead><tr><th>Metric</th>${selectedProducts.map(i=>`<th>${escapeHtml(i.name)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><th>${escapeHtml(r.label)}</th>${r.display.map((d,i)=>`<td class="${win(r.values,r.best).includes(i)?'is-best':''}">${escapeHtml(String(d))}</td>`).join('')}</tr>`).join('')}</tbody>`;
  tableWrap.hidden = false; winnerSummary.hidden = false; verdictsWrap.hidden = false;
}
