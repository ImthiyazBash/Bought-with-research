import { differenceInYears, parse } from 'date-fns';
import type { HamburgTarget, ParsedShareholder, SuccessionScoreBreakdown } from './types';

export function formatCurrency(amount: number | null): string {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatNumber(num: number | null): string {
  if (num === null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('de-DE').format(num);
}

export function calculateAge(dob: string | null): number | null {
  if (!dob) return null;

  try {
    // Try different date formats
    const formats = ['yyyy-MM-dd', 'dd.MM.yyyy', 'dd/MM/yyyy', 'MM/dd/yyyy'];
    let date: Date | null = null;

    for (const format of formats) {
      try {
        date = parse(dob, format, new Date());
        if (!isNaN(date.getTime())) break;
      } catch {
        continue;
      }
    }

    if (!date || isNaN(date.getTime())) {
      // Try direct Date parsing
      date = new Date(dob);
    }

    if (isNaN(date.getTime())) return null;

    return differenceInYears(new Date(), date);
  } catch {
    return null;
  }
}

/**
 * Calculate Nachfolge-Score (1-10) based on shareholder age
 * Higher score = higher succession opportunity
 *
 * @param age - Shareholder age in years
 * @returns Score from 1-10
 */
export function calculateNachfolgeScore(age: number | null): number {
  if (age === null) return 1;

  if (age >= 65) {
    // Score 10 for age 65+
    return 10;
  } else if (age >= 55) {
    // Score 7-9 for age 55-64
    // Linear scale: 55 → 7, 64 → 9.9
    const ageInRange = age - 55; // 0-9
    return Math.min(9, Math.round(7 + (ageInRange / 10) * 3));
  } else {
    // Score 1-6 for age <55
    // Linear scale: 0 → 1, 54 → 6
    return Math.min(6, Math.max(1, Math.round((age / 55) * 6)));
  }
}

/** @deprecated Use calculateNachfolgeScore instead */
export function getSuccessionRisk(age: number | null): 'high' | 'medium' | 'low' {
  const score = calculateNachfolgeScore(age);
  if (score >= 10) return 'high';
  if (score >= 7) return 'medium';
  return 'low';
}

/** Merge duplicate shareholders (same name + DOB) and sum their ownership percentages */
function deduplicateShareholders(shareholders: ParsedShareholder[]): ParsedShareholder[] {
  const map = new Map<string, ParsedShareholder>();

  for (const s of shareholders) {
    const key = `${s.name.toLowerCase()}|${s.dob ?? ''}`;
    const existing = map.get(key);
    if (existing) {
      if (s.percentage !== null) {
        existing.percentage = (existing.percentage ?? 0) + s.percentage;
      }
    } else {
      map.set(key, { ...s });
    }
  }

  return Array.from(map.values());
}

export function parseShareholders(company: HamburgTarget): ParsedShareholder[] {
  const shareholders: ParsedShareholder[] = [];

  // First, try to use shareholder_details JSON if available
  if (company.shareholder_details && Array.isArray(company.shareholder_details)) {
    for (const detail of company.shareholder_details) {
      if (detail.name) {
        const dob = detail.dob || null;
        const age = calculateAge(dob);
        const score = calculateNachfolgeScore(age);
        shareholders.push({
          name: detail.name,
          dob,
          age,
          nachfolgeScore: score,
          successionRisk: getScoreVariant(score),
          percentage: detail.percentage ?? detail.ownership_percentage ?? null,
          isPerson: dob !== null,
        });
      }
    }
    if (shareholders.length > 0) return deduplicateShareholders(shareholders);
  }

  // Fallback to parsing comma-separated strings
  const names = company.shareholder_names?.split(',').map(n => n.trim()).filter(Boolean) || [];
  const dobs = company.shareholder_dobs?.split(',').map(d => d.trim()).filter(Boolean) || [];

  for (let i = 0; i < names.length; i++) {
    const dob = dobs[i] || null;
    const age = calculateAge(dob);
    const score = calculateNachfolgeScore(age);
    shareholders.push({
      name: names[i],
      dob,
      age,
      nachfolgeScore: score,
      successionRisk: getScoreVariant(score),
      percentage: null,
      isPerson: dob !== null,
    });
  }

  return deduplicateShareholders(shareholders);
}

// ── 5-Factor Succession Scoring ──────────────────────────────────────

/**
 * Factor 1 (30%): Ownership-weighted age score
 * Weights each shareholder's age score by their ownership percentage.
 */
export function computeAgeFactor(shareholders: ParsedShareholder[]): number {
  const persons = shareholders.filter(s => s.isPerson);
  if (persons.length === 0) return 0;

  const withPct = persons.filter(s => s.percentage !== null && s.percentage > 0);
  if (withPct.length > 0) {
    const totalPct = withPct.reduce((sum, s) => sum + s.percentage!, 0);
    const weighted = withPct.reduce((sum, s) => sum + s.nachfolgeScore * s.percentage!, 0);
    return totalPct > 0 ? weighted / totalPct : 0;
  }

  // Equal weight fallback
  const avg = persons.reduce((sum, s) => sum + s.nachfolgeScore, 0) / persons.length;
  return avg;
}

/**
 * Factor 2 (20%): Senior ownership concentration
 * What % of ownership is held by shareholders aged 55+?
 */
export function computeConcentrationFactor(shareholders: ParsedShareholder[]): number {
  const persons = shareholders.filter(s => s.isPerson);
  if (persons.length === 0) return 0;

  const withPct = persons.filter(s => s.percentage !== null && s.percentage > 0);

  let seniorPct: number;
  if (withPct.length > 0) {
    const totalPct = withPct.reduce((sum, s) => sum + s.percentage!, 0);
    const seniorTotal = withPct
      .filter(s => s.age !== null && s.age >= 55)
      .reduce((sum, s) => sum + s.percentage!, 0);
    seniorPct = totalPct > 0 ? (seniorTotal / totalPct) * 100 : 0;
  } else {
    const seniorCount = persons.filter(s => s.age !== null && s.age >= 55).length;
    seniorPct = (seniorCount / persons.length) * 100;
  }

  let score = (seniorPct / 100) * 10;
  if (seniorPct > 50) score += 2;
  return Math.min(10, score);
}

/**
 * Factor 3 (15%): Ownership stability
 * Longer time since last change = higher succession likelihood.
 */
export function computeStabilityFactor(lastOwnershipChangeYear: number | null): number {
  if (lastOwnershipChangeYear === null) return 5; // neutral default
  const yearsSince = new Date().getFullYear() - lastOwnershipChangeYear;
  return Math.min(10, Math.max(0, yearsSince));
}

/**
 * Factor 4 (20%): Successor gap
 * If the youngest person is old, there's no next-gen successor ready.
 */
export function computeSuccessorGapFactor(shareholders: ParsedShareholder[]): number {
  const persons = shareholders.filter(s => s.isPerson && s.age !== null);
  if (persons.length === 0) return 5; // neutral default

  const youngestAge = Math.min(...persons.map(s => s.age!));

  if (youngestAge >= 65) return 10;
  if (youngestAge >= 55) return 8;
  if (youngestAge >= 45) return 6;
  if (youngestAge >= 35) return 4;
  return 2; // under 35 — likely has successors
}

/**
 * Factor 5 (15%): Deal simplicity
 * Fewer shareholders = easier deal.
 */
export function computeSimplicityFactor(shareholders: ParsedShareholder[]): number {
  const count = shareholders.length;
  if (count <= 1) return 10;
  if (count === 2) return 8;
  if (count === 3) return 6;
  if (count === 4) return 4;
  return 2;
}

/**
 * Compute the full 5-factor succession breakdown for a company.
 */
export function computeSuccessionBreakdown(company: HamburgTarget): SuccessionScoreBreakdown {
  const shareholders = parseShareholders(company);

  if (shareholders.length === 0) {
    return { total: null, ageScore: 0, concentrationScore: 0, stabilityScore: 0, gapScore: 0, simplicityScore: 0 };
  }

  const ageScore = computeAgeFactor(shareholders);
  const concentrationScore = computeConcentrationFactor(shareholders);
  const stabilityScore = computeStabilityFactor(company.last_ownership_change_year);
  const gapScore = computeSuccessorGapFactor(shareholders);
  const simplicityScore = computeSimplicityFactor(shareholders);

  const total = ageScore * 0.30 + concentrationScore * 0.20 + stabilityScore * 0.15 + gapScore * 0.20 + simplicityScore * 0.15;

  return {
    total: Math.round(total * 10) / 10,
    ageScore: Math.round(ageScore * 10) / 10,
    concentrationScore: Math.round(concentrationScore * 10) / 10,
    stabilityScore: Math.round(stabilityScore * 10) / 10,
    gapScore: Math.round(gapScore * 10) / 10,
    simplicityScore: Math.round(simplicityScore * 10) / 10,
  };
}

/**
 * Get company-level Nachfolge-Score.
 * Prefers pre-computed DB column; falls back to client-side computation.
 */
export function getCompanyNachfolgeScore(company: HamburgTarget): number | null {
  if (company.succession_score !== null && company.succession_score !== undefined) {
    return company.succession_score;
  }

  const breakdown = computeSuccessionBreakdown(company);
  return breakdown.total;
}

/**
 * Get color for score visualization
 * 8-10 = green (high), 5-7 = amber (medium), 1-4 = red (low), null = grey
 */
export function getScoreColor(score: number | null): string {
  if (score === null || score === 0) return '#9CA3AF'; // grey
  if (score >= 8) return '#10B981'; // green
  if (score >= 5) return '#F59E0B'; // amber
  return '#EF4444'; // red
}

/**
 * Get score category for badge styling
 * 8-10 = high, 5-7 = medium, 1-4 = low, null/0 = neutral
 */
export function getScoreVariant(score: number | null): 'high' | 'medium' | 'low' | 'neutral' {
  if (score === null || score === 0) return 'neutral';
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

/** @deprecated Use getCompanyNachfolgeScore instead */
export function getHighestSuccessionRisk(company: HamburgTarget): 'high' | 'medium' | 'low' | 'neutral' {
  const score = getCompanyNachfolgeScore(company);
  return getScoreVariant(score);
}

export function getFullAddress(company: HamburgTarget): string {
  const parts = [
    company.address_street,
    company.address_zip,
    company.address_city,
    company.address_country,
  ].filter(Boolean);

  return parts.join(', ') || 'Address not available';
}

export function getShortAddress(company: HamburgTarget): string {
  const parts = [company.address_zip, company.address_city].filter(Boolean);
  return parts.join(' ') || 'Hamburg';
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
