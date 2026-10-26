// The sealed box: a stenciled shipping crate drawn in ink, with a lid that can fly off.

const STENCIL = `font-family="'Big Shoulders Stencil Display','Big Shoulders Display',Impact,sans-serif" font-weight="900"`;
const MONO = `font-family="'Special Elite','Courier New',monospace"`;

export function crateSVG(label = "LIVE ANIMAL"): string {
  return `<svg class="crate" viewBox="0 0 340 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <clipPath id="crate-side"><path d="M250,130 L300,96 L300,238 L250,272 Z"/></clipPath>
    <clipPath id="crate-front"><path d="M40,130 H250 V272 H40 Z"/></clipPath>
  </defs>
  <g fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#inkwob)">
    <g class="crate-body">
      <path d="M250,130 L300,96 L300,238 L250,272 Z" fill="var(--kraft-dark)"/>
      <g clip-path="url(#crate-side)" stroke-width="1.4" opacity=".5">
        ${Array.from({ length: 14 }, (_, i) => `<path d="M${236 + i * 6},${290} l60,-200"/>`).join("")}
      </g>
      <g transform="matrix(1,-0.68,0,1,250,130)" stroke-width="2">
        <circle cx="25" cy="44" r="4" fill="var(--ink)"/><circle cx="25" cy="60" r="4" fill="var(--ink)"/><circle cx="25" cy="76" r="4" fill="var(--ink)"/>
        <text x="25" y="118" text-anchor="middle" font-size="13" fill="var(--ink)" stroke="none" ${STENCIL}>↑↑</text>
      </g>
      <path d="M40,130 H250 V272 H40 Z" fill="var(--kraft)"/>
      <g clip-path="url(#crate-front)" stroke-width="1.2" opacity=".35">
        <path d="M60,150 q60,-4 170,2 M62,196 q70,4 168,-2 M60,244 q80,-4 170,2"/>
      </g>
      <path d="M40,176 H250 M40,224 H250" stroke-width="2.4"/>
      <path d="M56,130 V272 M234,130 V272" stroke-width="2.4"/>
      ${[146, 192, 240].map((y) => `<circle cx="48" cy="${y + 4}" r="2.2" fill="var(--ink)"/><circle cx="242" cy="${y + 4}" r="2.2" fill="var(--ink)"/>`).join("")}
      <text x="145" y="168" text-anchor="middle" font-size="31" letter-spacing="1.5" fill="var(--ink)" stroke="none" ${STENCIL}>${label}</text>
      <text x="145" y="208" text-anchor="middle" font-size="17" letter-spacing="4" fill="var(--ink)" stroke="none" ${STENCIL}>DO NOT OBSERVE</text>
      <g transform="translate(145 248)" stroke="none" fill="var(--ink)">
        <circle r="15" fill="none" stroke="var(--ink)" stroke-width="2.4"/>
        <circle r="2.6"/>
        ${[0, 120, 240].map((a) => `<path transform="rotate(${a})" d="M0,-4.5 L-5.5,-12 A13,13 0 0 1 5.5,-12 Z"/>`).join("")}
      </g>
      <text x="74" y="256" font-size="10" fill="var(--ink)" stroke="none" ${MONO}>Nº 1935</text>
      <text x="216" y="256" text-anchor="end" font-size="10" fill="var(--ink)" stroke="none" ${MONO}>1 CAT</text>
    </g>
    <path class="seam" d="M40,129 H250 L300,95"/>
    <g class="crate-lid">
      <path d="M40,112 L250,112 L300,78 L90,78 Z" fill="var(--kraft-light)"/>
      <path d="M57,101 H267 M73,89 H283" stroke-width="1.6" opacity=".55"/>
      <path d="M40,112 H250 V128 H40 Z" fill="var(--kraft)"/>
      <text x="145" y="124" text-anchor="middle" font-size="10.5" letter-spacing="1.5" fill="var(--ink)" stroke="none" ${MONO}>HANDLE WITH UNCERTAINTY</text>
      <path d="M250,112 L300,78 L300,94 L250,128 Z" fill="var(--kraft-dark)"/>
      <circle cx="48" cy="120" r="2" fill="var(--ink)"/><circle cx="242" cy="120" r="2" fill="var(--ink)"/>
    </g>
  </g>
</svg>`;
}
