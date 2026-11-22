import type { BaseElement, ElementDetail } from '@/types';

/** Nombre d'électrons de valence lorsqu'il est simple (groupes principaux). */
export function valenceOf(detail?: ElementDetail): number | null {
  const raw = detail?.level1_basic?.valenceElectrons;
  if (raw === null || raw === undefined) return null;
  const value = parseInt(String(raw).trim(), 10);
  return Number.isFinite(value) && value >= 1 && value <= 8 ? value : null;
}

export function isLewisApplicable(element: BaseElement, detail?: ElementDetail): boolean {
  if (!['Alkali Metal', 'Alkaline Earth Metal', 'Metalloid', 'Other nonmetal', 'Halogen', 'Noble Gas', 'Post-transition Metal'].includes(element.category)) {
    return false;
  }
  return valenceOf(detail) !== null;
}
