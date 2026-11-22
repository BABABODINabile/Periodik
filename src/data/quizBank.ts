import { ionDisplayName, ionsReference, type IonReference } from '@/data/ionsReference';
import { allElements, getDetail, getLocalizedName } from '@/lib/elements';
import { formulaMass, parseFormula } from '@/lib/chemistry';
import type { Locale } from '@/types';

export const QUIZ_TOPICS = [
  'Tableau', 'Familles', 'Structure', 'Ions', 'Équations', 'Masse molaire', 'Solubilité',
] as const;
export type QuizTopic = (typeof QUIZ_TOPICS)[number];

export interface QuizQuestion {
  id: string;
  topic: QuizTopic;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
}

type Bilingual = { fr: string; en: string };

const FAMILIES: Record<string, Bilingual> = {
  'Alkali Metal': { fr: 'Métal alcalin', en: 'Alkali metal' },
  'Alkaline Earth Metal': { fr: 'Métal alcalino-terreux', en: 'Alkaline earth metal' },
  'Transition Metal': { fr: 'Métal de transition', en: 'Transition metal' },
  'Post-transition Metal': { fr: 'Post-transition', en: 'Post-transition' },
  'Metalloid': { fr: 'Métalloïde', en: 'Metalloid' },
  'Other nonmetal': { fr: 'Autre non-métal', en: 'Other nonmetal' },
  'Halogen': { fr: 'Halogène', en: 'Halogen' },
  'Noble Gas': { fr: 'Gaz noble', en: 'Noble gas' },
  'Lanthanide': { fr: 'Lanthanide', en: 'Lanthanide' },
  'Actinide': { fr: 'Actinide', en: 'Actinide' },
  'Unknown': { fr: 'Inconnu', en: 'Unknown' },
};

const SOLUBILITY_CASES: { pair: string; answer: Bilingual; distractors: Bilingual[]; why: Bilingual }[] = [
  { pair: 'Ag⁺ + Cl⁻', answer: { fr: 'Insoluble (AgCl)', en: 'Insoluble (AgCl)' }, distractors: [{ fr: 'Soluble', en: 'Soluble' }, { fr: 'Peu soluble', en: 'Slightly soluble' }], why: { fr: 'Les chlorures sont solubles sauf avec Ag⁺, Pb²⁺ et Hg₂²⁺.', en: 'Chlorides are soluble except with Ag⁺, Pb²⁺ and Hg₂²⁺.' } },
  { pair: 'Na⁺ + CO₃²⁻', answer: { fr: 'Soluble (Na₂CO₃)', en: 'Soluble (Na₂CO₃)' }, distractors: [{ fr: 'Insoluble', en: 'Insoluble' }, { fr: 'Peu soluble', en: 'Slightly soluble' }], why: { fr: 'Tous les sels de sodium sont solubles.', en: 'All sodium salts are soluble.' } },
  { pair: 'Ba²⁺ + SO₄²⁻', answer: { fr: 'Insoluble (BaSO₄)', en: 'Insoluble (BaSO₄)' }, distractors: [{ fr: 'Soluble', en: 'Soluble' }, { fr: 'Peu soluble', en: 'Slightly soluble' }], why: { fr: 'Les sulfates sont solubles sauf avec Ba²⁺, Pb²⁺ et Sr²⁺.', en: 'Sulfates are soluble except with Ba²⁺, Pb²⁺ and Sr²⁺.' } },
  { pair: 'K⁺ + NO₃⁻', answer: { fr: 'Soluble (KNO₃)', en: 'Soluble (KNO₃)' }, distractors: [{ fr: 'Insoluble', en: 'Insoluble' }, { fr: 'Peu soluble', en: 'Slightly soluble' }], why: { fr: 'Tous les nitrates sont solubles.', en: 'All nitrates are soluble.' } },
  { pair: 'Fe³⁺ + OH⁻', answer: { fr: 'Insoluble (Fe(OH)₃)', en: 'Insoluble (Fe(OH)₃)' }, distractors: [{ fr: 'Soluble', en: 'Soluble' }, { fr: 'Peu soluble', en: 'Slightly soluble' }], why: { fr: 'Les hydroxydes sont généralement insolubles sauf avec les alcalins.', en: 'Hydroxides are generally insoluble except with alkali metals.' } },
  { pair: 'Ca²⁺ + SO₄²⁻', answer: { fr: 'Peu soluble (CaSO₄)', en: 'Slightly soluble (CaSO₄)' }, distractors: [{ fr: 'Soluble', en: 'Soluble' }, { fr: 'Insoluble', en: 'Insoluble' }], why: { fr: 'Le sulfate de calcium est peu soluble.', en: 'Calcium sulfate is slightly soluble.' } },
];

