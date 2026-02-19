/**
 * WZ 2008 Classification Codes with bilingual descriptions
 * Source: Statistisches Bundesamt (German Federal Statistical Office)
 */
export const WZ_CODES: Record<string, { de: string; en: string }> = {
  // Mining and quarrying (Bergbau und Gewinnung von Steinen und Erden)
  '08.12': {
    de: 'Gewinnung von Kies, Sand, Ton und Kaolin',
    en: 'Operation of gravel and sand pits and mining of clay and kaolin',
  },

  // Manufacturing (Verarbeitendes Gewerbe)
  '25.12': {
    de: 'Herstellung von Türen und Fenstern aus Metall',
    en: 'Manufacture of doors and windows of metal',
  },
  '25.61.0': {
    de: 'Oberflächenveredlung und Wärmebehandlung',
    en: 'Treatment and coating of metals',
  },
  '28': {
    de: 'Maschinenbau',
    en: 'Manufacture of machinery and equipment n.e.c.',
  },

  // Construction (Baugewerbe)
  '41.00': {
    de: 'Erschließung, Errichtung und Abbruch von Gebäuden',
    en: 'Construction of residential and non-residential buildings',
  },
  '43.21': {
    de: 'Elektroinstallation',
    en: 'Electrical installation',
  },
  '43.21.0': {
    de: 'Elektroinstallation',
    en: 'Electrical installation',
  },
  '43.22': {
    de: 'Klempnerei, Gas-, Wasser-, Heizungs- sowie Lüftungs- und Klimainstallation',
    en: 'Plumbing, heat and air-conditioning installation',
  },
  '43.22.0': {
    de: 'Klempnerei, Gas-, Wasser-, Heizungs- sowie Lüftungs- und Klimainstallation',
    en: 'Plumbing, heat and air-conditioning installation',
  },
  '43.33': {
    de: 'Fußboden-, Fliesen- und Plattenlegerei, Tapeziererei',
    en: 'Floor and wall covering',
  },
  '43.34': {
    de: 'Maler- und Glasergewerbe',
    en: 'Painting and glazing',
  },
  '43.91': {
    de: 'Dachdeckerei und Zimmerei',
    en: 'Masonry and bricklaying activities',
  },
  '43.99': {
    de: 'Sonstiges spezialisiertes Baugewerbe a. n. g.',
    en: 'Other specialised construction activities n.e.c.',
  },

  // Wholesale and retail trade (Handel)
  '45.11': {
    de: 'Handel mit Kraftwagen mit einem Gesamtgewicht von 3,5 t oder weniger',
    en: 'Sale of cars and light motor vehicles',
  },
  '45.32': {
    de: 'Einzelhandel mit Kraftwagenteilen und -zubehör',
    en: 'Retail trade of motor vehicle parts and accessories',
  },
  '46.38': {
    de: 'Großhandel mit sonstigen Nahrungsmitteln',
    en: 'Wholesale of other food',
  },
  '46.42': {
    de: 'Großhandel mit Bekleidung und Schuhen',
    en: 'Wholesale of clothing and footwear',
  },
  '46.6': {
    de: 'Großhandel mit sonstigen Maschinen, Ausrüstungen und Zubehör',
    en: 'Wholesale of other machinery, equipment and supplies',
  },
  '46.71': {
    de: 'Großhandel mit festen Brennstoffen und Mineralölerzeugnissen',
    en: 'Wholesale of motor vehicles',
  },
  '46.74': {
    de: 'Großhandel mit Metall- und Kunststoffwaren für Bauzwecke sowie Installationsbedarf für Gas, Wasser und Heizung',
    en: 'Wholesale of hardware, plumbing and heating equipment and supplies',
  },
  '46.90': {
    de: 'Großhandel ohne ausgeprägten Schwerpunkt',
    en: 'Non-specialised wholesale trade',
  },
  '47.30.1': {
    de: 'Tankstellen',
    en: 'Retail trade in third-party name of motor fuels, agency petrol stations',
  },
  '47.99.9': {
    de: 'Sonstiger Einzelhandel a. n. g. (nicht in Verkaufsräumen)',
    en: 'Other retail sale not in stores n.e.c.',
  },

  // Transportation and storage (Verkehr und Lagerei)
  '49.41.0': {
    de: 'Güterbeförderung im Straßenverkehr',
    en: 'Freight transport by road',
  },
  '50.10': {
    de: 'Personenbeförderung in der See- und Küstenschifffahrt',
    en: 'Sea and coastal passenger water transport',
  },
  '52.29': {
    de: 'Erbringung von sonstigen Dienstleistungen für den Verkehr',
    en: 'Other transportation support activities',
  },

  // Accommodation and food service (Beherbergung und Gastronomie)
  '55.10': {
    de: 'Hotels, Gasthöfe und Pensionen',
    en: 'Hotels and similar accommodation',
  },
  '56': {
    de: 'Gastronomie',
    en: 'Food and beverage service activities',
  },
  '56.1': {
    de: 'Restaurants, Gaststätten, Imbissstuben, Cafés, Eissalons u. Ä.',
    en: 'Restaurants and mobile food service activities',
  },

  // Information and communication (Information und Kommunikation)
  '62.02': {
    de: 'Erbringung von Beratungsleistungen auf dem Gebiet der Informationstechnologie',
    en: 'Computer consultancy activities',
  },
  '63.1': {
    de: 'Datenverarbeitung, Hosting und damit verbundene Tätigkeiten',
    en: 'Computing infrastructure, data processing, hosting and related activities',
  },

  // Financial and insurance activities (Finanz- und Versicherungsdienstleistungen)
  '66.19': {
    de: 'Sonstige mit Finanzdienstleistungen verbundene Tätigkeiten',
    en: 'Other activities auxiliary to financial services, except insurance and pension funding',
  },

  // Real estate activities (Grundstücks- und Wohnungswesen)
  '68.32': {
    de: 'Verwaltung von Grundstücken, Gebäuden und Wohnungen für Dritte',
    en: 'Other real estate activities on a fee or contract basis',
  },

  // Professional, scientific and technical activities (Freiberufliche, wissenschaftliche und technische Dienstleistungen)
  '69.20': {
    de: 'Wirtschaftsprüfung und Steuerberatung; Buchführung',
    en: 'Accounting, bookkeeping and auditing activities; tax consultancy',
  },
  '70.22.0': {
    de: 'Unternehmensberatung',
    en: 'Business and other management consultancy activities',
  },
  '71.12': {
    de: 'Technische Untersuchung und Beratung',
    en: 'Engineering activities and related technical consultancy',
  },

  // Administrative and support service activities (Sonstige wirtschaftliche Dienstleistungen)
  '80.10': {
    de: 'Private Wach- und Sicherheitsdienste',
    en: 'Private security activities',
  },
  '81.30': {
    de: 'Garten- und Landschaftsbau sowie Erbringung von sonstigen gärtnerischen Dienstleistungen',
    en: 'Landscape service activities',
  },

  // Public administration and defence (Öffentliche Verwaltung, Verteidigung)
  '84.25.0': {
    de: 'Feuerwehren',
    en: 'Fire service activities',
  },

  // Human health and social work activities (Gesundheits- und Sozialwesen)
  '87.30': {
    de: 'Altenheime, Alten- und Behindertenwohnheime',
    en: 'Residential care activities for older persons or persons with physical disabilities',
  },
  '88.10.1': {
    de: 'Soziale Betreuung älterer Menschen und Behinderter',
    en: 'Domestic social service activities, Provision of outpatient care services',
  },

  // Arts, entertainment and recreation (Kunst, Unterhaltung und Erholung)
  '93.13': {
    de: 'Fitnesszentren',
    en: 'Activities of fitness centres',
  },
};

