/**
 * Illustrated explainer panels and scan results.
 *
 * Every picture in the game is inline SVG so there are no assets to load and
 * everything scales perfectly on a phone or a big tablet. Add a key here and
 * any case can reference it with `{ type:'show', art:'yourKey' }` or
 * `{ type:'scan', revealArt:'yourKey' }`.
 */

const VB = 'viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg"';

/* ══════════════════════════════════════════ teaching panels (show step) ══ */

export const SHOW_ART = {
  heart: () => `<svg ${VB} class="art">
    <defs><radialGradient id="hg"><stop offset="0%" stop-color="#ff8fa0"/><stop offset="100%" stop-color="#e8384f"/></radialGradient></defs>
    <g transform="translate(150 100)">
      <g class="art-beat">
        <path d="M 0 46 C -58 6 -46 -42 -16 -34 C -6 -32 0 -24 0 -18 C 0 -24 6 -32 16 -34 C 46 -42 58 6 0 46 Z" fill="url(#hg)"/>
        <path d="M -18 -18 C -26 -6 -22 8 -10 18" stroke="rgba(255,255,255,.45)" stroke-width="5" fill="none" stroke-linecap="round"/>
      </g>
      ${[0, 1, 2].map((i) => `<circle cx="0" cy="0" r="${52 + i * 14}" fill="none" stroke="#ff8fa0" stroke-width="3" opacity="0">
        <animate attributeName="opacity" values="0;.5;0" dur="1.1s" begin="${i * 0.14}s" repeatCount="indefinite"/>
        <animate attributeName="r" values="${46 + i * 12};${72 + i * 12}" dur="1.1s" begin="${i * 0.14}s" repeatCount="indefinite"/>
      </circle>`).join('')}
    </g>
    <text x="150" y="188" text-anchor="middle" font-size="15" fill="#6B6790" font-family="Baloo 2, sans-serif">thump — thump — thump</text>
  </svg>`,

  lungs: () => `<svg ${VB} class="art">
    <g transform="translate(150 100)">
      <rect x="-6" y="-70" width="12" height="46" rx="6" fill="#9fb2d4"/>
      <path d="M -6 -30 q -14 4 -18 16" stroke="#9fb2d4" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M 6 -30 q 14 4 18 16" stroke="#9fb2d4" stroke-width="9" fill="none" stroke-linecap="round"/>
      <g class="art-breathe">
        <path d="M -26 -16 q -44 6 -46 52 q -2 38 26 40 q 22 2 22 -30 z" fill="#ff9eb4"/>
        <path d="M 26 -16 q 44 6 46 52 q 2 38 -26 40 q -22 2 -22 -30 z" fill="#ff9eb4"/>
        <g stroke="rgba(255,255,255,.5)" stroke-width="3" fill="none">
          <path d="M -34 4 q -12 14 -10 34"/><path d="M 34 4 q 12 14 10 34"/>
        </g>
      </g>
      ${[-70, -40, 40, 70].map((x, i) => `<circle cx="${x}" cy="20" r="4" fill="#7ed0ff" opacity=".8">
        <animate attributeName="cy" values="60;-40" dur="2.6s" begin="${i * 0.5}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;.9;0" dur="2.6s" begin="${i * 0.5}s" repeatCount="indefinite"/></circle>`).join('')}
    </g>
    <text x="150" y="190" text-anchor="middle" font-size="15" fill="#6B6790" font-family="Baloo 2, sans-serif">in… and ouuut…</text>
  </svg>`,

  germs: () => `<svg ${VB} class="art">
    ${[[70, 70, 26, '#7fd48f'], [160, 60, 20, '#8fbcff'], [230, 90, 24, '#ffa9d0'], [110, 135, 22, '#ffc36b'], [205, 150, 18, '#b39cf5']]
      .map(([x, y, r, c], i) => germ(x, y, r, c, i)).join('')}
    <text x="150" y="192" text-anchor="middle" font-size="14" fill="#6B6790" font-family="Baloo 2, sans-serif">too tiny to see — but very busy</text>
  </svg>`,

  cells: () => `<svg ${VB} class="art">
    <rect x="0" y="0" width="300" height="200" fill="#eaf6ff"/>
    ${[[68, 72, 30], [150, 60, 26], [226, 88, 28], [104, 140, 27], [206, 148, 24], [40, 140, 20]]
      .map(([x, y, r], i) => `<g>
        <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.86}" fill="#9be0c0" stroke="#4fbf94" stroke-width="3">
          <animate attributeName="rx" values="${r};${r * 1.08};${r}" dur="${3 + i * 0.4}s" repeatCount="indefinite"/>
        </ellipse>
        <circle cx="${x + 3}" cy="${y - 2}" r="${r * 0.34}" fill="#3f9d7a"/>
        <circle cx="${x - r * 0.4}" cy="${y + r * 0.3}" r="3" fill="#4fbf94" opacity=".7"/>
      </g>`).join('')}
    <text x="150" y="192" text-anchor="middle" font-size="14" fill="#3f7a63" font-family="Baloo 2, sans-serif">tiny living building blocks</text>
  </svg>`,

  bones: () => `<svg ${VB} class="art">
    <rect x="0" y="0" width="300" height="200" rx="14" fill="#1e2a4a"/>
    <g stroke="#eaf2ff" stroke-width="16" stroke-linecap="round" fill="none" opacity=".95">
      <path d="M 60 60 L 140 96"/><path d="M 152 100 L 236 128"/>
    </g>
    <circle cx="146" cy="98" r="15" fill="#eaf2ff"/>
    <circle cx="58" cy="58" r="17" fill="#eaf2ff"/>
    <g fill="#eaf2ff"><circle cx="240" cy="130" r="10"/><circle cx="252" cy="140" r="8"/><circle cx="236" cy="146" r="8"/></g>
    <text x="150" y="182" text-anchor="middle" font-size="14" fill="#9fd3ff" font-family="Baloo 2, sans-serif">206 bones, and every one alive</text>
  </svg>`,

  eye: () => `<svg ${VB} class="art">
    <g transform="translate(150 92)">
      <ellipse cx="0" cy="0" rx="76" ry="52" fill="#fff" stroke="#c9d6ea" stroke-width="4"/>
      <circle cx="6" cy="0" r="34" fill="#4aa8e0"/>
      <circle cx="6" cy="0" r="15" fill="#20293f">
        <animate attributeName="r" values="15;8;15" dur="4s" repeatCount="indefinite"/></circle>
      <circle cx="-4" cy="-11" r="8" fill="#fff" opacity=".9"/>
      <path d="M -104 -6 l 26 6 l -26 6" fill="none" stroke="#ffc844" stroke-width="4" stroke-linecap="round">
        <animate attributeName="opacity" values=".2;1;.2" dur="1.8s" repeatCount="indefinite"/></path>
      <path d="M -100 0 H -40" stroke="#ffc844" stroke-width="4" stroke-dasharray="7 7" stroke-linecap="round"/>
    </g>
    <text x="150" y="184" text-anchor="middle" font-size="14" fill="#6B6790" font-family="Baloo 2, sans-serif">light goes in through the black circle</text>
  </svg>`,

  teeth: () => `<svg ${VB} class="art">
    <g transform="translate(150 96)">
      <path d="M -70 -30 q 70 -34 140 0 q 6 60 -70 74 q -76 -14 -70 -74 z" fill="#ffd7c4"/>
      <rect x="-26" y="-24" width="22" height="46" rx="6" fill="#fff">
        <animate attributeName="height" values="40;58;40" dur="3.4s" repeatCount="indefinite"/></rect>
      <rect x="4" y="-24" width="22" height="46" rx="6" fill="#fff">
        <animate attributeName="height" values="40;58;40" dur="3.4s" repeatCount="indefinite"/></rect>
      <text x="60" y="-16" font-size="22">🌾</text>
    </g>
    <text x="150" y="186" text-anchor="middle" font-size="14" fill="#6B6790" font-family="Baloo 2, sans-serif">growing… growing… growing…</text>
  </svg>`,

  wing: () => `<svg ${VB} class="art">
    <g transform="translate(150 96)">
      <path d="M -84 6 q 30 -46 84 -34 q 54 12 84 34 q -84 30 -168 0 z" fill="#bfe3ff" opacity=".55"/>
      <g stroke="#3a4a6b" stroke-width="9" stroke-linecap="round" fill="none">
        <path d="M -70 6 L -20 -18"/><path d="M -14 -20 L 34 -22"/><path d="M 40 -20 L 76 -2"/>
      </g>
      <g fill="#3a4a6b"><circle cx="-17" cy="-19" r="8"/><circle cx="37" cy="-21" r="8"/></g>
      <g stroke="#7fb6e8" stroke-width="3" fill="none" opacity=".8">
        ${[0, 1, 2, 3, 4].map((i) => `<path d="M ${-50 + i * 26} 4 q 6 22 -4 30"/>`).join('')}
      </g>
    </g>
    <text x="150" y="186" text-anchor="middle" font-size="14" fill="#6B6790" font-family="Baloo 2, sans-serif">arm • elbow • wrist — just like yours</text>
  </svg>`,

  stitches: () => `<svg ${VB} class="art">
    <rect x="0" y="0" width="300" height="200" rx="14" fill="#fbeee2"/>
    <g transform="translate(150 96)">
      <path d="M -110 0 q 40 -18 60 0" fill="none" stroke="#d7b48c" stroke-width="16" stroke-linecap="round"/>
      <path d="M 50 0 q 20 -18 60 0" fill="none" stroke="#d7b48c" stroke-width="16" stroke-linecap="round"/>
      <g stroke="#c1485c" stroke-width="5" stroke-linecap="round">
        ${[0, 1, 2, 3, 4].map((i) => `<path d="M ${-44 + i * 22} -12 L ${-32 + i * 22} 12">
          <animate attributeName="opacity" values="0;1;1" dur="2.6s" begin="${i * 0.35}s" repeatCount="indefinite"/>
        </path>`).join('')}
      </g>
      <text x="66" y="-18" font-size="24">🪡</text>
    </g>
    <text x="150" y="182" text-anchor="middle" font-size="14" fill="#8a6a48" font-family="Baloo 2, sans-serif">in, out, in, out — and the gap is gone</text>
  </svg>`,

  flea: () => `<svg ${VB} class="art">
    <rect x="0" y="150" width="300" height="50" fill="#e4c9a0"/>
    ${[[60, 0], [150, .6], [230, 1.2]].map(([x, d]) => `<g>
      <g transform="translate(${x} 140)">
        <ellipse cx="0" cy="0" rx="16" ry="12" fill="#7a5a3f"/>
        <circle cx="-13" cy="-4" r="7" fill="#7a5a3f"/>
        <circle cx="-16" cy="-6" r="2.4" fill="#fff"/>
        <g stroke="#5c4230" stroke-width="3" stroke-linecap="round">
          <path d="M 4 8 l 8 12"/><path d="M -2 10 l -2 12"/><path d="M 10 4 l 12 6"/></g>
        <animateTransform attributeName="transform" type="translate"
          values="${x} 140; ${x} 60; ${x} 140" dur="1.9s" begin="${d}s" repeatCount="indefinite"/>
      </g></g>`).join('')}
    <text x="150" y="184" text-anchor="middle" font-size="14" fill="#6b4a2e" font-family="Baloo 2, sans-serif">100 times its own height!</text>
  </svg>`,
};

