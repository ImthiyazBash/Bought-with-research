'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { HamburgTarget, ParsedShareholder } from '@/lib/types';
import { parseShareholders, getScoreVariant } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n-context';
import Badge from './ui/Badge';

interface ShareholderInfoProps {
  company: HamburgTarget;
}

const COLORS = ['#FF385C', '#00A699', '#484848', '#767676', '#FFAA00', '#7B68EE', '#20B2AA'];

export default function ShareholderInfo({ company }: ShareholderInfoProps) {
  const t = useTranslations();
  const shareholders = parseShareholders(company);

  if (shareholders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('shareholders.title')}
        </h3>
        <p className="text-gray-500 text-sm">
          {t('shareholders.noData')}
        </p>
      </div>
    );
  }

  const highRiskCount = shareholders.filter(s => s.nachfolgeScore >= 10).length;
  const mediumRiskCount = shareholders.filter(s => s.nachfolgeScore >= 7 && s.nachfolgeScore < 10).length;

  // Prepare pie chart data for ownership
  const ownershipData = shareholders
    .filter(s => s.percentage !== null && s.percentage > 0)
    .map((s, index) => ({
      name: s.name,
      value: s.percentage!,
      color: COLORS[index % COLORS.length],
    }));

  const hasOwnershipData = ownershipData.length > 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-primary font-semibold">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('shareholders.title')}
        </h3>
        <div className="flex gap-2">
          {highRiskCount > 0 && (
            <Badge variant="high">
              {t('score.highCount').replace('{count}', highRiskCount.toString())}
            </Badge>
          )}
          {mediumRiskCount > 0 && (
            <Badge variant="medium">
              {t('score.mediumCount').replace('{count}', mediumRiskCount.toString())}
            </Badge>
          )}
        </div>
      </div>

      {/* Summary Alert */}
      {highRiskCount > 0 && (
        <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-medium text-emerald-800">
                {t('shareholders.highOpportunity')}
              </p>
              <p className="text-sm text-emerald-700 mt-1">
                {highRiskCount === 1
                  ? t('shareholders.highOpportunityDescriptionSingle')
                  : t('shareholders.highOpportunityDescriptionMultiple').replace('{count}', highRiskCount.toString())}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ownership Pie Chart */}
      {hasOwnershipData && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Ownership Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ownershipData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={90}
                  innerRadius={45}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {ownershipData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  align="center"
                  verticalAlign="bottom"
                  formatter={(value: string, entry: any) => (
                    <span className="text-sm text-gray-700">
                      {value} ({entry.payload.value}%)
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Shareholder Table */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">{t('shareholders.shareholderDetails')}</h4>
        <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {t('shareholders.name')}
                </th>
                {hasOwnershipData && (
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {t('shareholders.ownership')}
                  </th>
                )}
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {t('shareholders.dateOfBirth')}
                </th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {t('shareholders.age')}
                </th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {t('score.label')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shareholders.map((shareholder, index) => (
                <ShareholderRow
                  key={index}
                  shareholder={shareholder}
                  color={COLORS[index % COLORS.length]}
                  showOwnership={hasOwnershipData}
                  t={t}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score Explanation */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 font-medium mb-2">
          {t('score.indicators')}
        </p>
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-gray-600">{t('score.high')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-gray-600">{t('score.medium')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-600">{t('score.low')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareholderRow({
  shareholder,
  color,
  showOwnership,
  t,
}: {
  shareholder: ParsedShareholder;
  color: string;
  showOwnership: boolean;
  t: (key: string) => string;
}) {
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {shareholder.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-gray-900">{shareholder.name}</span>
        </div>
      </td>
      {showOwnership && (
        <td className="py-4 px-4 text-center whitespace-nowrap">
          <span className="font-semibold text-gray-900">
            {shareholder.percentage !== null ? `${shareholder.percentage}%` : t('common.na')}
          </span>
        </td>
      )}
      <td className="py-4 px-4 text-gray-600 whitespace-nowrap">
        {shareholder.dob || t('shareholders.unknown')}
      </td>
      <td className="py-4 px-4 text-center whitespace-nowrap">
        <span
          className={`font-semibold ${
            shareholder.nachfolgeScore >= 10
              ? 'text-emerald-600'
              : shareholder.nachfolgeScore >= 7
              ? 'text-amber-600'
              : 'text-red-600'
          }`}
        >
          {shareholder.age !== null ? `${shareholder.age} ${t('common.years')}` : t('shareholders.unknown')}
        </span>
      </td>
      <td className="py-4 px-4 text-center whitespace-nowrap">
        <Badge variant={getScoreVariant(shareholder.nachfolgeScore)}>
          {shareholder.nachfolgeScore}/10
        </Badge>
      </td>
    </tr>
  );
}