/**
 * Get translated WZ code description based on locale
 * Falls back to database description if code not found in mapping
 */
export function getWzDescription(
  wzCode: string | null,
  locale: string,
  fallbackDescription?: string | null
): string | null {
  if (!wzCode) return fallbackDescription || null;

  // Normalize code (remove spaces, dots)
  const normalizedCode = wzCode.replace(/[\s.]/g, '');

  // Try exact match first
  if (WZ_CODES[wzCode]) {
    return WZ_CODES[wzCode][locale as 'de' | 'en'] || WZ_CODES[wzCode].en;
  }

  // Try normalized match
  const exactMatch = Object.keys(WZ_CODES).find(
    key => key.replace(/[\s.]/g, '') === normalizedCode
  );

  if (exactMatch) {
    return WZ_CODES[exactMatch][locale as 'de' | 'en'] || WZ_CODES[exactMatch].en;
  }

  // Log missing code for future addition (development only)
  if (process.env.NODE_ENV === 'development') {
    console.warn(`WZ code not found in mapping: ${wzCode}`);
  }

  // Fallback to database description
  return fallbackDescription || null;
}

/**
 * WZ 2008 Sector Classifications (based on division/section)
 * Maps WZ code ranges to economic sectors
 */
export const WZ_SECTORS: Record<string, { de: string; en: string }> = {
  agriculture: { de: 'Land- und Forstwirtschaft', en: 'Agriculture & Forestry' },
  mining: { de: 'Bergbau', en: 'Mining & Quarrying' },
  manufacturing: { de: 'Verarbeitendes Gewerbe', en: 'Manufacturing' },
  energy: { de: 'Energieversorgung', en: 'Energy Supply' },
  water: { de: 'Wasserversorgung', en: 'Water & Waste Management' },
  construction: { de: 'Baugewerbe', en: 'Construction' },
  trade: { de: 'Handel', en: 'Wholesale & Retail Trade' },
  transportation: { de: 'Verkehr und Lagerei', en: 'Transportation & Storage' },
  hospitality: { de: 'Gastgewerbe', en: 'Accommodation & Food Services' },
  information: { de: 'Information und Kommunikation', en: 'Information & Communication' },
  financial: { de: 'Finanzdienstleistungen', en: 'Financial Services' },
  realestate: { de: 'Grundstücks- und Wohnungswesen', en: 'Real Estate' },
  professional: { de: 'Freiberufliche Dienstleistungen', en: 'Professional & Scientific Services' },
  administrative: { de: 'Wirtschaftliche Dienstleistungen', en: 'Administrative & Support Services' },
  public: { de: 'Öffentliche Verwaltung', en: 'Public Administration' },
  education: { de: 'Erziehung und Unterricht', en: 'Education' },
  health: { de: 'Gesundheits- und Sozialwesen', en: 'Health & Social Work' },
  arts: { de: 'Kunst und Unterhaltung', en: 'Arts & Entertainment' },
  other: { de: 'Sonstige Dienstleistungen', en: 'Other Services' },
};

