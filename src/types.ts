export interface BaseElement {
  number: number;
  symbol: string;
  name: string;
  row: number;
  column: number;
  category: string;
  series?: string;
}

export interface ElementMass {
  highSchool: string | null;
  universityConventional: string | null;
  universityInterval: string | null;
}

export interface ElementDetail {
  level1_basic?: {
    type?: string;
    group?: number | null;
    period?: string;
    phaseAtSTP?: string;
    valenceElectrons?: string;
    commonIons?: string;
    commonOxidationStates?: string;
    [key: string]: unknown;
  };
  level2_atomic?: {
    mass?: ElementMass;
    protons?: number;
    electronsNeutral?: number;
    naturalIsotopes?: { name: string; neutron: string; percent: string }[];
  };
  level3_properties?: {
    electronic?: {
      configuration?: string;
      oxidationStates?: { common?: string[]; possible?: string[] };
    };
    physical?: Record<string, string | number | null>;
  };
  level4_history_stse?: {
    history?: { discoveryYear?: string; discoveredBy?: string; namedBy?: string };
    stseContext?: string[];
    commonUses?: string[];
    hazards?: string[];
  };
  chemistryNotes?: string;
  biologicalRole?: string;
}

export type Locale = 'fr' | 'en';
