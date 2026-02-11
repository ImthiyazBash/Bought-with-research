'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { HamburgTarget } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from '@/lib/i18n-context';

interface FinancialChartsProps {
  company: HamburgTarget;
}

const COLORS = ['#FF385C', '#00A699', '#484848', '#767676', '#FFAA00'];

export default function FinancialCharts({ company }: FinancialChartsProps) {
  const t = useTranslations();
  // Balance Sheet Data
  const balanceSheetData = [
    {
      name: 'Balance Sheet',
      Equity: company.equity_eur || 0,
      Liabilities: company.liabilities_eur || 0,
    },
  ];

  // Asset Breakdown Data
  const assetBreakdownData = [
    { name: 'Cash', value: company.cash_assets_eur || 0 },
    { name: 'Receivables', value: company.receivables_eur || 0 },
    {
      name: 'Other Assets',
      value: Math.max(
        0,
        (company.total_assets_eur || 0) -
          (company.cash_assets_eur || 0) -
          (company.receivables_eur || 0)
      ),
    },
  ].filter((item) => item.value > 0);

  // Profitability Data
  const profitabilityData = [
    {
      name: 'Net Income',
      value: company.net_income_eur || 0,
      fill: (company.net_income_eur || 0) >= 0 ? '#10B981' : '#EF4444',
    },
    {
      name: 'Retained Earnings',
      value: company.retained_earnings_eur || 0,
      fill: (company.retained_earnings_eur || 0) >= 0 ? '#00A699' : '#EF4444',
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.fill || entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
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
    name,
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
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-8">
      {/* Balance Sheet Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('charts.balanceSheetStructure')}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {t('charts.totalAssets')}: {formatCurrency(company.total_assets_eur)}
        </p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={balanceSheetData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                type="number"
                tickFormatter={(value) => formatCurrency(value)}
                fontSize={12}
              />
              <YAxis type="category" dataKey="name" fontSize={12} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Equity" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Liabilities" stackId="a" fill="#EF4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500" />
            <span>{t('charts.equity')}: {formatCurrency(company.equity_eur)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500" />
            <span>{t('charts.liabilities')}: {formatCurrency(company.liabilities_eur)}</span>
          </div>
        </div>
      </div>

      {/* Asset Breakdown */}
      {assetBreakdownData.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('charts.assetBreakdown')}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetBreakdownData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetBreakdownData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Profitability */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('charts.profitabilityMetrics')}
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={profitabilityData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {profitabilityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