/**
 * Get sector for a given WZ code based on its division (first 2 digits)
 */
export function getWzSector(wzCode: string | null): string | null {
  if (!wzCode) return null;

  // Extract first 2 digits (division code)
  const divisionMatch = wzCode.match(/^(\d{2})/);
  if (!divisionMatch) return null;

  const division = parseInt(divisionMatch[1]);

  // Map division ranges to sectors (WZ 2008 structure)
  if (division >= 1 && division <= 3) return 'agriculture';
  if (division >= 5 && division <= 9) return 'mining';
  if (division >= 10 && division <= 33) return 'manufacturing';
  if (division === 35) return 'energy';
  if (division >= 36 && division <= 39) return 'water';
  if (division >= 41 && division <= 43) return 'construction';
  if (division >= 45 && division <= 47) return 'trade';
  if (division >= 49 && division <= 53) return 'transportation';
  if (division >= 55 && division <= 56) return 'hospitality';
  if (division >= 58 && division <= 63) return 'information';
  if (division >= 64 && division <= 66) return 'financial';
  if (division === 68) return 'realestate';
  if (division >= 69 && division <= 75) return 'professional';
  if (division >= 77 && division <= 82) return 'administrative';
  if (division === 84) return 'public';
  if (division === 85) return 'education';
  if (division >= 86 && division <= 88) return 'health';
  if (division >= 90 && division <= 93) return 'arts';
  if (division >= 94 && division <= 99) return 'other';

  return null;
}

/**
 * Get localized sector name
 */
