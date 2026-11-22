/**
 * Référentiel d'ions enseignés (lycée → université), avec l'équation officielle
 * de formation ou de libération en solution aqueuse.
 * f = formule Unicode (indices/exposants), n = nom, e = équation, l = niveau, k = famille.
 */
export type IonKind = 'cation' | 'anion' | 'polycation' | 'oxoanion' | 'organic';
export type IonLevel = 'L' | 'U';

export interface IonReference {
  f: string;
  n: string;
  e: string;
  l: IonLevel;
  k: IonKind;
}

const C = (f: string, n: string, e: string, l: IonLevel = 'L'): IonReference => ({ f, n, e, l, k: 'cation' });
const A = (f: string, n: string, e: string, l: IonLevel = 'L'): IonReference => ({ f, n, e, l, k: 'anion' });
const P = (f: string, n: string, e: string, l: IonLevel = 'U'): IonReference => ({ f, n, e, l, k: 'polycation' });
const O = (f: string, n: string, e: string, l: IonLevel = 'L'): IonReference => ({ f, n, e, l, k: 'oxoanion' });
const R = (f: string, n: string, e: string, l: IonLevel = 'U'): IonReference => ({ f, n, e, l, k: 'organic' });

export const ionsReference: IonReference[] = [
  // Cations monoatomiques — oxydation
  C('H⁺', 'Ion hydrogène (proton)', 'H ⟶ H⁺ + e⁻'),
  C('Li⁺', 'Ion lithium', 'Li ⟶ Li⁺ + e⁻'),
  C('Na⁺', 'Ion sodium', 'Na ⟶ Na⁺ + e⁻'),
  C('K⁺', 'Ion potassium', 'K ⟶ K⁺ + e⁻'),
  C('Rb⁺', 'Ion rubidium', 'Rb ⟶ Rb⁺ + e⁻', 'U'),
  C('Cs⁺', 'Ion césium', 'Cs ⟶ Cs⁺ + e⁻', 'U'),
  C('Ag⁺', 'Ion argent(I)', 'Ag ⟶ Ag⁺ + e⁻'),
  C('Cu⁺', 'Ion cuivre(I)', 'Cu ⟶ Cu⁺ + e⁻', 'U'),
  C('Au⁺', 'Ion or(I)', 'Au ⟶ Au⁺ + e⁻', 'U'),
  C('Tl⁺', 'Ion thallium(I)', 'Tl ⟶ Tl⁺ + e⁻', 'U'),
  C('Be²⁺', 'Ion béryllium', 'Be ⟶ Be²⁺ + 2 e⁻', 'U'),
  C('Mg²⁺', 'Ion magnésium', 'Mg ⟶ Mg²⁺ + 2 e⁻'),
  C('Ca²⁺', 'Ion calcium', 'Ca ⟶ Ca²⁺ + 2 e⁻'),
  C('Sr²⁺', 'Ion strontium', 'Sr ⟶ Sr²⁺ + 2 e⁻', 'U'),
  C('Ba²⁺', 'Ion baryum', 'Ba ⟶ Ba²⁺ + 2 e⁻'),
  C('Zn²⁺', 'Ion zinc', 'Zn ⟶ Zn²⁺ + 2 e⁻'),
  C('Cd²⁺', 'Ion cadmium', 'Cd ⟶ Cd²⁺ + 2 e⁻', 'U'),
  C('Hg²⁺', 'Ion mercure(II)', 'Hg ⟶ Hg²⁺ + 2 e⁻', 'U'),
  C('Cu²⁺', 'Ion cuivre(II)', 'Cu ⟶ Cu²⁺ + 2 e⁻'),
  C('Fe²⁺', 'Ion fer(II)', 'Fe ⟶ Fe²⁺ + 2 e⁻'),
  C('Co²⁺', 'Ion cobalt(II)', 'Co ⟶ Co²⁺ + 2 e⁻', 'U'),
  C('Ni²⁺', 'Ion nickel(II)', 'Ni ⟶ Ni²⁺ + 2 e⁻', 'U'),
  C('Mn²⁺', 'Ion manganèse(II)', 'Mn ⟶ Mn²⁺ + 2 e⁻'),
  C('Cr²⁺', 'Ion chrome(II)', 'Cr ⟶ Cr²⁺ + 2 e⁻', 'U'),
  C('Pb²⁺', 'Ion plomb(II)', 'Pb ⟶ Pb²⁺ + 2 e⁻'),
  C('Sn²⁺', 'Ion étain(II)', 'Sn ⟶ Sn²⁺ + 2 e⁻'),
  C('Al³⁺', 'Ion aluminium', 'Al ⟶ Al³⁺ + 3 e⁻'),
  C('Ga³⁺', 'Ion gallium', 'Ga ⟶ Ga³⁺ + 3 e⁻', 'U'),
  C('In³⁺', 'Ion indium', 'In ⟶ In³⁺ + 3 e⁻', 'U'),
  C('Fe³⁺', 'Ion fer(III)', 'Fe ⟶ Fe³⁺ + 3 e⁻'),
  C('Cr³⁺', 'Ion chrome(III)', 'Cr ⟶ Cr³⁺ + 3 e⁻'),
  C('Co³⁺', 'Ion cobalt(III)', 'Co ⟶ Co³⁺ + 3 e⁻', 'U'),
  C('Au³⁺', 'Ion or(III)', 'Au ⟶ Au³⁺ + 3 e⁻', 'U'),
  C('Bi³⁺', 'Ion bismuth(III)', 'Bi ⟶ Bi³⁺ + 3 e⁻', 'U'),
  C('Ti³⁺', 'Ion titane(III)', 'Ti ⟶ Ti³⁺ + 3 e⁻', 'U'),
  C('Sc³⁺', 'Ion scandium', 'Sc ⟶ Sc³⁺ + 3 e⁻', 'U'),
  C('Y³⁺', 'Ion yttrium', 'Y ⟶ Y³⁺ + 3 e⁻', 'U'),
  C('La³⁺', 'Ion lanthane', 'La ⟶ La³⁺ + 3 e⁻', 'U'),
  C('Ce³⁺', 'Ion cérium(III)', 'Ce ⟶ Ce³⁺ + 3 e⁻', 'U'),
  C('Sn⁴⁺', 'Ion étain(IV)', 'Sn ⟶ Sn⁴⁺ + 4 e⁻', 'U'),
  C('Pb⁴⁺', 'Ion plomb(IV)', 'Pb ⟶ Pb⁴⁺ + 4 e⁻', 'U'),
  C('Ce⁴⁺', 'Ion cérium(IV)', 'Ce ⟶ Ce⁴⁺ + 4 e⁻', 'U'),

  // Anions monoatomiques — réduction
  A('H⁻', 'Ion hydrure', 'H₂ + 2 e⁻ ⟶ 2 H⁻', 'U'),
  A('F⁻', 'Ion fluorure', 'F₂ + 2 e⁻ ⟶ 2 F⁻'),
  A('Cl⁻', 'Ion chlorure', 'Cl₂ + 2 e⁻ ⟶ 2 Cl⁻'),
  A('Br⁻', 'Ion bromure', 'Br₂ + 2 e⁻ ⟶ 2 Br⁻'),
  A('I⁻', 'Ion iodure', 'I₂ + 2 e⁻ ⟶ 2 I⁻'),
  A('At⁻', 'Ion astate', 'At₂ + 2 e⁻ ⟶ 2 At⁻', 'U'),
  A('O²⁻', 'Ion oxyde', 'O₂ + 4 e⁻ ⟶ 2 O²⁻'),
  A('S²⁻', 'Ion sulfure', 'S + 2 e⁻ ⟶ S²⁻'),
  A('Se²⁻', 'Ion séléniure', 'Se + 2 e⁻ ⟶ Se²⁻', 'U'),
  A('Te²⁻', 'Ion tellurure', 'Te + 2 e⁻ ⟶ Te²⁻', 'U'),
  A('N³⁻', 'Ion nitrure', 'N₂ + 6 e⁻ ⟶ 2 N³⁻', 'U'),
  A('P³⁻', 'Ion phosphure', 'P + 3 e⁻ ⟶ P³⁻', 'U'),
  A('As³⁻', 'Ion arséniure', 'As + 3 e⁻ ⟶ As³⁻', 'U'),
  A('C⁴⁻', 'Ion carbure', 'C + 4 e⁻ ⟶ C⁴⁻', 'U'),
  A('Si⁴⁻', 'Ion siliciure', 'Si + 4 e⁻ ⟶ Si⁴⁻', 'U'),

  // Cations polyatomiques
  P('H₃O⁺', 'Ion oxonium (hydronium)', 'HCl + H₂O ⟶ H₃O⁺ + Cl⁻', 'L'),
  P('NH₄⁺', 'Ion ammonium', 'NH₃ + H₂O ⇌ NH₄⁺ + OH⁻', 'L'),
  P('N₂H₅⁺', 'Ion hydrazinium', 'N₂H₄ + H₂O ⇌ N₂H₅⁺ + OH⁻'),
  P('PH₄⁺', 'Ion phosphonium', 'PH₄I ⟶(H₂O) PH₄⁺ + I⁻'),
  P('Hg₂²⁺', 'Ion mercure(I)', 'Hg₂(NO₃)₂ ⟶(H₂O) Hg₂²⁺ + 2 NO₃⁻'),
  P('NO₂⁺', 'Ion nitronium', 'HNO₃ + H₂SO₄ ⇌ NO₂⁺ + HSO₄⁻ + H₂O'),
  P('NO⁺', 'Ion nitrosonium', 'HNO₂ + H⁺ ⇌ NO⁺ + H₂O'),
  P('UO₂²⁺', 'Ion uranyle', 'UO₂(NO₃)₂ ⟶(H₂O) UO₂²⁺ + 2 NO₃⁻'),
  P('VO²⁺', 'Ion vanadyle', 'VOSO₄ ⟶(H₂O) VO²⁺ + SO₄²⁻'),

  // Oxoanions et dérivés acides
  O('OH⁻', 'Ion hydroxyde', 'NaOH ⟶(H₂O) Na⁺ + OH⁻'),
  O('O₂²⁻', 'Ion peroxyde', 'Na₂O₂ ⟶(H₂O) 2 Na⁺ + O₂²⁻', 'U'),
  O('O₂⁻', 'Ion superoxyde', 'KO₂ ⟶(H₂O) K⁺ + O₂⁻', 'U'),
  O('NO₃⁻', 'Ion nitrate', 'HNO₃ + H₂O ⟶ H₃O⁺ + NO₃⁻'),
  O('NO₂⁻', 'Ion nitrite', 'HNO₂ + H₂O ⇌ H₃O⁺ + NO₂⁻'),
  O('SO₄²⁻', 'Ion sulfate', 'H₂SO₄ + 2 H₂O ⟶ 2 H₃O⁺ + SO₄²⁻'),
  O('HSO₄⁻', 'Ion hydrogénosulfate', 'H₂SO₄ + H₂O ⟶ H₃O⁺ + HSO₄⁻'),
  O('SO₃²⁻', 'Ion sulfite', 'H₂SO₃ + 2 H₂O ⇌ 2 H₃O⁺ + SO₃²⁻'),
  O('HSO₃⁻', 'Ion hydrogénosulfite', 'H₂SO₃ + H₂O ⇌ H₃O⁺ + HSO₃⁻', 'U'),
  O('S₂O₃²⁻', 'Ion thiosulfate', 'Na₂S₂O₃ ⟶(H₂O) 2 Na⁺ + S₂O₃²⁻'),
  O('S₂O₈²⁻', 'Ion peroxodisulfate', 'K₂S₂O₈ ⟶(H₂O) 2 K⁺ + S₂O₈²⁻'),
  O('S₄O₆²⁻', 'Ion tétrathionate', 'Na₂S₄O₆ ⟶(H₂O) 2 Na⁺ + S₄O₆²⁻'),
  O('CO₃²⁻', 'Ion carbonate', 'Na₂CO₃ ⟶(H₂O) 2 Na⁺ + CO₃²⁻'),
  O('HCO₃⁻', 'Ion hydrogénocarbonate', 'NaHCO₃ ⟶(H₂O) Na⁺ + HCO₃⁻'),
  O('PO₄³⁻', 'Ion phosphate', 'Na₃PO₄ ⟶(H₂O) 3 Na⁺ + PO₄³⁻'),
  O('HPO₄²⁻', 'Ion hydrogénophosphate', 'H₂PO₄⁻ + H₂O ⇌ H₃O⁺ + HPO₄²⁻'),
  O('H₂PO₄⁻', 'Ion dihydrogénophosphate', 'H₃PO₄ + H₂O ⇌ H₃O⁺ + H₂PO₄⁻'),
  O('HPO₃²⁻', 'Ion phosphite', 'H₃PO₃ + 2 H₂O ⇌ 2 H₃O⁺ + HPO₃²⁻', 'U'),
  O('H₂PO₂⁻', 'Ion hypophosphite', 'H₃PO₂ + H₂O ⇌ H₃O⁺ + H₂PO₂⁻', 'U'),
  O('P₂O₇⁴⁻', 'Ion pyrophosphate', 'Na₄P₂O₇ ⟶(H₂O) 4 Na⁺ + P₂O₇⁴⁻', 'U'),
  O('ClO⁻', 'Ion hypochlorite', 'NaClO ⟶(H₂O) Na⁺ + ClO⁻'),
  O('ClO₂⁻', 'Ion chlorite', 'HClO₂ + H₂O ⇌ H₃O⁺ + ClO₂⁻', 'U'),
  O('ClO₃⁻', 'Ion chlorate', 'KClO₃ ⟶(H₂O) K⁺ + ClO₃⁻'),
  O('ClO₄⁻', 'Ion perchlorate', 'HClO₄ + H₂O ⟶ H₃O⁺ + ClO₄⁻', 'U'),
  O('BrO⁻', 'Ion hypobromite', 'NaBrO ⟶(H₂O) Na⁺ + BrO⁻', 'U'),
  O('BrO₃⁻', 'Ion bromate', 'KBrO₃ ⟶(H₂O) K⁺ + BrO₃⁻', 'U'),
  O('BrO₄⁻', 'Ion perbromate', 'HBrO₄ + H₂O ⟶ H₃O⁺ + BrO₄⁻', 'U'),
  O('IO⁻', 'Ion hypoiodite', 'NaIO ⟶(H₂O) Na⁺ + IO⁻', 'U'),
  O('IO₃⁻', 'Ion iodate', 'KIO₃ ⟶(H₂O) K⁺ + IO₃⁻'),
  O('IO₄⁻', 'Ion periodate', 'NaIO₄ ⟶(H₂O) Na⁺ + IO₄⁻', 'U'),
  O('MnO₄⁻', 'Ion permanganate', 'KMnO₄ ⟶(H₂O) K⁺ + MnO₄⁻'),
  O('MnO₄²⁻', 'Ion manganate', 'K₂MnO₄ ⟶(H₂O) 2 K⁺ + MnO₄²⁻', 'U'),
  O('CrO₄²⁻', 'Ion chromate', 'K₂CrO₄ ⟶(H₂O) 2 K⁺ + CrO₄²⁻'),
  O('Cr₂O₇²⁻', 'Ion dichromate', 'K₂Cr₂O₇ ⟶(H₂O) 2 K⁺ + Cr₂O₇²⁻'),
  O('BO₃³⁻', 'Ion borate', 'Na₃BO₃ ⟶(H₂O) 3 Na⁺ + BO₃³⁻', 'U'),
  O('B₄O₇²⁻', 'Ion tétraborate', 'Na₂B₄O₇ ⟶(H₂O) 2 Na⁺ + B₄O₇²⁻', 'U'),
  O('SiO₄⁴⁻', 'Ion silicate (orthosilicate)', 'Na₄SiO₄ ⟶(H₂O) 4 Na⁺ + SiO₄⁴⁻', 'U'),
  O('SiO₃²⁻', 'Ion métasilicate', 'Na₂SiO₃ ⟶(H₂O) 2 Na⁺ + SiO₃²⁻', 'U'),
  O('AsO₄³⁻', 'Ion arséniate', 'Na₃AsO₄ ⟶(H₂O) 3 Na⁺ + AsO₄³⁻', 'U'),
  O('AsO₃³⁻', 'Ion arsénite', 'Na₃AsO₃ ⟶(H₂O) 3 Na⁺ + AsO₃³⁻', 'U'),
  O('SeO₄²⁻', 'Ion séléniate', 'H₂SeO₄ + 2 H₂O ⟶ 2 H₃O⁺ + SeO₄²⁻', 'U'),
  O('Al(OH)₄⁻', 'Ion aluminate', 'Al(OH)₃ + OH⁻ ⇌ Al(OH)₄⁻', 'U'),
  O('Zn(OH)₄²⁻', 'Ion zincate', 'Zn(OH)₂ + 2 OH⁻ ⇌ Zn(OH)₄²⁻', 'U'),

  // Anions organiques, pseudohalogénures et complexes
  R('CN⁻', 'Ion cyanure', 'KCN ⟶(H₂O) K⁺ + CN⁻', 'L'),
  R('OCN⁻', 'Ion cyanate', 'KOCN ⟶(H₂O) K⁺ + OCN⁻'),
  R('SCN⁻', 'Ion thiocyanate', 'KSCN ⟶(H₂O) K⁺ + SCN⁻', 'L'),
  R('N₃⁻', 'Ion azoture (azide)', 'NaN₃ ⟶(H₂O) Na⁺ + N₃⁻'),
  R('HCOO⁻', 'Ion méthanoate (formiate)', 'HCOOH + H₂O ⇌ H₃O⁺ + HCOO⁻', 'L'),
  R('CH₃COO⁻', 'Ion éthanoate (acétate)', 'CH₃COOH + H₂O ⇌ H₃O⁺ + CH₃COO⁻', 'L'),
  R('C₂H₅COO⁻', 'Ion propanoate', 'C₂H₅COOH + H₂O ⇌ H₃O⁺ + C₂H₅COO⁻', 'L'),
  R('C₆H₅COO⁻', 'Ion benzoate', 'C₆H₅COOH + H₂O ⇌ H₃O⁺ + C₆H₅COO⁻', 'L'),
  R('C₂O₄²⁻', 'Ion oxalate', 'Na₂C₂O₄ ⟶(H₂O) 2 Na⁺ + C₂O₄²⁻', 'L'),
  R('HC₂O₄⁻', 'Ion hydrogénooxalate', 'H₂C₂O₄ + H₂O ⇌ H₃O⁺ + HC₂O₄⁻'),
  R('C₆H₅O₇³⁻', 'Ion citrate', 'Na₃C₆H₅O₇ ⟶(H₂O) 3 Na⁺ + C₆H₅O₇³⁻', 'L'),
  R('C₄H₄O₆²⁻', 'Ion tartrate', 'K₂C₄H₄O₆ ⟶(H₂O) 2 K⁺ + C₄H₄O₆²⁻'),
  R('C₃H₅O₃⁻', 'Ion lactate', 'C₃H₆O₃ + H₂O ⇌ H₃O⁺ + C₃H₅O₃⁻', 'L'),
  R('C₆H₅O⁻', 'Ion phénolate', 'C₆H₅OH + OH⁻ ⇌ C₆H₅O⁻ + H₂O'),
  R('CH₃O⁻', 'Ion méthanolate', 'CH₃ONa ⟶ Na⁺ + CH₃O⁻'),
  R('C₂H₅O⁻', 'Ion éthanolate', 'C₂H₅ONa ⟶ Na⁺ + C₂H₅O⁻'),
  R('NH₂⁻', 'Ion amidure', 'NaNH₂ ⟶ Na⁺ + NH₂⁻'),
  R('BH₄⁻', 'Ion borohydrure', 'NaBH₄ ⟶ Na⁺ + BH₄⁻'),
  R('AlH₄⁻', 'Ion tétrahydroaluminate', 'LiAlH₄ ⟶ Li⁺ + AlH₄⁻'),
  R('[Fe(CN)₆]⁴⁻', 'Ion hexacyanoferrate(II)', 'K₄[Fe(CN)₆] ⟶(H₂O) 4 K⁺ + [Fe(CN)₆]⁴⁻'),
  R('[Fe(CN)₆]³⁻', 'Ion hexacyanoferrate(III)', 'K₃[Fe(CN)₆] ⟶(H₂O) 3 K⁺ + [Fe(CN)₆]³⁻'),
  R('[AuCl₄]⁻', 'Ion tétrachloroaurate(III)', 'HAuCl₄ + H₂O ⟶ H₃O⁺ + [AuCl₄]⁻'),
  R('[SiF₆]²⁻', 'Ion hexafluorosilicate', 'H₂SiF₆ + 2 H₂O ⟶ 2 H₃O⁺ + [SiF₆]²⁻'),
];