function germ(x, y, r, color, i) {
  return `<g>
    <circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>
    <g stroke="${color}" stroke-width="4" stroke-linecap="round">
      ${[0, 1, 2, 3, 4, 5].map((k) => {
        const a = (Math.PI * 2 * k) / 6;
        return `<path d="M ${x + Math.cos(a) * r} ${y + Math.sin(a) * r} L ${x + Math.cos(a) * (r + 9)} ${y + Math.sin(a) * (r + 9)}"/>`;
      }).join('')}
    </g>
    <circle cx="${x - r * 0.3}" cy="${y - r * 0.2}" r="${r * 0.22}" fill="rgba(0,0,0,.35)"/>
    <circle cx="${x + r * 0.3}" cy="${y - r * 0.2}" r="${r * 0.22}" fill="rgba(0,0,0,.35)"/>
    <path d="M ${x - r * 0.3} ${y + r * 0.3} q ${r * 0.3} ${r * 0.3} ${r * 0.6} 0" stroke="rgba(0,0,0,.3)" stroke-width="2.6" fill="none"/>
    <animateTransform attributeName="transform" type="translate"
      values="0 0; ${(i % 2 ? 8 : -8)} -10; 0 0" dur="${3.2 + i * 0.5}s" repeatCount="indefinite"/>
  </g>`;
}