const EQUATION_CASES: { equation: string; correct: string; wrong: string[]; why: Bilingual; prompt: Bilingual }[] = [
  { equation: 'H2 + O2 -> H2O', correct: '2H₂ + O₂ → 2H₂O', wrong: ['H₂ + O₂ → H₂O', 'H₂ + 2O₂ → 2H₂O', '2H₂ + 2O₂ → H₂O'], prompt: { fr: 'Quelle est l’équation équilibrée de H₂ + O₂ → H₂O ?', en: 'Which is the balanced equation for H₂ + O₂ → H₂O?' }, why: { fr: '4 H et 2 O de chaque côté.', en: '4 H and 2 O on each side.' } },
  { equation: 'Fe + O2 -> Fe2O3', correct: '4Fe + 3O₂ → 2Fe₂O₃', wrong: ['2Fe + O₂ → Fe₂O₃', 'Fe + O₂ → Fe₂O₃', '4Fe + 3O₂ → Fe₂O₃'], prompt: { fr: 'Quelle est l’équation équilibrée de Fe + O₂ → Fe₂O₃ ?', en: 'Which is the balanced equation for Fe + O₂ → Fe₂O₃?' }, why: { fr: '4 Fe et 6 O de chaque côté.', en: '4 Fe and 6 O on each side.' } },
  { equation: 'C3H8 + O2 -> CO2 + H2O', correct: 'C₃H₈ + 5O₂ → 3CO₂ + 4H₂O', wrong: ['C₃H₈ + 3O₂ → CO₂ + H₂O', '2C₃H₈ + 5O₂ → 6CO₂ + 4H₂O', 'C₃H₈ + 4O₂ → 3CO₂ + 4H₂O'], prompt: { fr: 'Quelle est l’équation équilibrée de C₃H₈ + O₂ → CO₂ + H₂O ?', en: 'Which is the balanced equation for C₃H₈ + O₂ → CO₂ + H₂O?' }, why: { fr: '3 C, 8 H et 10 O de chaque côté.', en: '3 C, 8 H and 10 O on each side.' } },
  { equation: 'Al + HCl -> AlCl3 + H2', correct: '2Al + 6HCl → 2AlCl₃ + 3H₂', wrong: ['Al + 3HCl → AlCl₃ + H₂', 'Al + 6HCl → AlCl₃ + 3H₂', '2Al + 3HCl → 2AlCl₃ + 3H₂'], prompt: { fr: 'Quelle est l’équation équilibrée de Al + HCl → AlCl₃ + H₂ ?', en: 'Which is the balanced equation for Al + HCl → AlCl₃ + H₂?' }, why: { fr: '2 Al, 6 H et 6 Cl de chaque côté.', en: '2 Al, 6 H and 6 Cl on each side.' } },
  { equation: 'N2 + H2 -> NH3', correct: 'N₂ + 3H₂ → 2NH₃', wrong: ['N₂ + H₂ → NH₃', 'N₂ + 2H₂ → 2NH₃', '2N₂ + 3H₂ → 2NH₃'], prompt: { fr: 'Quelle est l’équation équilibrée de N₂ + H₂ → NH₃ ?', en: 'Which is the balanced equation for N₂ + H₂ → NH₃?' }, why: { fr: '2 N et 6 H de chaque côté.', en: '2 N and 6 H on each side.' } },
  { equation: 'Ca(OH)2 + H3PO4 -> Ca3(PO4)2 + H2O', correct: '3Ca(OH)₂ + 2H₃PO₄ → Ca₃(PO₄)₂ + 6H₂O', wrong: ['Ca(OH)₂ + H₃PO₄ → Ca₃(PO₄)₂ + H₂O', '2Ca(OH)₂ + 2H₃PO₄ → Ca₃(PO₄)₂ + 4H₂O', '3Ca(OH)₂ + H₃PO₄ → Ca₃(PO₄)₂ + 3H₂O'], prompt: { fr: 'Quelle est l’équation équilibrée de Ca(OH)₂ + H₃PO₄ → Ca₃(PO₄)₂ + H₂O ?', en: 'Which is the balanced equation for Ca(OH)₂ + H₃PO₄ → Ca₃(PO₄)₂ + H₂O?' }, why: { fr: '3 Ca, 2 P, 8 O et 12 H de chaque côté.', en: '3 Ca, 2 P, 8 O and 12 H on each side.' } },
  { equation: 'KMnO4 + HCl -> KCl + MnCl2 + H2O + Cl2', correct: '2KMnO₄ + 16HCl → 2KCl + 2MnCl₂ + 8H₂O + 5Cl₂', wrong: ['KMnO₄ + 8HCl → KCl + MnCl₂ + 4H₂O + Cl₂', '2KMnO₄ + 8HCl → 2KCl + 2MnCl₂ + 4H₂O + 2Cl₂', 'KMnO₄ + 16HCl → KCl + MnCl₂ + 8H₂O + 5Cl₂'], prompt: { fr: 'Quelle est l’équation équilibrée de KMnO₄ + HCl → KCl + MnCl₂ + H₂O + Cl₂ ?', en: 'Which is the balanced equation for KMnO₄ + HCl → KCl + MnCl₂ + H₂O + Cl₂?' }, why: { fr: 'Tous les atomes sont conservés.', en: 'All atoms are conserved.' } },
  { equation: 'H2O -> H2 + O2', correct: '2H₂O → 2H₂ + O₂', wrong: ['H₂O → H₂ + O₂', '2H₂O → H₂ + O₂', 'H₂O → 2H₂ + O₂'], prompt: { fr: 'Quelle est l’équation équilibrée de H₂O → H₂ + O₂ ?', en: 'Which is the balanced equation for H₂O → H₂ + O₂?' }, why: { fr: '4 H et 2 O de chaque côté.', en: '4 H and 2 O on each side.' } },
];