export function getWzSectorName(
  wzCode: string | null,
  locale: string
): string | null {
  const sectorKey = getWzSector(wzCode);
  if (!sectorKey || !WZ_SECTORS[sectorKey]) return null;

  return WZ_SECTORS[sectorKey][locale as 'de' | 'en'] || WZ_SECTORS[sectorKey].en;
}

// ─── WZ Tree Filter ──────────────────────────────────────

export interface WzTreeNode {
  key: string;
  de: string;
  en: string;
  children?: WzTreeNode[];
}

/**
 * Hierarchical WZ code tree: Sector → Division Group → Individual Codes
 * Built from the existing WZ_CODES organized by sector and division.
 */
export const WZ_TREE: WzTreeNode[] = [
  {
    key: 'mining',
    de: 'Bergbau',
    en: 'Mining & Quarrying',
    children: [
      { key: '08.12', de: 'Kies, Sand, Ton und Kaolin', en: 'Gravel, sand, clay & kaolin' },
    ],
  },
  {
    key: 'manufacturing',
    de: 'Verarbeitendes Gewerbe',
    en: 'Manufacturing',
    children: [
      {
        key: 'mfg_25',
        de: 'Metallerzeugnisse',
        en: 'Metal Products',
        children: [
          { key: '25.12', de: 'Türen und Fenster aus Metall', en: 'Metal doors & windows' },
          { key: '25.61', de: 'Oberflächenveredlung', en: 'Metal treatment & coating' },
        ],
      },
      { key: '28', de: 'Maschinenbau', en: 'Machinery & Equipment' },
    ],
  },
  {
    key: 'construction',
    de: 'Baugewerbe',
    en: 'Construction',
    children: [
      { key: '41', de: 'Hochbau', en: 'Building Construction' },
      {
        key: 'con_43',
        de: 'Ausbaugewerbe',
        en: 'Specialized Construction',
        children: [
          { key: '43.21', de: 'Elektroinstallation', en: 'Electrical installation' },
          { key: '43.22', de: 'Sanitär, Heizung, Klima', en: 'Plumbing, heating & HVAC' },
          { key: '43.33', de: 'Fußboden und Fliesen', en: 'Floor & wall covering' },
          { key: '43.34', de: 'Maler und Glaser', en: 'Painting & glazing' },
          { key: '43.91', de: 'Dachdeckerei und Zimmerei', en: 'Roofing & carpentry' },
          { key: '43.99', de: 'Sonstiges Baugewerbe', en: 'Other construction' },
        ],
      },
    ],
  },
  {
    key: 'trade',
    de: 'Handel',
    en: 'Wholesale & Retail Trade',
    children: [
      {
        key: 'trade_45',
        de: 'Kraftfahrzeughandel',
        en: 'Motor Vehicle Trade',
        children: [
          { key: '45.11', de: 'Handel mit Kraftwagen', en: 'Sale of cars' },
          { key: '45.32', de: 'Kfz-Teile und Zubehör', en: 'Motor vehicle parts & accessories' },
        ],
      },
      {
        key: 'trade_46',
        de: 'Großhandel',
        en: 'Wholesale Trade',
        children: [
          { key: '46.38', de: 'Nahrungsmittel', en: 'Food wholesale' },
          { key: '46.42', de: 'Bekleidung und Schuhe', en: 'Clothing & footwear' },
          { key: '46.6', de: 'Maschinen und Ausrüstungen', en: 'Machinery & equipment' },
          { key: '46.71', de: 'Brennstoffe und Mineralöl', en: 'Fuels & petroleum' },
          { key: '46.74', de: 'Baustoffe und Installation', en: 'Hardware & plumbing supplies' },
          { key: '46.90', de: 'Großhandel ohne Schwerpunkt', en: 'Non-specialised wholesale' },
        ],
      },
      {
        key: 'trade_47',
        de: 'Einzelhandel',
        en: 'Retail Trade',
        children: [
          { key: '47.30', de: 'Tankstellen', en: 'Petrol stations' },
          { key: '47.99', de: 'Sonstiger Einzelhandel', en: 'Other retail' },
        ],
      },
    ],
  },
  {
    key: 'transportation',
    de: 'Verkehr und Lagerei',
    en: 'Transportation & Storage',
    children: [
      { key: '49.41', de: 'Güterbeförderung Straße', en: 'Road freight transport' },
      { key: '50.10', de: 'Personenbeförderung See', en: 'Sea passenger transport' },
      { key: '52.29', de: 'Sonstige Verkehrsdienstleistungen', en: 'Other transport support' },
    ],
  },
  {
    key: 'hospitality',
    de: 'Gastgewerbe',
    en: 'Accommodation & Food Services',
    children: [
      { key: '55', de: 'Beherbergung', en: 'Accommodation' },
      { key: '56', de: 'Gastronomie', en: 'Food & Beverage Services' },
    ],
  },
  {
    key: 'information',
    de: 'Information und Kommunikation',
    en: 'Information & Communication',
    children: [
      { key: '62', de: 'IT-Dienstleistungen', en: 'IT Services' },
      { key: '63', de: 'Datenverarbeitung und Hosting', en: 'Data Processing & Hosting' },
    ],
  },
  {
    key: 'financial',
    de: 'Finanzdienstleistungen',
    en: 'Financial Services',
    children: [
      { key: '66.19', de: 'Sonstige Finanzdienstleistungen', en: 'Other financial services' },
    ],
  },
  {
    key: 'realestate',
    de: 'Grundstücks- und Wohnungswesen',
    en: 'Real Estate',
    children: [
      { key: '68.32', de: 'Immobilienverwaltung', en: 'Property management' },
    ],
  },
  {
    key: 'professional',
    de: 'Freiberufliche Dienstleistungen',
    en: 'Professional & Scientific Services',
    children: [
      { key: '69.20', de: 'Steuerberatung und Wirtschaftsprüfung', en: 'Accounting & tax consultancy' },
      { key: '70.22', de: 'Unternehmensberatung', en: 'Management consulting' },
      { key: '71.12', de: 'Technische Beratung', en: 'Engineering consultancy' },
    ],
  },
  {
    key: 'administrative',
    de: 'Wirtschaftliche Dienstleistungen',
    en: 'Administrative & Support Services',
    children: [
      { key: '80.10', de: 'Sicherheitsdienste', en: 'Security services' },
      { key: '81.30', de: 'Garten- und Landschaftsbau', en: 'Landscaping services' },
    ],
  },
  {
    key: 'public',
    de: 'Öffentliche Verwaltung',
    en: 'Public Administration',
    children: [
      { key: '84.25', de: 'Feuerwehren', en: 'Fire services' },
    ],
  },
  {
    key: 'health',
    de: 'Gesundheits- und Sozialwesen',
    en: 'Health & Social Work',
    children: [
      { key: '87.30', de: 'Alten- und Pflegeheime', en: 'Residential care for elderly' },
      { key: '88.10', de: 'Soziale Betreuung', en: 'Social care services' },
    ],
  },
  {
    key: 'arts',
    de: 'Kunst und Unterhaltung',
    en: 'Arts & Entertainment',
    children: [
      { key: '93.13', de: 'Fitnesszentren', en: 'Fitness centres' },
    ],
  },
];

