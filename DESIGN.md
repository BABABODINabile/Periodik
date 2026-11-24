# Périodik — système visuel

Référence : maquette « Périodique — app mobile » (9 écrans, 390 × 844).

## Couleurs

| Rôle | Hex |
|---|---|
| Fond / surface | `#F1EFE8` |
| Surface claire | `#FAF9F4` |
| Encre (texte, cartes noires) | `#15140F` |
| Texte secondaire | `#55524A` |
| Texte tertiaire | `#8A8678` |
| Bordure | `#D5D1C4` |
| Bordure forte / neutre | `#B9B4A4` |
| Accent (nav active, CTA) | `#C53A16` |
| Saumon (valeurs 3D, actions) | `#F2A58C` |

Catégories : alcalins `#F1C6B2`, alcalino-terreux `#E8D88C`, transition `#BCD1D8`,
post-transition `#CFDDB4`, non-métaux `#CFDDB4`, halogènes `#F2A58C`, gaz nobles `#D8D2EA`,
lanthanides `#F1C6B2`, actinides `#E8C6D4`.

## Typographie

- **Space Grotesk** 400 / 500 / 700 — titres, corps, symboles.
- **JetBrains Mono** 400 / 500 — eyebrow, numéros, métadonnées, valeurs.
- Titres 30 px, letter-spacing −0,02 ; eyebrow 12 px, letter-spacing 0,08 em, majuscules.

## Structure

- En-tête : padding haut 56 px (iOS), eyebrow puis titre 30 px.
- Recherche : 44 px de haut, rayon 10, bordure `#8A8678`.
- Puces filtres : 34 px de haut, rayon 17.
- Cellules : 35 × 46 px, rayon 3, numéro 9 px mono, symbole 17 px gras.
- Cartes noires : rayon 12–16, texte saumon en mono pour les actions.
- Navigation basse : 84 px, bordure supérieure `#D5D1C4`, icône 22 px + libellé 12 px ; onglet actif en `#C53A16`.

## Principes

- La couleur est l'information : elle vient des catégories chimiques, jamais de la décoration.
- Une seule surface sombre à la fois (carte d'atome, carte d'ion, résultat d'outil, CTA).
- Chiffres en monospace, toujours alignés à droite dans les tableaux.
- Aucune ombre portée : la hiérarchie passe par le fond, la bordure et le poids de police.

## Représentation de l'atome

Deux vues cohabitent, sélectionnables juste au-dessus de la carte : **Schéma** (2D, par défaut) et **Spatial** (3D).

### Vue Schéma (2D)

- Diagramme de Bohr : anneaux concentriques, lettres de couche K–Q, électrons répartis sur chaque anneau, noyau au centre avec le symbole.
- Statique et lisible : sert de référence pédagogique, sans mouvement parasite.

### Vue Spatiale (3D)

- Cadrage automatique de la caméra selon le rayon de la couche externe et le ratio de la carte : les 7 couches restent visibles, de H à Og.
- Chaque couche possède un plan orbital incliné propre (Euler x/y/z) : les ellipses se croisent sans se superposer.
- Électrons et traînées sont rendus par `instancedMesh` (une seule draw call chacun), avec nombre de traînées réduit sur les atomes lourds.
- Le noyau est compact (distribution de Fibonacci + culling des nucléons internes) et entouré d'un halo translucide.
- Bouton de réinitialisation de la vue en haut à droite ; `réduire les animations` fige la rotation et l'intro.
- Aucun texte superposé à la scène : symboles en haut à gauche, métadonnées dans le pied de carte.

## Responsivité et accessibilité

- Largeur utile plafonnée à 560 px et centrée : sur tablette/web, les écrans ne s'étirent pas ; la grille reste dans un conteneur à défilement horizontal.
- Éléments interactifs : `accessibilityRole`, `accessibilityState` et `accessibilityLabel` explicites ; zones tactiles élargies via `hitSlop` (cibles ≥ 40 px).
- Schéma 2D et vue 3D exposés comme images accessibles avec résumé du nombre de couches et des électrons ; étiquettes de couches décoratives masquées aux lecteurs d'écran.
- Contraste renforcé sur le texte tertiaire (`#6E6A60`) tout en restant dans la palette d'origine.
- `réduire les animations` fige la vue spatiale ; le schéma 2D est statique par construction.
- Les détails d'ions s'ouvrent dans une bottom sheet : poignée, glisser vers le bas pour fermer, croix, tap à l'extérieur et bouton retour Android.
