import { elements, finallyData } from '@/data/elementsData';
import { biologicalRoleFr, chemistryNotesFr } from '@/data/elementNotesFr';
import { fr_elements } from '@/data/locales/fr';
import type { BaseElement, ElementDetail, Locale } from '@/types';

export const allElements: BaseElement[] = elements as BaseElement[];

interface FrElement {
  name?: string;
  ions?: string;
  history?: { discoveryYear?: string; discoveredBy?: string; namedBy?: string };
  stse?: string[];
  uses?: string[];
  hazards?: string[];
}

const frById = fr_elements as unknown as Record<string, FrElement>;

/** Quelques libellés descriptive laissés en anglais dans la locale d'origine. */
const DISCOVERER_FR: Record<string, string> = {
  'Ancient Civilizations': 'Civilisations antiques',
  'Ancient Civilizations (Iron Age)': 'Civilisations antiques (Âge du fer)',
  'Ancient Civilizations (Bronze Age)': 'Civilisations antiques (Âge du bronze)',
  'Ancient Civilizations (Iron Age) / Chinese': 'Civilisations antiques (Âge du fer) / Chine',
};

export function localizeDiscoverer(value?: string, locale: Locale = 'fr'): string | undefined {
  if (!value) return value;
  return locale === 'fr' ? DISCOVERER_FR[value] ?? value : value;
}

export function getDetail(number: number): ElementDetail | undefined {
  return (finallyData as unknown as Record<string, ElementDetail>)[String(number)];
}

export function getLocalizedName(element: BaseElement, locale: Locale): string {
  if (locale !== 'fr') return element.name;
  return frById[String(element.number)]?.name ?? element.name;
}

export function findElement(number: number): BaseElement | undefined {
  return allElements.find((element) => element.number === number);
}

export function getLocalizedIons(number: number, locale: Locale): string | undefined {
  if (locale !== 'fr') return undefined;
  return frById[String(number)]?.ions;
}

const PHASE_FR: Record<string, string> = {
  Gas: 'Gaz',
  Solid: 'Solide',
  Liquid: 'Liquide',
  Unknown: 'Inconnu',
  '': 'Inconnu',
};

export function localizedPhase(phase?: string | null, locale: Locale = 'fr'): string {
  if (!phase) return locale === 'fr' ? 'Inconnu' : 'Unknown';
  return locale === 'fr' ? PHASE_FR[phase] ?? phase : phase;
}

export interface LocalizedDetail {
  uses?: string[];
  hazards?: string[];
  stseContext?: string[];
  history?: { discoveryYear?: string; discoveredBy?: string; namedBy?: string };
  chemistryNotes?: string;
  biologicalRole?: string;
  phase?: string;
}

/** Champs pédagogiques traduits (FR) ou originaux (EN). */
export function getLocalizedDetail(number: number, locale: Locale): LocalizedDetail {
  const detail = getDetail(number);
  if (locale !== 'fr') {
    return {
      uses: detail?.level4_history_stse?.commonUses,
      hazards: detail?.level4_history_stse?.hazards,
      stseContext: detail?.level4_history_stse?.stseContext,
      history: detail?.level4_history_stse?.history,
      chemistryNotes: detail?.chemistryNotes,
      biologicalRole: detail?.biologicalRole,
      phase: detail?.level1_basic?.phaseAtSTP,
    };
  }
  const fr = frById[String(number)];
  const history = fr?.history ?? detail?.level4_history_stse?.history;
  return {
    uses: fr?.uses ?? detail?.level4_history_stse?.commonUses,
    hazards: fr?.hazards ?? detail?.level4_history_stse?.hazards,
    stseContext: fr?.stse ?? detail?.level4_history_stse?.stseContext,
    history: history
      ? { ...history, discoveredBy: localizeDiscoverer(history.discoveredBy, 'fr') }
      : undefined,
    chemistryNotes: chemistryNotesFr[number] ?? detail?.chemistryNotes,
    biologicalRole: biologicalRoleFr[number] ?? detail?.biologicalRole,
    phase: detail?.level1_basic?.phaseAtSTP,
  };
}
