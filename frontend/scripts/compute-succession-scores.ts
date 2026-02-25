import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { differenceInYears, parse } from 'date-fns';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Inline scoring logic (mirrors utils.ts) ──────────────────────────

interface ShareholderDetail {
  name?: string;
  dob?: string;
  percentage?: number;
  ownership_percentage?: number;
}

interface ParsedShareholder {
  name: string;
  dob: string | null;
  age: number | null;
  nachfolgeScore: number;
  percentage: number | null;
  isPerson: boolean;
}

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  try {
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
    if (!date || isNaN(date.getTime())) date = new Date(dob);
    if (isNaN(date.getTime())) return null;
    return differenceInYears(new Date(), date);
  } catch {
    return null;
  }
}

function calculateNachfolgeScore(age: number | null): number {
  if (age === null) return 1;
  if (age >= 65) return 10;
  if (age >= 55) {
    const ageInRange = age - 55;
    return Math.min(9, Math.round(7 + (ageInRange / 10) * 3));
  }
  return Math.min(6, Math.max(1, Math.round((age / 55) * 6)));
}

function parseShareholders(company: any): ParsedShareholder[] {
  const shareholders: ParsedShareholder[] = [];

  if (company.shareholder_details && Array.isArray(company.shareholder_details)) {
    for (const detail of company.shareholder_details as ShareholderDetail[]) {
      if (detail.name) {
        const dob = detail.dob || null;
        const age = calculateAge(dob);
        shareholders.push({
          name: detail.name,
          dob,
          age,
          nachfolgeScore: calculateNachfolgeScore(age),
          percentage: detail.percentage ?? detail.ownership_percentage ?? null,
          isPerson: dob !== null,
        });
      }
    }
    if (shareholders.length > 0) return dedup(shareholders);
  }

  const names = company.shareholder_names?.split(',').map((n: string) => n.trim()).filter(Boolean) || [];
  const dobs = company.shareholder_dobs?.split(',').map((d: string) => d.trim()).filter(Boolean) || [];

  for (let i = 0; i < names.length; i++) {
    const dob = dobs[i] || null;
    const age = calculateAge(dob);
    shareholders.push({
      name: names[i],
      dob,
      age,
      nachfolgeScore: calculateNachfolgeScore(age),
      percentage: null,
      isPerson: dob !== null,
    });
  }

  return dedup(shareholders);
}

function dedup(shareholders: ParsedShareholder[]): ParsedShareholder[] {
  const map = new Map<string, ParsedShareholder>();
  for (const s of shareholders) {
    const key = `${s.name.toLowerCase()}|${s.dob ?? ''}`;
    const existing = map.get(key);
    if (existing) {
      if (s.percentage !== null) existing.percentage = (existing.percentage ?? 0) + s.percentage;
    } else {
      map.set(key, { ...s });
    }
  }
  return Array.from(map.values());
}

function computeAgeFactor(shareholders: ParsedShareholder[]): number {
  const persons = shareholders.filter(s => s.isPerson);
  if (persons.length === 0) return 0;
  const withPct = persons.filter(s => s.percentage !== null && s.percentage > 0);
  if (withPct.length > 0) {
    const totalPct = withPct.reduce((sum, s) => sum + s.percentage!, 0);
    const weighted = withPct.reduce((sum, s) => sum + s.nachfolgeScore * s.percentage!, 0);
    return totalPct > 0 ? weighted / totalPct : 0;
  }
  return persons.reduce((sum, s) => sum + s.nachfolgeScore, 0) / persons.length;
}

