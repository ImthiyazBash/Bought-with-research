import { differenceInYears, parse } from 'date-fns';
import type { HamburgTarget, ParsedShareholder } from './types';

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
        });
      }
    }
    if (shareholders.length > 0) return shareholders;
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
    });
  }

  return shareholders;
}

/**
 * Get company-level Nachfolge-Score (highest among all shareholders)
 *
 * @param company - Hamburg Target company data
 * @returns Highest score from all shareholders (1-10)
 */
export function getCompanyNachfolgeScore(company: HamburgTarget): number {
  const shareholders = parseShareholders(company);

  if (shareholders.length === 0) return 1;

  // Return the highest score (oldest shareholder)
  const scores = shareholders.map(s => s.nachfolgeScore);

  return Math.max(...scores);
}

/**
 * Get color for score visualization
 * 10 = red, 7-9 = amber, 1-6 = green
 */
export function getScoreColor(score: number): string {
  if (score >= 10) return '#10B981'; // green - high succession opportunity
  if (score >= 7) return '#F59E0B'; // amber - medium succession opportunity
  return '#EF4444'; // red - low succession opportunity
}

/**
 * Get score category for badge styling
 */
export function getScoreVariant(score: number): 'high' | 'medium' | 'low' {
  if (score >= 10) return 'high';
  if (score >= 7) return 'medium';
  return 'low';
}

/** @deprecated Use getCompanyNachfolgeScore instead */
export function getHighestSuccessionRisk(company: HamburgTarget): 'high' | 'medium' | 'low' {
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
