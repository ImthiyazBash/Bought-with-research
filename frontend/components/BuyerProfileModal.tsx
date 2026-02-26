'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n-context';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { BuyerProfileData } from '@/lib/types';

export type { BuyerProfileData };

// Derived from BuyerProfileData so it stays in sync with types.ts
type BuyerType = BuyerProfileData['buyerType'];

interface BuyerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: BuyerProfileData) => void;
}

// ─── Structural constants (locale-independent) ───────────────────────────────

const INITIAL_DATA: BuyerProfileData = {
  buyerType: '',
  industries: [],
  regions: [],
  remoteOk: false,
  employees: [5, 100],
  priceRange: [250_000, 3_000_000],
  ebitRange: [50_000, 500_000],
  revenueRange: [500_000, 10_000_000],
  equity: '',
  financing: [],
  timeline: '',
  currentRole: '',
  yearsExperience: '',
  yearsLeadership: '',
  background: '',
  motivation: '',
  firmName: '',
  portfolioCount: '',
  investmentFocus: '',
  valueCreation: '',
  trackRecord: '',
  companyName: '',
  companyIndustry: '',
  companySize: '',
  companyRevenue: '',
  strategyRationale: '',
  maExperience: '',
  dealStructures: [],
  dealBreakers: '',
  specialRequirements: '',
};

// Accent colors and icons are not locale-sensitive
const BUYER_TYPE_STYLE = {
  mbi:       { icon: '👤', accent: '#2D6A4F', accentBg: '#f0f9f4' },
  financial: { icon: '📊', accent: '#1B4965', accentBg: '#eef4f9' },
  strategic: { icon: '🏢', accent: '#6B2737', accentBg: '#fdf2f4' },
} as const;

// Financing option IDs stay in code; labels/descs come from translations
const FINANCING_IDS = ['equity', 'bank', 'kfw', 'co', 'seller', 'earnout'] as const;