function computeConcentrationFactor(shareholders: ParsedShareholder[]): number {
  const persons = shareholders.filter(s => s.isPerson);
  if (persons.length === 0) return 0;
  const withPct = persons.filter(s => s.percentage !== null && s.percentage > 0);
  let seniorPct: number;
  if (withPct.length > 0) {
    const totalPct = withPct.reduce((sum, s) => sum + s.percentage!, 0);
    const seniorTotal = withPct.filter(s => s.age !== null && s.age >= 55).reduce((sum, s) => sum + s.percentage!, 0);
    seniorPct = totalPct > 0 ? (seniorTotal / totalPct) * 100 : 0;
  } else {
    const seniorCount = persons.filter(s => s.age !== null && s.age >= 55).length;
    seniorPct = (seniorCount / persons.length) * 100;
  }
  let score = (seniorPct / 100) * 10;
  if (seniorPct > 50) score += 2;
  return Math.min(10, score);
}

function computeStabilityFactor(lastOwnershipChangeYear: number | null): number {
  if (lastOwnershipChangeYear === null) return 5;
  const yearsSince = new Date().getFullYear() - lastOwnershipChangeYear;
  return Math.min(10, Math.max(0, yearsSince));
}

function computeSuccessorGapFactor(shareholders: ParsedShareholder[]): number {
  const persons = shareholders.filter(s => s.isPerson && s.age !== null);
  if (persons.length === 0) return 5;
  const youngestAge = Math.min(...persons.map(s => s.age!));
  if (youngestAge >= 65) return 10;
  if (youngestAge >= 55) return 8;
  if (youngestAge >= 45) return 6;
  if (youngestAge >= 35) return 4;
  return 2;
}

function computeSimplicityFactor(shareholders: ParsedShareholder[]): number {
  const count = shareholders.length;
  if (count <= 1) return 10;
  if (count === 2) return 8;
  if (count === 3) return 6;
  if (count === 4) return 4;
  return 2;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log('\n📊 Computing Succession Scores\n');
  console.log('═'.repeat(60));

  const { data, error } = await supabase
    .from('Hamburg Targets')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching companies:', error);
    process.exit(1);
  }

  const companies = data || [];
  console.log(`\nLoaded ${companies.length} companies\n`);

  let updated = 0;
  let skipped = 0;

  for (const company of companies) {
    const shareholders = parseShareholders(company);

    if (shareholders.length === 0) {
      // No shareholders — set all scores to null
      const { error: updateError } = await supabase
        .from('Hamburg Targets')
        .update({
          succession_score: null,
          succession_age_score: null,
          succession_concentration_score: null,
          succession_stability_score: null,
          succession_gap_score: null,
          succession_simplicity_score: null,
        })
        .eq('id', company.id);

      if (updateError) {
        console.error(`  ✗ ID ${company.id} (${company.company_name}): ${updateError.message}`);
      } else {
        skipped++;
      }
      continue;
    }

    const ageScore = round1(computeAgeFactor(shareholders));
    const concentrationScore = round1(computeConcentrationFactor(shareholders));
    const stabilityScore = round1(computeStabilityFactor(company.last_ownership_change_year));
    const gapScore = round1(computeSuccessorGapFactor(shareholders));
    const simplicityScore = round1(computeSimplicityFactor(shareholders));
    const total = round1(ageScore * 0.30 + concentrationScore * 0.20 + stabilityScore * 0.15 + gapScore * 0.20 + simplicityScore * 0.15);

    const { error: updateError } = await supabase
      .from('Hamburg Targets')
      .update({
        succession_score: total,
        succession_age_score: ageScore,
        succession_concentration_score: concentrationScore,
        succession_stability_score: stabilityScore,
        succession_gap_score: gapScore,
        succession_simplicity_score: simplicityScore,
      })
      .eq('id', company.id);

    if (updateError) {
      console.error(`  ✗ ID ${company.id} (${company.company_name}): ${updateError.message}`);
    } else {
      console.log(`  ✓ ID ${company.id} ${(company.company_name || 'Unnamed').padEnd(40)} → ${total}/10  [age=${ageScore} conc=${concentrationScore} stab=${stabilityScore} gap=${gapScore} simp=${simplicityScore}]`);
      updated++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`\n✅ Updated: ${updated} companies`);
  console.log(`⬚  No shareholders (null score): ${skipped} companies`);
  console.log(`📊 Total: ${companies.length} companies\n`);
}

main();
