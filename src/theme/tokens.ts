/** Système visuel Périodik — calqué sur la maquette « Périodique — app mobile ». */
export const colors = {
  paper: '#F1EFE8',
  paperLight: '#FAF9F4',
  ink: '#15140F',
  inkSoft: '#55524A',
  inkFaint: '#6E6A60',
  line: '#D5D1C4',
  lineStrong: '#B9B4A4',
  accent: '#C53A16',
  salmon: '#F2A58C',
  card: '#15140F',
  onCard: '#F1EFE8',
  onCategory: '#15140F',
} as const;

export const categoryColors: Record<string, string> = {
  'Alkali Metal': '#F1C6B2',
  'Alkaline Earth Metal': '#E8D88C',
  'Transition Metal': '#BCD1D8',
  'Post-transition Metal': '#CFDDB4',
  'Metalloid': '#E4D4BC',
  'Other nonmetal': '#CFDDB4',
  'Halogen': '#F2A58C',
  'Noble Gas': '#D8D2EA',
  'Lanthanide': '#F1C6B2',
  'Actinide': '#E8C6D4',
  Unknown: '#D5D1C4',
};

/** Largeur lisible maximale : au-delà, le contenu est centré sur fond papier. */
export const MAX_CONTENT_WIDTH = 560;
/** Le tableau peut s'élargir sur tablette/desktop pour afficher les 18 colonnes. */
export const MAX_TABLE_WIDTH = 980;

export const radii = {
  cell: 3,
  control: 10,
  card: 12,
  pill: 999,
} as const;

export const font = {
  display: 'SpaceGrotesk',
  displayBold: 'SpaceGroteskBold',
  displayMedium: 'SpaceGroteskMedium',
  body: 'SpaceGrotesk',
  bodyBold: 'SpaceGroteskBold',
  mono: 'JetBrainsMono',
  monoMedium: 'JetBrainsMonoMedium',
} as const;