/** Get all leaf keys from a tree node (recursively) */
export function getLeafKeys(node: WzTreeNode): string[] {
  if (!node.children || node.children.length === 0) return [node.key];
  return node.children.flatMap(getLeafKeys);
}

/** Get all leaf keys from the entire tree */
export function getAllLeafKeys(): string[] {
  return WZ_TREE.flatMap(getLeafKeys);
}

/** Check if a company's WZ code matches any of the selected leaf keys */
export function wzCodeMatchesSelection(wzCode: string | null, selectedKeys: string[]): boolean {
  if (!wzCode || selectedKeys.length === 0) return false;
  return selectedKeys.some(key => wzCode.startsWith(key));
}

// ─── Dynamic WZ Tree Builder ─────────────────────────────

/** Get display labels for a WZ code, falling back to DB description */
function getCodeLabels(
  wzCode: string,
  dbDescription: string | null
): { de: string; en: string } {
  // Try exact match in WZ_CODES dictionary
  if (WZ_CODES[wzCode]) {
    return WZ_CODES[wzCode];
  }

  // Try prefix match (e.g., '43.21.0' might match '43.21')
  const prefixMatch = Object.keys(WZ_CODES).find(key => wzCode.startsWith(key));
  if (prefixMatch) {
    return WZ_CODES[prefixMatch];
  }

  // Try reverse prefix (e.g., '43' might match '43.21')
  const reverseMatch = Object.keys(WZ_CODES).find(key => key.startsWith(wzCode));
  if (reverseMatch) {
    return WZ_CODES[reverseMatch];
  }

  // Fallback to DB description for both languages
  const fallback = dbDescription || wzCode;
  return { de: fallback, en: fallback };
}