// German federal states — proper nouns, same in both locales
const REGIONS = [
  'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
  'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen',
  'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt',
  'Schleswig-Holstein', 'Thüringen', 'Gesamtes DACH-Gebiet',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(val: number, max: number): string {
  if (val >= max) {
    if (max >= 1_000_000) return `${(max / 1_000_000).toFixed(0)}M+ €`;
    return `${(max / 1_000).toFixed(0)}T+ €`;
  }
  if (val === 0) return '0 €';
  if (val >= 1_000_000) {
    const m = val / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M €`;
  }
  return `${(val / 1_000).toFixed(0)}T €`;
}

// ─── Shared style string ──────────────────────────────────────────────────────

const inputBase =
  'w-full bg-gray-50 border border-gray-200 rounded-[10px] px-3 py-2.5 text-[13px] text-gray-900 ' +
  'placeholder:text-gray-400 focus:outline-none focus:border-gray-900 transition-colors duration-150';

// ─── Primitives ───────────────────────────────────────────────────────────────

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <p className="text-[13px] font-semibold text-gray-900">{children}</p>
      {hint && <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex items-center flex-shrink-0 rounded-full transition-colors duration-200 focus:outline-none w-11 h-6',
        checked ? 'bg-gray-900' : 'bg-gray-300',
      )}
    >
      <span
        className={cn(
          'inline-block w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]',
        )}
      />
    </button>
  );
}

function ChipToggle({
  options,
  selected,
  onChange,
  multi = true,
}: {
  options: string[];
  selected: string | string[];
  onChange: (v: string | string[]) => void;
  multi?: boolean;
}) {
  const sel = Array.isArray(selected) ? selected : (selected ? [selected] : []);
  const toggle = (opt: string) => {
    if (multi) {
      onChange(sel.includes(opt) ? sel.filter(s => s !== opt) : [...sel, opt]);
    } else {
      onChange(sel.includes(opt) ? '' : opt);
    }
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => {
        const active = sel.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all duration-150',
              active
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900',
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function DualRangeSlider({
  label,
  min, max, step,
  value, onChange,
  format,
}: {
  label: string;
  min: number; max: number; step: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
  format: (v: number, max: number) => string;
}) {
  const [lo, hi] = value;
  const loPercent = ((lo - min) / (max - min)) * 100;
  const hiPercent = ((hi - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-3">
        <label className="text-[13px] font-semibold text-gray-900">{label}</label>
        <span className="bpm-mono text-[12px] text-gray-500">
          {format(lo, max)}&nbsp;–&nbsp;{format(hi, max)}
        </span>
      </div>
      <div className="relative flex items-center" style={{ height: 20 }}>
        <div className="absolute w-full h-[3px] bg-gray-200 rounded-full" />
        <div
          className="absolute h-[3px] bg-gray-900 rounded-full"
          style={{ left: `${loPercent}%`, right: `${100 - hiPercent}%` }}
        />
        <input
          type="range" min={min} max={max} step={step} value={lo}
          onChange={e => onChange([Math.min(Number(e.target.value), hi - step), hi])}
          className="bpm-slider"
          style={{ zIndex: lo > max - step ? 5 : 3 }}
        />
        <input
          type="range" min={min} max={max} step={step} value={hi}
          onChange={e => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
          className="bpm-slider"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  );
}

// ─── Step 1: Buyer Type ───────────────────────────────────────────────────────

function StepBuyerType({
  value,
  onChange,
}: {
  value: BuyerType;
  onChange: (v: BuyerType) => void;
}) {
  const t = useTranslations('buyerProfile');
  const types = (t('step1.types') as unknown as Array<{ label: string; desc: string }>);
  const ids = ['mbi', 'financial', 'strategic'] as const;

  return (
    <div className="space-y-3">
      {ids.map((id, i) => {
        const style = BUYER_TYPE_STYLE[id];
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150"
            style={{
              borderColor: active ? style.accent : '#e5e5e5',
              backgroundColor: active ? style.accentBg : '#fff',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-colors duration-150"
              style={{ backgroundColor: active ? `${style.accent}22` : '#f5f5f5' }}
            >
              {style.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-gray-900">{types[i]?.label}</p>
              <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">{types[i]?.desc}</p>
            </div>
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150"
              style={{
                borderColor: active ? style.accent : '#d4d4d4',
                backgroundColor: active ? style.accent : 'transparent',
              }}
            >
              {active && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                  <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Step 2: Search Profile ───────────────────────────────────────────────────

function StepSearchProfile({
  data,
  update,
}: {
  data: BuyerProfileData;
  update: (k: keyof BuyerProfileData, v: any) => void;
}) {
  const t = useTranslations('buyerProfile');
  const industryList = t('step2.industryList') as unknown as string[];

  return (
    <div className="space-y-6">
      <div>
        <FieldLabel>{t('step2.industriesLabel')}</FieldLabel>
        <ChipToggle options={industryList} selected={data.industries} onChange={v => update('industries', v)} />
      </div>
      <div>
        <FieldLabel>{t('step2.regionsLabel')}</FieldLabel>
        <ChipToggle options={REGIONS} selected={data.regions} onChange={v => update('regions', v)} />
      </div>
      <div className="flex items-center justify-between py-1">
        <div>
          <p className="text-[13px] font-semibold text-gray-900">{t('step2.remoteLabel')}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">{t('step2.remoteDesc')}</p>
        </div>
        <Toggle checked={data.remoteOk} onChange={v => update('remoteOk', v)} />
      </div>
      <DualRangeSlider
        label={t('step2.employeesLabel')}
        min={1} max={500} step={5}
        value={data.employees}
        onChange={v => update('employees', v)}
        format={(v, max) => v >= max ? '500+' : `${v}`}
      />
    </div>
  );
}

// ─── Step 3: Financials ───────────────────────────────────────────────────────

function StepFinancials({
  data,
  update,
}: {
  data: BuyerProfileData;
  update: (k: keyof BuyerProfileData, v: any) => void;
}) {
  const t = useTranslations('buyerProfile');
  const financingLabels = t('step3.financingLabels') as unknown as string[];
  const financingDescs  = t('step3.financingDescs')  as unknown as string[];
  const timelineOptions = t('step3.timelineOptions') as unknown as string[];

  return (
    <div className="space-y-6">
      <DualRangeSlider
        label={t('step3.priceRangeLabel')}
        min={0} max={10_000_000} step={100_000}
        value={data.priceRange} onChange={v => update('priceRange', v)}
        format={formatCurrency}
      />
      <DualRangeSlider
        label={t('step3.ebitLabel')}
        min={0} max={2_000_000} step={50_000}
        value={data.ebitRange} onChange={v => update('ebitRange', v)}
        format={formatCurrency}
      />
      <DualRangeSlider
        label={t('step3.revenueLabel')}
        min={0} max={50_000_000} step={500_000}
        value={data.revenueRange} onChange={v => update('revenueRange', v)}
        format={formatCurrency}
      />
      <div>
        <FieldLabel>{t('step3.equityLabel')}</FieldLabel>
        <div className="relative">
          <input
            type="text"
            className={cn(inputBase, 'pr-8')}
            placeholder={t('step3.equityPlaceholder')}
            value={data.equity}
            onChange={e => update('equity', e.target.value)}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-400">€</span>
        </div>
      </div>
      <div>
        <FieldLabel>{t('step3.financingLabel')}</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {FINANCING_IDS.map((id, i) => {
            const active = data.financing.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  const next = active
                    ? data.financing.filter(f => f !== id)
                    : [...data.financing, id];
                  update('financing', next);
                }}
                className={cn(
                  'text-left p-3 rounded-[10px] border transition-all duration-150',
                  active ? 'bg-gray-900 border-gray-900' : 'bg-gray-50 border-gray-200 hover:border-gray-300',
                )}
              >
                <p className={cn('text-[12px] font-semibold', active ? 'text-white' : 'text-gray-900')}>
                  {financingLabels[i]}
                </p>
                <p className={cn('text-[11px] mt-0.5', active ? 'text-gray-400' : 'text-gray-500')}>
                  {financingDescs[i]}
                </p>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <FieldLabel>{t('step3.timelineLabel')}</FieldLabel>
        <ChipToggle
          options={timelineOptions}
          selected={data.timeline}
          onChange={v => update('timeline', v as string)}
          multi={false}
        />
      </div>
    </div>
  );
}

// ─── Step 4a: MBI ─────────────────────────────────────────────────────────────

function StepMBI({
  data,
  update,
}: {
  data: BuyerProfileData;
  update: (k: keyof BuyerProfileData, v: any) => void;
}) {
  const t = useTranslations('buyerProfile');
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>{t('step4mbi.roleLabel')}</FieldLabel>
        <input type="text" className={inputBase} placeholder={t('step4mbi.rolePlaceholder')}
          value={data.currentRole} onChange={e => update('currentRole', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>{t('step4mbi.industryYearsLabel')}</FieldLabel>
          <input type="number" className={inputBase} placeholder={t('step4mbi.industryYearsPlaceholder')}
            value={data.yearsExperience} onChange={e => update('yearsExperience', e.target.value)} />
        </div>
        <div>
          <FieldLabel>{t('step4mbi.leadershipYearsLabel')}</FieldLabel>
          <input type="number" className={inputBase} placeholder={t('step4mbi.leadershipYearsPlaceholder')}
            value={data.yearsLeadership} onChange={e => update('yearsLeadership', e.target.value)} />
        </div>
      </div>
      <div>
        <FieldLabel hint={t('step4mbi.backgroundHint')}>{t('step4mbi.backgroundLabel')}</FieldLabel>
        <textarea className={cn(inputBase, 'resize-y min-h-[80px]')} rows={3}
          placeholder={t('step4mbi.backgroundPlaceholder')}
          value={data.background} onChange={e => update('background', e.target.value)} />
      </div>
      <div>
        <FieldLabel hint={t('step4mbi.motivationHint')}>{t('step4mbi.motivationLabel')}</FieldLabel>
        <textarea className={cn(inputBase, 'resize-y min-h-[80px]')} rows={3}
          placeholder={t('step4mbi.motivationPlaceholder')}
          value={data.motivation} onChange={e => update('motivation', e.target.value)} />
      </div>
    </div>
  );
}

// ─── Step 4b: Financial Investor ──────────────────────────────────────────────

function StepFinancialInvestor({
  data,
  update,
}: {
  data: BuyerProfileData;
  update: (k: keyof BuyerProfileData, v: any) => void;
}) {
  const t = useTranslations('buyerProfile');
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>{t('step4financial.firmNameLabel')}</FieldLabel>
        <input type="text" className={inputBase} placeholder={t('step4financial.firmNamePlaceholder')}
          value={data.firmName} onChange={e => update('firmName', e.target.value)} />
      </div>
      <div>
        <FieldLabel>{t('step4financial.portfolioCountLabel')}</FieldLabel>
        <input type="number" className={inputBase} placeholder={t('step4financial.portfolioCountPlaceholder')}
          value={data.portfolioCount} onChange={e => update('portfolioCount', e.target.value)} />
      </div>
      <div>
        <FieldLabel hint={t('step4financial.investmentFocusHint')}>{t('step4financial.investmentFocusLabel')}</FieldLabel>
        <textarea className={cn(inputBase, 'resize-y min-h-[80px]')} rows={3}
          value={data.investmentFocus} onChange={e => update('investmentFocus', e.target.value)} />
      </div>
      <div>
        <FieldLabel hint={t('step4financial.valueCreationHint')}>{t('step4financial.valueCreationLabel')}</FieldLabel>
        <textarea className={cn(inputBase, 'resize-y min-h-[80px]')} rows={3}
          value={data.valueCreation} onChange={e => update('valueCreation', e.target.value)} />
      </div>
      <div>
        <FieldLabel hint={t('step4financial.trackRecordHint')}>{t('step4financial.trackRecordLabel')}</FieldLabel>
        <textarea className={cn(inputBase, 'resize-y min-h-[80px]')} rows={3}
          value={data.trackRecord} onChange={e => update('trackRecord', e.target.value)} />
      </div>
    </div>
  );
}

// ─── Step 4c: Strategic Buyer ─────────────────────────────────────────────────

function StepStrategic({
  data,
  update,
}: {
  data: BuyerProfileData;
  update: (k: keyof BuyerProfileData, v: any) => void;
}) {
  const t = useTranslations('buyerProfile');
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>{t('step4strategic.companyNameLabel')}</FieldLabel>
        <input type="text" className={inputBase} placeholder={t('step4strategic.companyNamePlaceholder')}
          value={data.companyName} onChange={e => update('companyName', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>{t('step4strategic.industryLabel')}</FieldLabel>
          <input type="text" className={inputBase} placeholder={t('step4strategic.industryPlaceholder')}
            value={data.companyIndustry} onChange={e => update('companyIndustry', e.target.value)} />
        </div>
        <div>
          <FieldLabel>{t('step4strategic.employeesLabel')}</FieldLabel>
          <input type="number" className={inputBase} placeholder={t('step4strategic.employeesPlaceholder')}
            value={data.companySize} onChange={e => update('companySize', e.target.value)} />
        </div>
      </div>
      <div>
        <FieldLabel>{t('step4strategic.revenueLabel')}</FieldLabel>
        <div className="relative">
          <input type="text" className={cn(inputBase, 'pr-8')} placeholder={t('step4strategic.revenuePlaceholder')}
            value={data.companyRevenue} onChange={e => update('companyRevenue', e.target.value)} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-gray-400">€</span>
        </div>
      </div>
      <div>
        <FieldLabel hint={t('step4strategic.strategyHint')}>{t('step4strategic.strategyLabel')}</FieldLabel>
        <textarea className={cn(inputBase, 'resize-y min-h-[80px]')} rows={3}
          value={data.strategyRationale} onChange={e => update('strategyRationale', e.target.value)} />
      </div>
      <div>
        <FieldLabel hint={t('step4strategic.maHint')}>{t('step4strategic.maLabel')}</FieldLabel>
        <textarea className={cn(inputBase, 'resize-y min-h-[80px]')} rows={3}
          value={data.maExperience} onChange={e => update('maExperience', e.target.value)} />
      </div>
    </div>
  );
}

// ─── Step 5: Preferences ──────────────────────────────────────────────────────

function StepPreferences({
  data,
  update,
}: {
  data: BuyerProfileData;
  update: (k: keyof BuyerProfileData, v: any) => void;
}) {
  const t = useTranslations('buyerProfile');
  const dealStructureOptions = t('step5.dealStructureOptions') as unknown as string[];

  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>{t('step5.dealStructureLabel')}</FieldLabel>
        <ChipToggle options={dealStructureOptions} selected={data.dealStructures} onChange={v => update('dealStructures', v)} />
      </div>
      <div>
        <FieldLabel hint={t('step5.dealBreakersHint')}>{t('step5.dealBreakersLabel')}</FieldLabel>
        <textarea className={cn(inputBase, 'resize-y min-h-[80px]')} rows={3}
          value={data.dealBreakers} onChange={e => update('dealBreakers', e.target.value)} />
      </div>
      <div>
        <FieldLabel hint={t('step5.specialReqsHint')}>{t('step5.specialReqsLabel')}</FieldLabel>
        <textarea className={cn(inputBase, 'resize-y min-h-[80px]')} rows={3}
          placeholder={t('step5.specialReqsPlaceholder')}
          value={data.specialRequirements} onChange={e => update('specialRequirements', e.target.value)} />
      </div>
      <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <span className="text-[18px] leading-none mt-0.5 flex-shrink-0">✅</span>
        <div>
          <p className="text-[13px] font-semibold text-emerald-800">{t('step5.bannerTitle')}</p>
          <p className="text-[12px] text-emerald-700 mt-0.5 leading-relaxed">{t('step5.bannerText')}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Completion ───────────────────────────────────────────────────────────────

function CompletionScreen() {
  const t = useTranslations('buyerProfile');
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-[40px] mb-5 bpm-celebrate">
        🎉
      </div>
      <h2 className="text-[20px] font-bold text-gray-900 mb-2">{t('completion.title')}</h2>
      <p className="text-[13px] text-gray-500 max-w-[300px] leading-relaxed">{t('completion.subtitle')}</p>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function BuyerProfileModal({ isOpen, onClose, onSave }: BuyerProfileModalProps) {
  const TOTAL = 5;
  const t = useTranslations('buyerProfile');
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<BuyerProfileData>(INITIAL_DATA);
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load existing profile when modal opens for a signed-in user
  useEffect(() => {
    if (!isOpen || !user) return;
    supabase
      .from('profiles')
      .select('buyer_profile')
      .eq('id', user.id)
      .single()
      .then(({ data: profile }) => {
        if (profile?.buyer_profile) {
          setData(profile.buyer_profile as BuyerProfileData);
        }
      });
  }, [isOpen, user]);

  // Build the step label for the current step 4 variant
  const step4Key = data.buyerType === 'mbi' ? 'step4mbi'
    : data.buyerType === 'financial' ? 'step4financial'
    : 'step4strategic';
  const step4ShortLabel = data.buyerType ? t(`${step4Key}.shortLabel`) : '';

  const staticStepNames = t('stepNames') as unknown as string[];
  const stepLabels = [
    staticStepNames[0] ?? '',
    staticStepNames[1] ?? '',
    staticStepNames[2] ?? '',
    step4ShortLabel,
    staticStepNames[3] ?? '',
  ];

  // Step title/subtitle
  const stepMeta = (() => {
    if (step === 4) {
      return { title: t(`${step4Key}.title`), subtitle: t(`${step4Key}.subtitle`) };
    }
    const keys: Record<number, string> = { 1: 'step1', 2: 'step2', 3: 'step3', 5: 'step5' };
    const k = keys[step];
    return { title: t(`${k}.title`), subtitle: t(`${k}.subtitle`) };
  })();

  const update = useCallback((key: keyof BuyerProfileData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  }, []);

  const canProceed = step === 1 ? data.buyerType !== '' : true;
  const scrollTop = () => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });

  const handleNext = async () => {
    if (step < TOTAL) { setStep(s => s + 1); scrollTop(); return; }
    // Final step — save to Supabase if signed in
    setSaving(true);
    if (user) {
      await supabase
        .from('profiles')
        .update({ buyer_profile: data })
        .eq('id', user.id);
    }
    setSaving(false);
    setCompleted(true);
    onSave?.(data);
  };
  const handleBack = () => { if (step > 1) { setStep(s => s - 1); scrollTop(); } };
  const handleClose = () => { setStep(1); setData(INITIAL_DATA); setCompleted(false); onClose(); };

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
        .bpm-root { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .bpm-mono { font-family: 'DM Mono', 'Courier New', monospace; }
        .bpm-slider {
          position: absolute; pointer-events: none;
          -webkit-appearance: none; appearance: none;
          background: transparent; width: 100%; height: 20px; margin: 0; padding: 0;
        }
        .bpm-slider::-webkit-slider-thumb {
          pointer-events: all; -webkit-appearance: none;
          width: 16px; height: 16px; border-radius: 50%;
          background: #1a1a1a; cursor: grab;
          border: 2.5px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.08);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .bpm-slider:active::-webkit-slider-thumb {
          cursor: grabbing; transform: scale(1.25);
          box-shadow: 0 2px 8px rgba(0,0,0,0.25), 0 0 0 3px rgba(26,26,26,0.12);
        }
        .bpm-slider::-moz-range-thumb {
          pointer-events: all; width: 16px; height: 16px; border-radius: 50%;
          background: #1a1a1a; cursor: grab; border: 2.5px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
        }
        .bpm-slider::-webkit-slider-runnable-track,
        .bpm-slider::-moz-range-track { background: transparent; }
        @keyframes bpm-float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-8px) rotate(2deg); }
        }
        .bpm-celebrate { animation: bpm-float 2.4s ease-in-out infinite; }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
        <div
          className="bpm-root relative bg-white rounded-2xl flex flex-col w-full animate-fadeIn"
          style={{ maxWidth: 580, maxHeight: '90vh', boxShadow: '0 25px 80px rgba(0,0,0,0.12), 0 4px 20px rgba(0,0,0,0.06)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[13px] font-bold leading-none">K</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 leading-none mb-0.5">
                    {t('modalTitle')}
                  </p>
                  {!completed && (
                    <p className="text-[11px] text-gray-400">
                      {/* "Step X of Y · Label" — build inline to avoid extra translation keys */}
                      Step {step} of {TOTAL}&nbsp;·&nbsp;{stepLabels[step - 1]}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {!completed && (
              <div className="flex gap-1">
                {Array.from({ length: TOTAL }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-[3px] rounded-full transition-colors duration-300"
                    style={{ backgroundColor: i < step ? '#1a1a1a' : '#e5e5e5' }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto px-6 py-5">
            {completed ? (
              <CompletionScreen />
            ) : (
              <>
                <div className="mb-5">
                  <h2 className="text-[20px] font-bold text-gray-900 leading-tight">{stepMeta.title}</h2>
                  <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">{stepMeta.subtitle}</p>
                </div>
                {step === 1 && <StepBuyerType value={data.buyerType} onChange={v => update('buyerType', v)} />}
                {step === 2 && <StepSearchProfile data={data} update={update} />}
                {step === 3 && <StepFinancials data={data} update={update} />}
                {step === 4 && data.buyerType === 'mbi'       && <StepMBI data={data} update={update} />}
                {step === 4 && data.buyerType === 'financial'  && <StepFinancialInvestor data={data} update={update} />}
                {step === 4 && data.buyerType === 'strategic'  && <StepStrategic data={data} update={update} />}
                {step === 5 && <StepPreferences data={data} update={update} />}
              </>
            )}
          </div>

          {/* Footer */}
          {!completed && (
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                className={cn(
                  'px-4 py-2 rounded-xl text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all',
                  step === 1 && 'opacity-0 pointer-events-none',
                )}
              >
                {t('back')}
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed || saving}
                className={cn(
                  'px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all duration-150',
                  step === TOTAL ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-900 hover:bg-gray-700',
                  (!canProceed || saving) && 'opacity-40 cursor-not-allowed',
                )}
              >
                {step === TOTAL ? (saving ? '...' : t('save')) : t('next')}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