/* ═══════════════════════════════════════════════ scan results (X-ray) ══ */

const xrayFrame = (inner, caption) => `<svg ${VB} class="art art--xray">
  <rect x="0" y="0" width="300" height="200" rx="12" fill="#0f1c38"/>
  <rect x="6" y="6" width="288" height="188" rx="9" fill="none" stroke="#2f4d86" stroke-width="2"/>
  ${inner}
  <text x="150" y="188" text-anchor="middle" font-size="13" fill="#8fc4ff" font-family="Baloo 2, sans-serif">${caption}</text>
  <rect class="scanline" x="0" y="0" width="300" height="26" fill="url(#scanGlow)" opacity=".35"/>
  <defs><linearGradient id="scanGlow" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#8fdcff" stop-opacity="0"/><stop offset="50%" stop-color="#8fdcff"/><stop offset="100%" stop-color="#8fdcff" stop-opacity="0"/>
  </linearGradient></defs>
</svg>`;

const microFrame = (inner, caption) => `<svg ${VB} class="art art--micro">
  <defs><clipPath id="lens"><circle cx="150" cy="92" r="82"/></clipPath></defs>
  <rect x="0" y="0" width="300" height="200" fill="#101a2e"/>
  <g clip-path="url(#lens)"><rect x="60" y="10" width="180" height="170" fill="#f3fff8"/>${inner}</g>
  <circle cx="150" cy="92" r="82" fill="none" stroke="#3a4a6b" stroke-width="10"/>
  <circle cx="150" cy="92" r="88" fill="none" stroke="#6B6790" stroke-width="3"/>
  <text x="150" y="190" text-anchor="middle" font-size="13" fill="#9fe6c4" font-family="Baloo 2, sans-serif">${caption}</text>
</svg>`;