const MASS_FORMULAS = ['H2O', 'CO2', 'NaCl', 'CH4', 'O2', 'NH3', 'Ca(OH)2', 'H2SO4', 'C6H12O6', 'CuSO4·5H2O'];

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function makeQuestion(
  id: string, topic: QuizTopic, prompt: string, answer: string, distractors: string[], explanation: string,
): QuizQuestion {
  const options = shuffle(Array.from(new Set([answer, ...shuffle(distractors).slice(0, 3)])));
  return { id, topic, prompt, options, answer, explanation };
}

function chargeOf(ion: IonReference): number {
  const match = ion.f.match(/([⁰¹²³⁴⁵⁶⁷⁸⁹]*)([⁺⁻])$/);
  if (!match) return 0;
  const digits: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
  const value = match[1].split('').map((d) => digits[d]).join('');
  const magnitude = value ? parseInt(value, 10) : 1;
  return match[2] === '⁻' ? -magnitude : magnitude;
}

function realElements() {
  return allElements.filter((element) => typeof element.number === 'number');
}

function buildOne(index: number, topic: QuizTopic, locale: Locale): QuizQuestion {
  const tr = (fr: string, en: string) => (locale === 'fr' ? fr : en);

  if (topic === 'Tableau') {
    const element = pick(realElements());
    const mode = Math.floor(Math.random() * 4);
    if (mode === 0) {
      return makeQuestion(`t${index}`, topic,
        tr(`Quel est le nom de l’élément ${element.symbol} ?`, `What is the name of element ${element.symbol}?`),
        getLocalizedName(element, locale),
        shuffle(realElements().filter((item) => item.number !== element.number)).slice(0, 3).map((item) => getLocalizedName(item, locale)),
        tr(`Le symbole ${element.symbol} correspond au numéro ${element.number}.`, `Symbol ${element.symbol} corresponds to number ${element.number}.`));
    }
    if (mode === 1) {
      return makeQuestion(`t${index}`, topic,
        tr(`Quel est le symbole de l’élément numéro ${element.number} ?`, `What is the symbol of element number ${element.number}?`),
        element.symbol,
        shuffle(realElements().filter((item) => item.number !== element.number)).slice(0, 3).map((item) => item.symbol),
        tr(`Le numéro ${element.number} correspond à ${getLocalizedName(element, locale)} (${element.symbol}).`, `Number ${element.number} is ${getLocalizedName(element, locale)} (${element.symbol}).`));
    }
    const detail = getDetail(element.number);
    const mass = detail?.level2_atomic?.mass?.highSchool ?? '—';
    if (mode === 2) {
      return makeQuestion(`t${index}`, topic,
        tr(`Quelle est la masse atomique de ${element.symbol} ?`, `What is the atomic mass of ${element.symbol}?`),
        `${mass} u`,
        shuffle(realElements().filter((item) => item.number !== element.number)).slice(0, 3).map((item) => `${getDetail(item.number)?.level2_atomic?.mass?.highSchool ?? '—'} u`),
        tr(`${getLocalizedName(element, locale)} : ${mass} u (valeur lycée).`, `${getLocalizedName(element, locale)}: ${mass} u (high-school value).`));
    }
    const group = detail?.level1_basic?.group;
    return makeQuestion(`t${index}`, topic,
      tr(`Quel est le groupe de ${element.symbol} ?`, `Which group does ${element.symbol} belong to?`),
      String(group ?? '—'), ['1', '2', '13', '18'].filter((value) => value !== String(group ?? '')),
      tr(`${getLocalizedName(element, locale)} appartient au groupe ${group ?? 'inconnu'}.`, `${getLocalizedName(element, locale)} belongs to group ${group ?? 'unknown'}.`));
  }

  if (topic === 'Familles') {
    const element = pick(realElements().filter((item) => FAMILIES[item.category]));
    const family = FAMILIES[element.category];
    return makeQuestion(`f${index}`, topic,
      tr(`À quelle famille appartient ${element.symbol} ?`, `Which family does ${element.symbol} belong to?`),
      tr(family.fr, family.en),
      shuffle(Object.values(FAMILIES).filter((item) => item !== family)).slice(0, 3).map((item) => tr(item.fr, item.en)),
      tr(`${getLocalizedName(element, locale)} est classé parmi les ${family.fr.toLowerCase()}s.`, `${getLocalizedName(element, locale)} is classified as ${family.en.toLowerCase()}.`));
  }

  if (topic === 'Structure') {
    const element = pick(realElements());
    const detail = getDetail(element.number);
    const mode = Math.floor(Math.random() * 4);
    if (mode === 0) {
      const configuration = detail?.level3_properties?.electronic?.configuration ?? '—';
      return makeQuestion(`st${index}`, topic,
        tr(`Configuration électronique de ${element.symbol} ?`, `Electron configuration of ${element.symbol}?`),
        configuration,
        shuffle(realElements().filter((item) => item.number !== element.number)).slice(0, 3).map((item) => getDetail(item.number)?.level3_properties?.electronic?.configuration ?? '—'),
        `${element.symbol} (Z=${element.number}) : ${configuration}.`);
    }
    if (mode === 1) {
      return makeQuestion(`st${index}`, topic,
        tr(`Combien de protons dans un atome neutre de ${element.symbol} ?`, `How many protons in a neutral atom of ${element.symbol}?`),
        String(element.number),
        shuffle([element.number - 2, element.number - 1, element.number + 1, element.number + 2].filter((value) => value > 0).map(String)).slice(0, 3),
        tr(`Le numéro atomique Z = ${element.number} donne le nombre de protons.`, `Atomic number Z = ${element.number} gives the proton count.`));
    }
    const massRaw = detail?.level2_atomic?.mass?.highSchool;
    const neutrons = massRaw ? Math.max(0, Math.round(parseFloat(massRaw.replace(',', '.'))) - element.number) : element.number;
    if (mode === 2) {
      return makeQuestion(`st${index}`, topic,
        tr(`Nombre de neutrons de ${element.symbol} (isotope le plus courant) ?`, `Neutron count of ${element.symbol} (most common isotope)?`),
        String(neutrons),
        shuffle([neutrons - 1, neutrons + 1, neutrons + 2, element.number].filter((value) => value >= 0).map(String)).slice(0, 3),
        tr(`A − Z = ${massRaw ?? '—'} − ${element.number} ≈ ${neutrons}.`, `A − Z = ${massRaw ?? '—'} − ${element.number} ≈ ${neutrons}.`));
    }
    const phase = detail?.level1_basic?.phaseAtSTP ?? '—';
    const labels: Record<string, Bilingual> = { Gas: { fr: 'Gaz', en: 'Gas' }, Solid: { fr: 'Solide', en: 'Solid' }, Liquid: { fr: 'Liquide', en: 'Liquid' } };
    return makeQuestion(`st${index}`, topic,
      tr(`État de ${element.symbol} aux conditions normales ?`, `State of ${element.symbol} at standard conditions?`),
      labels[phase] ? tr(labels[phase].fr, labels[phase].en) : '—',
      ['Gas', 'Solid', 'Liquid'].filter((value) => value !== phase).map((value) => tr(labels[value].fr, labels[value].en)),
      tr(`${getLocalizedName(element, locale)} est ${labels[phase]?.fr ?? '—'} dans les conditions normales.`, `${getLocalizedName(element, locale)} is ${labels[phase]?.en ?? '—'} at standard conditions.`));
  }

  if (topic === 'Ions') {
    const ion = pick(ionsReference);
    const charge = chargeOf(ion);
    if (Math.random() > 0.45) {
      const answer = charge === 0 ? tr('neutre', 'neutral') : `${charge > 0 ? '+' : ''}${charge}`;
      return makeQuestion(`i${index}`, topic,
        tr(`Quelle est la charge de l’ion ${ion.f} ?`, `What is the charge of ion ${ion.f}?`),
        answer, ['+1', '-1', '+2', '-2', '+3', '-3'].filter((value) => value !== answer),
        `${ionDisplayName(ion, locale)} : ${ion.e}`);
    }
    const tokens = ion.e.split(/\s+/).filter(Boolean);
    return makeQuestion(`i${index}`, topic,
      tr(`Compléter l’équation : ${ion.e}`, `Complete the equation: ${ion.e}`),
      tokens[tokens.length - 1],
      shuffle(ionsReference.filter((item) => item.f !== ion.f)).slice(0, 3).map((item) => item.f),
      `${ionDisplayName(ion, locale)} : ${ion.e}`);
  }

  if (topic === 'Équations') {
    const item = pick(EQUATION_CASES);
    return makeQuestion(`e${index}`, topic, tr(item.prompt.fr, item.prompt.en), item.correct, item.wrong, tr(item.why.fr, item.why.en));
  }

  if (topic === 'Masse molaire') {
    const formula = pick(MASS_FORMULAS);
    const mass = formulaMass(parseFormula(formula));
    const answer = mass.toFixed(1).replace('.', ',');
    const display = formula.replace(/([A-Za-z\)])(\d)/g, (_, atom: string, digit: string) => `${atom}${'₀₁₂₃₄₅₆₇₈₉'[Number(digit)]}`);
    return makeQuestion(`m${index}`, topic,
      tr(`Masse molaire de ${display} ?`, `Molar mass of ${display}?`),
      answer,
      [mass - 18, mass + 16, mass / 2, mass + 32].filter((value) => value > 0).map((value) => value.toFixed(1).replace('.', ',')),
      tr(`Somme des masses atomiques : ${answer} g/mol.`, `Sum of atomic masses: ${answer} g/mol.`));
  }

  const item = pick(SOLUBILITY_CASES);
  return makeQuestion(`s${index}`, topic,
    tr(`${item.pair} : le sel formé est…`, `${item.pair}: the salt formed is…`),
    tr(item.answer.fr, item.answer.en), item.distractors.map((value) => tr(value.fr, value.en)),
    tr(item.why.fr, item.why.en));
}

export function buildQuiz(count = 10, topics: QuizTopic[] = [...QUIZ_TOPICS], locale: Locale = 'fr'): QuizQuestion[] {
  const plan = shuffle([...topics, ...topics, ...topics]);
  return Array.from({ length: count }, (_, index) => buildOne(index, plan[index % plan.length], locale));
}
