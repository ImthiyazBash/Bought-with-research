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
