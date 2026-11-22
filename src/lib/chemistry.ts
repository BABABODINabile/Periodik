import { elements } from '@/data/elementsData';
import { findElement, getDetail } from '@/lib/elements';

const numberBySymbol = new Map(
  (elements as { symbol: string; number: number }[]).map((element) => [element.symbol, element.number]),
);

export function atomicMass(symbol: string): number {
  const number = numberBySymbol.get(symbol);
  const element = number ? findElement(number) : undefined;
  const raw = element ? getDetail(element.number)?.level2_atomic?.mass?.highSchool : undefined;
  const value = raw ? parseFloat(raw.replace(',', '.')) : NaN;
  return Number.isFinite(value) ? value : 0;
}

/** Analyse une formule avec parenthèses et hydrates (`CuSO4·5H2O`). */
export function parseFormula(formula: string): Record<string, number> {
  const parts = formula.replace(/\s/g, '').split(/[·•.]/).filter(Boolean);
  const result: Record<string, number> = {};

  parts.forEach((part) => {
    const hydrate = part.match(/^(\d+)([A-Za-z(].*)$/);
    const multiplier = hydrate ? parseInt(hydrate[1], 10) : 1;
    const source = hydrate ? hydrate[2] : part;
    let index = 0;

    const readNumber = (): number => {
      const match = source.slice(index).match(/^\d+/);
      if (!match) return 0;
      index += match[0].length;
      return parseInt(match[0], 10);
    };

    const parseGroup = (): Record<string, number> => {
      const counts: Record<string, number> = {};
      while (index < source.length && source[index] !== ')') {
        if (source[index] === '(') {
          index += 1;
          const inner = parseGroup();
          if (source[index] === ')') index += 1;
          const factor = readNumber() || 1;
          Object.entries(inner).forEach(([element, count]) => {
            counts[element] = (counts[element] ?? 0) + count * factor;
          });
          continue;
        }
        const match = source.slice(index).match(/^([A-Z][a-z]?)/);
        if (!match) {
          index += 1;
          continue;
        }
        const element = match[1];
        index += element.length;
        const count = readNumber() || 1;
        counts[element] = (counts[element] ?? 0) + count;
      }
      return counts;
    };

    Object.entries(parseGroup()).forEach(([element, count]) => {
      result[element] = (result[element] ?? 0) + count * multiplier;
    });
  });

  return result;
}

export function formulaMass(atoms: Record<string, number>): number {
  return Object.entries(atoms).reduce((sum, [symbol, count]) => sum + atomicMass(symbol) * count, 0);
}

export function formatFormula(atoms: Record<string, number>): string {
  const subscripts = '₀₁₂₃₄₅₆₇₈₉';
  return Object.entries(atoms)
    .map(([symbol, count]) => {
      if (count === 1) return symbol;
      return symbol + String(count).split('').map((digit) => subscripts[Number(digit)]).join('');
    })
    .join('');
}
