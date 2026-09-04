/**
 * The little result panel a tool shows after it is used — the "payoff" moment.
 * Each `readout.kind` gets its own animated presentation.
 */
import { h } from '../../core/dom.js';

export function readout(spec, tool, ctx) {
  const card = h('div', { class: 'readout', style: { '--tint': tool.tint } });
  const head = h('div', { class: 'readout__head' },
    h('span', { class: 'readout__icon' }, tool.icon),
    h('span', {}, spec.label || tool.readout?.label || tool.name));
  card.appendChild(head);

  switch (spec.kind) {
    case 'heartbeat':
      card.appendChild(h('div', { class: 'readout__ecg', html: ecgSvg() }));
      card.appendChild(bigValue(spec));
      break;
    case 'number':
      card.appendChild(bigValue(spec));
      break;
    case 'ecg':
      card.appendChild(h('div', { class: 'readout__ecg', html: ecgSvg() }));
      break;
    default:
      card.appendChild(h('div', { class: 'readout__text' }, ctx.fill(spec.value)));
  }

  if (spec.text) card.appendChild(h('div', { class: 'readout__note' }, ctx.fill(spec.text)));
  return card;
}

function bigValue(spec) {
  const wrap = h('div', { class: 'readout__value' });
  const num = h('span', { class: 'readout__num' }, '0');
  wrap.appendChild(num);
  if (spec.unit) wrap.appendChild(h('span', { class: 'readout__unit' }, spec.unit));

  // Count up to the value — small, cheap, and very satisfying.
  const target = parseFloat(spec.value);
  if (Number.isNaN(target)) { num.textContent = spec.value; return wrap; }
  const decimals = (String(spec.value).split('.')[1] || '').length;
  const start = performance.now();
  const dur = 900;
  const tick = (t) => {
    const p = Math.min(1, (t - start) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    num.textContent = (target * eased).toFixed(decimals);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return wrap;
}

function ecgSvg() {
  return `<svg viewBox="0 0 240 60" xmlns="http://www.w3.org/2000/svg">
    <path d="M 0 34 H 40 l 8 -22 l 10 44 l 8 -22 H 120 l 8 -22 l 10 44 l 8 -22 H 240"
      fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"
      pathLength="100" stroke-dasharray="100" stroke-dashoffset="100">
      <animate attributeName="stroke-dashoffset" values="100;0" dur="1.4s" repeatCount="indefinite"/>
    </path>
  </svg>`;
}