/** Get display labels for a division (2-digit group) */
function getDivisionLabels(division: string): { de: string; en: string } {
  // Check if there's a WZ_CODES entry for just the 2-digit code
  if (WZ_CODES[division]) {
    return WZ_CODES[division];
  }

  // Try finding any WZ_CODES entry that starts with this division
  const match = Object.keys(WZ_CODES).find(key => key.startsWith(division));
  if (match) {
    return WZ_CODES[match];
  }

  return { de: `Abteilung ${division}`, en: `Division ${division}` };
}

/**
 * Build a WZ tree dynamically from actual company data.
 * Groups by: Sector → Division (first 2 digits) → Individual WZ codes.
 * Only includes sectors/codes that have companies in the data.
 */
export function buildWzTree(
  companies: { wz_code: string | null; wz_description: string | null }[]
): WzTreeNode[] {
  // 1. Extract unique (wz_code, wz_description) pairs
  const codeMap = new Map<string, string | null>();
  for (const company of companies) {
    if (company.wz_code && !codeMap.has(company.wz_code)) {
      codeMap.set(company.wz_code, company.wz_description);
    }
  }

  // 2. Group by sector → division → codes
  const sectorGroups = new Map<string, Map<string, Set<string>>>();

  for (const [wzCode] of codeMap) {
    const sectorKey = getWzSector(wzCode);
    if (!sectorKey) continue;

    const divisionMatch = wzCode.match(/^(\d{2})/);
    if (!divisionMatch) continue;
    const division = divisionMatch[1];

    if (!sectorGroups.has(sectorKey)) {
      sectorGroups.set(sectorKey, new Map());
    }
    const divisions = sectorGroups.get(sectorKey)!;
    if (!divisions.has(division)) {
      divisions.set(division, new Set());
    }
    divisions.get(division)!.add(wzCode);
  }

  // 3. Build tree nodes
  const tree: WzTreeNode[] = [];

  for (const [sectorKey, divisions] of sectorGroups) {
    const sectorLabels = WZ_SECTORS[sectorKey];
    if (!sectorLabels) continue;

    const sectorChildren: WzTreeNode[] = [];

    for (const [division, codes] of divisions) {
      const sortedCodes = Array.from(codes).sort();

      if (sortedCodes.length === 1) {
        // Single code in this division — add directly as child of sector
        const code = sortedCodes[0];
        const labels = getCodeLabels(code, codeMap.get(code) || null);
        sectorChildren.push({ key: code, de: labels.de, en: labels.en });
      } else {
        // Multiple codes — create a division grouping node
        const divLabels = getDivisionLabels(division);
        const divChildren: WzTreeNode[] = sortedCodes.map(code => {
          const labels = getCodeLabels(code, codeMap.get(code) || null);
          return { key: code, de: labels.de, en: labels.en };
        });

        sectorChildren.push({
          key: `div_${division}`,
          de: divLabels.de,
          en: divLabels.en,
          children: divChildren,
        });
      }
    }

    sectorChildren.sort((a, b) => a.key.localeCompare(b.key));

    tree.push({
      key: sectorKey,
      de: sectorLabels.de,
      en: sectorLabels.en,
      children: sectorChildren,
    });
  }

  // Sort sectors alphabetically by English label
  tree.sort((a, b) => a.en.localeCompare(b.en));

  return tree;
}
