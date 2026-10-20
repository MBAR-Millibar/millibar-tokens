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

// 1. Plain CSS variables, usable anywhere.
const tokensCss = `${header}
:root {
${scaleVars('--mbar-')}
  --mbar-logo: ${tokens.logo};
  --mbar-gradient: ${gradient(tokens.gradient.brand, '--mbar-')};
  --mbar-gradient-deep: ${gradient(tokens.gradient.deep, '--mbar-')};
}
`;

// 2. Tailwind v4 theme: navy-* / ocean-* colours and a bg-mbar-gradient utility.
const tailwindCss = `${header}
@theme {
${scaleVars('--color-')}
  --color-mbar-logo: ${tokens.logo};
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