export const SCAN_ART = {
  'arm-break': () => xrayFrame(`
    <g stroke="#dbe9ff" stroke-width="20" stroke-linecap="round" fill="none" opacity=".9">
      <path d="M 56 58 L 140 92"/><path d="M 160 100 L 240 132"/></g>
    <circle cx="150" cy="96" r="17" fill="#dbe9ff"/>
    <circle cx="54" cy="56" r="18" fill="#dbe9ff"/>
    <g fill="#dbe9ff"><circle cx="244" cy="134" r="11"/><circle cx="256" cy="144" r="9"/></g>
    <g class="art-flag"><path d="M 196 104 l 12 22" stroke="#ff6b6b" stroke-width="5" stroke-linecap="round"/>
      <circle cx="202" cy="115" r="24" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="6 6"/></g>`,
    'right wrist'),

  'leg-crack': () => xrayFrame(`
    <g stroke="#dbe9ff" stroke-width="18" stroke-linecap="round" fill="none" opacity=".9">
      <path d="M 92 40 L 130 100"/><path d="M 134 112 L 168 168"/></g>
    <circle cx="132" cy="106" r="16" fill="#dbe9ff"/>
    <g class="art-flag"><path d="M 150 138 l 16 10" stroke="#ff6b6b" stroke-width="5" stroke-linecap="round"/>
      <circle cx="158" cy="142" r="24" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="6 6"/></g>`,
    'back leg'),

  'wing-crack': () => xrayFrame(`
    <g stroke="#dbe9ff" stroke-width="11" stroke-linecap="round" fill="none" opacity=".9">
      <path d="M 70 96 L 130 74"/><path d="M 140 74 L 200 84"/><path d="M 208 88 L 244 108"/></g>
    <g fill="#dbe9ff"><circle cx="134" cy="74" r="8"/><circle cx="204" cy="86" r="8"/></g>
    <g class="art-flag"><circle cx="170" cy="78" r="22" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="6 6"/>
      <path d="M 166 70 l 8 16" stroke="#ff6b6b" stroke-width="4" stroke-linecap="round"/></g>`,
    'left wing'),

  'chest-infection': () => xrayFrame(`
    <g fill="none" stroke="#dbe9ff" stroke-width="7" opacity=".85">
      ${[0, 1, 2, 3].map((i) => `<path d="M 74 ${58 + i * 24} q 76 ${18 + i * 3} 152 0"/>`).join('')}
      <path d="M 150 44 V 158"/></g>
    <path d="M 84 66 q -14 60 22 84 q 34 6 40 -20 q 4 -60 -12 -70 z" fill="#dbe9ff" opacity=".18"/>
    <path d="M 216 66 q 14 60 -22 84 q -34 6 -40 -20 q -4 -60 12 -70 z" fill="#dbe9ff" opacity=".18"/>
    <g class="art-flag"><ellipse cx="196" cy="118" rx="30" ry="24" fill="#cfe6ff" opacity=".55"/>
      <ellipse cx="196" cy="118" rx="36" ry="30" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="6 6"/></g>`,
    'chest — front view'),

  'tummy-duck': () => xrayFrame(`
    <ellipse cx="150" cy="104" rx="112" ry="70" fill="#dbe9ff" opacity=".10"/>
    <g stroke="#dbe9ff" stroke-width="6" fill="none" opacity=".45">
      ${[0, 1, 2].map((i) => `<path d="M 54 ${64 + i * 30} q 96 14 192 0"/>`).join('')}</g>
    <g transform="translate(146 104)">
      <ellipse cx="4" cy="10" rx="42" ry="30" fill="#f2f8ff"/>
      <path d="M 34 2 q 26 -6 30 10 q -14 10 -30 4 z" fill="#f2f8ff"/>
      <circle cx="-26" cy="-20" r="21" fill="#f2f8ff"/>
      <path d="M -44 -22 l -24 8 l 24 9 z" fill="#f2f8ff"/>
      <circle cx="-30" cy="-25" r="4" fill="#0f1c38"/>
      <path d="M -6 8 q 16 12 32 4" stroke="#c8dcf5" stroke-width="3" fill="none" opacity=".7"/>
    </g>
    <g class="art-flag">
      <ellipse cx="150" cy="108" rx="70" ry="48" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="7 7"/>
    </g>`,
    'tummy — is that… a duck?'),

  'toy-inside': () => xrayFrame(`
    <ellipse cx="150" cy="104" rx="112" ry="70" fill="#dbe9ff" opacity=".10"/>
    <g fill="#cfe0f7" opacity=".55">
      ${[[96, 78, 20], [150, 66, 24], [204, 84, 21], [112, 132, 22], [176, 136, 24], [150, 108, 18]]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}
    </g>
    <g transform="translate(196 124)">
      <circle r="17" fill="#f2f8ff"/>
      <circle r="17" fill="none" stroke="#0f1c38" stroke-width="2"/>
      <g fill="#0f1c38"><circle cx="-4" cy="-4" r="2"/><circle cx="4" cy="-4" r="2"/>
        <circle cx="-4" cy="4" r="2"/><circle cx="4" cy="4" r="2"/></g>
    </g>
    <g class="art-flag">
      <circle cx="196" cy="124" r="34" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="7 7"/>
    </g>`,
    'inside the tummy — all soft… except one bit'),

  'robot-inside': () => xrayFrame(`
    <rect x="52" y="44" width="196" height="118" rx="10" fill="#dbe9ff" opacity=".10"/>
    <g stroke="#8fc4ff" stroke-width="3" fill="none" opacity=".7">
      <path d="M 74 132 q 30 -22 62 -6 q 34 16 62 -14"/>
      <path d="M 74 108 q 40 -28 76 -6 q 30 18 56 -8"/>
    </g>
    <g fill="#cfe0f7" opacity=".7">
      <rect x="82" y="60" width="26" height="18" rx="3"/>
      <rect x="196" y="62" width="22" height="16" rx="3"/>
      <circle cx="150" cy="70" r="10"/>
    </g>
    <g transform="translate(150 116)">
      <rect x="-34" y="-15" width="68" height="30" rx="5" fill="#f2f8ff"/>
      <rect x="34" y="-6" width="7" height="12" rx="2" fill="#f2f8ff"/>
      <text x="-18" y="6" font-size="15" fill="#0f1c38" font-family="Baloo 2, sans-serif">+ —</text>
    </g>
    <g class="art-flag">
      <rect x="106" y="94" width="88" height="44" rx="8" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-dasharray="7 7"/>
    </g>`,
    'inside the hatch — one battery, and it has leaked'),

  bacteria: () => microFrame(`
    ${[[110, 60], [140, 74], [168, 62], [96, 116], [126, 132], [156, 122], [196, 96], [214, 122]]
      .map(([x, y], i) => `<g>
        <ellipse cx="${x}" cy="${y}" rx="15" ry="13" fill="#a97bf0" stroke="#7f4fd0" stroke-width="2.5"/>
        <circle cx="${x - 4}" cy="${y - 3}" r="4" fill="rgba(255,255,255,.6)"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;${i % 2 ? 5 : -5} 4;0 0" dur="${3 + i * .3}s" repeatCount="indefinite"/>
      </g>`).join('')}
    <g stroke="#7f4fd0" stroke-width="2" opacity=".5" fill="none">
      <path d="M 110 60 L 140 74 L 168 62"/><path d="M 96 116 L 126 132 L 156 122"/></g>`,
    'bacteria — joined in little chains'),

  mites: () => microFrame(`
    ${[[120, 76], [176, 100], [128, 132], [190, 60]].map(([x, y], i) => `<g>
      <ellipse cx="${x}" cy="${y}" rx="17" ry="14" fill="#c98a5b" stroke="#8a5a35" stroke-width="2.5"/>
      <circle cx="${x - 12}" cy="${y - 4}" r="7" fill="#8a5a35"/>
      <g stroke="#8a5a35" stroke-width="2.6" stroke-linecap="round">
        ${[-1, 1].map((s) => [0, 1, 2, 3].map((k) => `<path d="M ${x + s * 8} ${y - 6 + k * 5} l ${s * 13} ${k * 3 - 4}"/>`).join('')).join('')}
      </g>
      <animateTransform attributeName="transform" type="rotate" values="0 ${x} ${y};${i % 2 ? 8 : -8} ${x} ${y};0 ${x} ${y}" dur="${2.4 + i * .4}s" repeatCount="indefinite"/>
    </g>`).join('')}`,
    'mites — count the legs: eight!'),

  blood: () => microFrame(`
    ${[[104, 70], [142, 60], [178, 82], [116, 116], [158, 128], [196, 110], [136, 92], [190, 148], [98, 148]]
      .map(([x, y], i) => `<g><circle cx="${x}" cy="${y}" r="16" fill="#ef5f6d"/>
        <circle cx="${x}" cy="${y}" r="8" fill="#d8404f"/>
        <animateTransform attributeName="transform" type="translate" values="0 0;${i % 3 - 1} ${i % 2 ? 4 : -4};0 0" dur="${3.4 + i * .2}s" repeatCount="indefinite"/></g>`).join('')}
    <circle cx="150" cy="100" r="20" fill="#f7f2ff" stroke="#c9b6f0" stroke-width="3"/>
    <circle cx="150" cy="100" r="9" fill="#b39cf5"/>`,
    'red cells, and one white cell on patrol'),
};

export function showArt(key) {
  return (SHOW_ART[key] || SHOW_ART.cells)();
}

export function scanArt(key) {
  return (SCAN_ART[key] || SCAN_ART.bacteria)();
}