const SUPERSCRIPTS = /[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g;

/** Formule sans charge, pour rapprocher une fiche du référentiel. */
export function baseFormula(formula: string): string {
  return formula.replace(SUPERSCRIPTS, '').replace(/\s/g, '');
}

export function findIonReference(formula: string): IonReference | undefined {
  const base = baseFormula(formula);
  return ionsReference.find((item) => baseFormula(item.f) === base);
}

/** Vocabulaire français → anglais pour les noms d'ions du référentiel. */
const EN_WORDS: Record<string, string> = {
  hydrogène: 'hydrogen', lithium: 'lithium', sodium: 'sodium', potassium: 'potassium',
  rubidium: 'rubidium', césium: 'cesium', argent: 'silver', cuivre: 'copper', or: 'gold',
  thallium: 'thallium', béryllium: 'beryllium', magnésium: 'magnesium', calcium: 'calcium',
  strontium: 'strontium', baryum: 'barium', zinc: 'zinc', cadmium: 'cadmium', mercure: 'mercury',
  fer: 'iron', cobalt: 'cobalt', nickel: 'nickel', manganèse: 'manganese', chrome: 'chromium',
  plomb: 'lead', étain: 'tin', aluminium: 'aluminum', gallium: 'gallium', indium: 'indium',
  bismuth: 'bismuth', titane: 'titanium', scandium: 'scandium', yttrium: 'yttrium',
  lanthane: 'lanthanum', cérium: 'cerium', oxyde: 'oxide', sulfure: 'sulfide',
  séléniure: 'selenide', tellurure: 'telluride', nitrure: 'nitride', phosphure: 'phosphide',
  arséniure: 'arsenide', carbure: 'carbide', siliciure: 'silicide', hydrure: 'hydride',
  fluorure: 'fluoride', chlorure: 'chloride', bromure: 'bromide', iodure: 'iodide',
  astate: 'astatide', hydroxyde: 'hydroxide', peroxyde: 'peroxide', superoxyde: 'superoxide',
  nitrate: 'nitrate', nitrite: 'nitrite', sulfate: 'sulfate', hydrogénosulfate: 'hydrogen sulfate',
  sulfite: 'sulfite', hydrogénosulfite: 'hydrogen sulfite', thiosulfate: 'thiosulfate',
  peroxodisulfate: 'peroxodisulfate', tétrathionate: 'tetrathionate', carbonate: 'carbonate',
  hydrogénocarbonate: 'hydrogen carbonate', phosphate: 'phosphate',
  hydrogénophosphate: 'hydrogen phosphate', dihydrogénophosphate: 'dihydrogen phosphate',
  phosphite: 'phosphite', hypophosphite: 'hypophosphite', pyrophosphate: 'pyrophosphate',
  hypochlorite: 'hypochlorite', chlorite: 'chlorite', chlorate: 'chlorate', perchlorate: 'perchlorate',
  hypobromite: 'hypobromite', bromate: 'bromate', perbromate: 'perbromate', hypoiodite: 'hypoiodite',
  iodate: 'iodate', periodate: 'periodate', permanganate: 'permanganate', manganate: 'manganate',
  chromate: 'chromate', dichromate: 'dichromate', borate: 'borate', tétraborate: 'tetraborate',
  silicate: 'silicate', métasilicate: 'metasilicate', arséniate: 'arsenate', arsénite: 'arsenite',
  séléniate: 'selenate', aluminate: 'aluminate', zincate: 'zincate', cyanure: 'cyanide',
  cyanate: 'cyanate', thiocyanate: 'thiocyanate', azoture: 'azide', méthanoate: 'methanoate',
  formiate: 'formate', éthanoate: 'ethanoate', acétate: 'acetate', propanoate: 'propanoate',
  benzoate: 'benzoate', oxalate: 'oxalate', hydrogénooxalate: 'hydrogen oxalate', citrate: 'citrate',
  tartrate: 'tartrate', lactate: 'lactate', phénolate: 'phenoxide', méthanolate: 'methoxide',
  éthanolate: 'ethoxide', amidure: 'amide', borohydrure: 'borohydride',
  tétrahydroaluminate: 'tetrahydroaluminate', hexacyanoferrate: 'hexacyanoferrate',
  tétrachloroaurate: 'tetrachloroaurate', hexafluorosilicate: 'hexafluorosilicate',
  oxonium: 'hydronium', ammonium: 'ammonium', hydrazinium: 'hydrazinium',
  phosphonium: 'phosphonium', nitronium: 'nitronium', nitrosonium: 'nitrosonium',
  uranyle: 'uranyl', vanadyle: 'vanadyl', proton: 'proton',
};

/** Nom lisible d'un ion dans la langue demandée. */
export function ionDisplayName(ion: IonReference, locale: 'fr' | 'en'): string {
  const base = ion.n.replace(/^Ion\s+/, '').toLowerCase();
  if (locale === 'fr') return base;
  return base
    .split(' ')
    .map((word) => {
      const match = word.match(/^([^()]+)(\(.*\))?$/);
      if (!match) return word;
      const root = EN_WORDS[match[1]] ?? match[1];
      return `${root}${match[2] ?? ''}`;
    })
    .join(' ');
}
