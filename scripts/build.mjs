// Generates every output format from tokens.json, so they can't drift apart.
// Run `npm run build` after editing tokens.json and commit the results.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const tokens = JSON.parse(readFileSync(new URL('../tokens.json', import.meta.url)));
const header = '/* Generated from tokens.json by scripts/build.mjs. Do not edit by hand. */\n';

const resolve = (value) => {
  if (value.startsWith('#')) return value;
  const [scale, step] = value.split('.');
  const hex = tokens[scale]?.[step];
  if (!hex) throw new Error(`Unknown token reference: ${value}`);
  return hex;
};

const hsl = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  const round = (n) => Math.round(n * 10) / 10;
  return `${round(h * 360)} ${round(s * 100)}% ${round(l * 100)}%`;
};

const gradient = ({ angle, stops }, varPrefix) =>
  `linear-gradient(${angle}, ${stops.map((stop) => `var(${varPrefix}${stop.replace('.', '-')})`).join(', ')})`;

const scaleVars = (prefix) =>
  ['navy', 'ocean']
    .flatMap((scale) => Object.entries(tokens[scale]).map(([step, hex]) => `  ${prefix}${scale}-${step}: ${hex};`))
    .join('\n');

// Design Kit foundations (MD-8): fonts, text styles, spacing, radius. All names are
// prefixed with "mbar" so they add to a project's theme without replacing its defaults.
const lines = (entries) => entries.map(([name, value]) => `  ${name}: ${value};`).join('\n');
const fontVars = (prefix) => lines(Object.entries(tokens.font).map(([k, v]) => [`${prefix}${k}`, v]));
const spaceVars = (prefix) => lines(Object.entries(tokens.space).map(([k, v]) => [`${prefix}${k}`, v]));
const radiusVars = (prefix) => lines(Object.entries(tokens.radius).map(([k, v]) => [`${prefix}${k}`, v]));
const textDecls = (style, fontVar) =>
  [
    `font-family: var(${fontVar}${style.font})`,
    `font-size: ${style.size}`,
    `line-height: ${style.lineHeight}`,
    `font-weight: ${style.weight}`,
    style.tracking && `letter-spacing: ${style.tracking}`,
    style.uppercase && 'text-transform: uppercase',
    style.tabular && 'font-variant-numeric: tabular-nums',
  ].filter(Boolean);

// 1. Plain CSS variables, usable anywhere, plus .mbar-text-* classes for the type scale.
const tokensCss = `${header}
:root {
${scaleVars('--mbar-')}
  --mbar-logo: ${tokens.logo};
  --mbar-gradient: ${gradient(tokens.gradient.brand, '--mbar-')};
  --mbar-gradient-deep: ${gradient(tokens.gradient.deep, '--mbar-')};
${fontVars('--mbar-font-')}
${spaceVars('--mbar-space-')}
${radiusVars('--mbar-radius-')}
}
${Object.entries(tokens.text)
  .map(([name, style]) => `\n.mbar-text-${name} {\n${textDecls(style, '--mbar-font-').map((d) => `  ${d};`).join('\n')}\n}`)
  .join('\n')}
`;

// 2. Tailwind v4 theme: navy-* / ocean-* colours, font-mbar-*, text-mbar-*, rounded-mbar-*,
// a bg-mbar-gradient utility and a text-mbar-* style per type token.
const tailwindCss = `${header}
@theme {
${scaleVars('--color-')}
  --color-mbar-logo: ${tokens.logo};
${fontVars('--font-mbar-')}
${radiusVars('--radius-mbar-')}
${Object.entries(tokens.text)
  .map(([name, s]) => `  --text-mbar-${name}: ${s.size};\n  --text-mbar-${name}--line-height: ${s.lineHeight};\n  --text-mbar-${name}--font-weight: ${s.weight};${s.tracking ? `\n  --text-mbar-${name}--letter-spacing: ${s.tracking};` : ''}`)
  .join('\n')}
}

@utility bg-mbar-gradient {
  background-image: ${gradient(tokens.gradient.brand, '--color-')};
}

@utility bg-mbar-gradient-deep {
  background-image: ${gradient(tokens.gradient.deep, '--color-')};
}
`;

// 3. shadcn variables: hex for Tailwind v4 projects, HSL triplets for v3.
const shadcnBlock = (mode, format) =>
  Object.entries(tokens.shadcn[mode])
    .map(([name, value]) => `  --${name}: ${format(resolve(value))};`)
    .join('\n');

const shadcn = (format) => `${header}
:root {
${shadcnBlock('light', format)}
}

.dark {
${shadcnBlock('dark', format)}
}
`;

// 4. Tailwind v3 preset.
const preset = `${header.replace('/*', '//').replace(' */', '')}
module.exports = {
  theme: {
    extend: {
      colors: {
        navy: ${JSON.stringify(tokens.navy, null, 2).replace(/\n/g, '\n        ')},
        ocean: ${JSON.stringify(tokens.ocean, null, 2).replace(/\n/g, '\n        ')},
        'mbar-logo': '${tokens.logo}',
      },
      fontFamily: {
${Object.entries(tokens.font).map(([k, v]) => `        'mbar-${k}': ${JSON.stringify(v.split(/,\s*/).map((f) => f.replace(/"/g, '')))},`).join('\n')}
      },
      fontSize: {
${Object.entries(tokens.text).map(([k, s]) => `        'mbar-${k}': ['${s.size}', { lineHeight: '${s.lineHeight}', fontWeight: '${s.weight}'${s.tracking ? `, letterSpacing: '${s.tracking}'` : ''} }],`).join('\n')}
      },
      borderRadius: {
${Object.entries(tokens.radius).map(([k, v]) => `        'mbar-${k}': '${v}',`).join('\n')}
      },
      backgroundImage: {
        'mbar-gradient': 'linear-gradient(${tokens.gradient.brand.angle}, ${tokens.gradient.brand.stops.map(resolve).join(', ')})',
        'mbar-gradient-deep': 'linear-gradient(${tokens.gradient.deep.angle}, ${tokens.gradient.deep.stops.map(resolve).join(', ')})',
      },
    },
  },
};
`;

mkdirSync(new URL('../dist/', import.meta.url), { recursive: true });
const out = (file, content) => writeFileSync(new URL(`../dist/${file}`, import.meta.url), content);
out('tokens.css', tokensCss);
out('tailwind.css', tailwindCss);
out('shadcn.css', shadcn((hex) => hex));
out('shadcn-hsl.css', shadcn(hsl));
out('tailwind-preset.cjs', preset);
console.log('Built dist/: tokens.css, tailwind.css, shadcn.css, shadcn-hsl.css, tailwind-preset.cjs');
