import { categoryColors as palette } from './tokens';

export const categoryColors = palette;

export function colorForCategory(category: string): string {
  return palette[category] ?? palette.Unknown;
}

export const legendCategories = Object.keys(palette);

export const categoryLabelKeys: Record<string, string> = {
  'Alkali Metal': 'tableLegend.alkaliMetal',
  'Alkaline Earth Metal': 'tableLegend.alkalineEarth',
  'Transition Metal': 'tableLegend.transitionMetal',
  'Post-transition Metal': 'tableLegend.postTransition',
  'Metalloid': 'tableLegend.metalloid',
  'Other nonmetal': 'tableLegend.otherNonmetal',
  'Halogen': 'tableLegend.halogen',
  'Noble Gas': 'tableLegend.nobleGas',
  'Lanthanide': 'tableLegend.lanthanide',
  'Actinide': 'tableLegend.actinide',
  Unknown: 'elementL1.unknown',
};
