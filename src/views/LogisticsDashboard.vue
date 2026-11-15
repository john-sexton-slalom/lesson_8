<script setup lang="ts">
import { computed, ref } from 'vue'
import { Bar, Line } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import type { ScriptableLineSegmentContext, TooltipItem } from 'chart.js'
import MetricCard from '../components/MetricCard.vue'
import metricsData from '../data/metrics.json'

type ExceptionCategory = 'In-transit delay' | 'Pickup issue' | 'Documentation' | 'Damage'

type RegionMetric = {
  name: string
  shipments: number
  onTimeShipments: number
}

type LogisticsMonth = {
  month: string
  freightWeightLbs: number
  regions: RegionMetric[]
  exceptionCategories: Record<ExceptionCategory, number>
}

type TrendDirection = 'up' | 'down' | 'flat'
type TrendColor = 'success' | 'error' | 'info'

type SummaryCard = {
  label: string
  value: string
  change: string
  trendDirection: TrendDirection
  trendColor: TrendColor
  icon: string
  color: string
}

const metrics = metricsData as LogisticsMonth[]
const selectedMonth = ref('all')
const categoryColors: Record<ExceptionCategory, { color: string; muted: string }> = {
  'In-transit delay': { color: 'rgba(139, 92, 246, 0.9)', muted: 'rgba(139, 92, 246, 0.24)' },
  'Pickup issue': { color: 'rgba(56, 189, 248, 0.9)', muted: 'rgba(56, 189, 248, 0.24)' },
  Documentation: { color: 'rgba(251, 191, 36, 0.9)', muted: 'rgba(251, 191, 36, 0.24)' },
  Damage: { color: 'rgba(248, 113, 113, 0.9)', muted: 'rgba(248, 113, 113, 0.24)' },
}
const categoryKeys = Object.keys(categoryColors) as ExceptionCategory[]
const regionColors: Record<string, { color: string; muted: string }> = {
  East: { color: 'rgba(139, 92, 246, 0.9)', muted: 'rgba(139, 92, 246, 0.24)' },
  Central: { color: 'rgba(56, 189, 248, 0.9)', muted: 'rgba(56, 189, 248, 0.24)' },
  West: { color: 'rgba(52, 211, 153, 0.9)', muted: 'rgba(52, 211, 153, 0.24)' },
  South: { color: 'rgba(251, 191, 36, 0.9)', muted: 'rgba(251, 191, 36, 0.24)' },
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler)

const monthOptions = [
  { title: 'All months', value: 'all' },
  ...metrics.map((entry) => ({ title: entry.month, value: entry.month })),
]

const numberFormatter = new Intl.NumberFormat('en-US')
const formatNumber = (value: number) => numberFormatter.format(value)

const getMonthTotals = (entry: LogisticsMonth) => {
  const shipments = entry.regions.reduce((sum, region) => sum + region.shipments, 0)
  const onTimeShipments = entry.regions.reduce((sum, region) => sum + region.onTimeShipments, 0)
  const openExceptions = categoryKeys.reduce(
    (sum, category) => sum + entry.exceptionCategories[category],
    0,
  )

  return {
    shipments,
    onTimeShipments,
    onTimeRate: (onTimeShipments / shipments) * 100,
    lateShipments: shipments - onTimeShipments,
    openExceptions,
  }
}

const selectedMonthIndex = computed(() =>
  selectedMonth.value === 'all' ? -1 : metrics.findIndex((entry) => entry.month === selectedMonth.value),
)

const selectedEntry = computed(() =>
  selectedMonth.value === 'all'
    ? metrics[metrics.length - 1]
    : (metrics.find((entry) => entry.month === selectedMonth.value) ?? metrics[0]),
)

const selectedEntryIndex = computed(() =>
  selectedMonth.value === 'all'
    ? metrics.length - 1
    : Math.max(metrics.findIndex((entry) => entry.month === selectedMonth.value), 0),
)

const previousEntry = computed(() =>
  selectedEntryIndex.value > 0 ? metrics[selectedEntryIndex.value - 1] : null,
)

const allYearTotals = computed(() => {
  const totals = metrics.map(getMonthTotals)
  const shipments = totals.reduce((sum, month) => sum + month.shipments, 0)
  const onTimeShipments = totals.reduce((sum, month) => sum + month.onTimeShipments, 0)

  return {
    shipments,
    onTimeShipments,
    onTimeRate: (onTimeShipments / shipments) * 100,
    lateShipments: shipments - onTimeShipments,
  }
})

const getTrend = (
  current: number,
  previous: number | null,
  preference: 'neutral' | 'higher' | 'lower',
  format: 'percent' | 'points' = 'percent',
) => {
  if (previous === null) {
    return {
      change: 'Baseline',
      trendDirection: 'flat' as const,
      trendColor: 'info' as const,
    }
  }

  const difference = current - previous
  const trendDirection: TrendDirection =
    difference === 0 ? 'flat' : difference > 0 ? 'up' : 'down'
  const trendColor: TrendColor =
    trendDirection === 'flat' || preference === 'neutral'
      ? 'info'
      : (trendDirection === 'up') === (preference === 'higher')
        ? 'success'
        : 'error'
  const change =
    format === 'points'
      ? `${difference > 0 ? '+' : ''}${difference.toFixed(1)} pp`
      : `${difference > 0 ? '+' : ''}${((difference / previous) * 100).toFixed(1)}%`

  return { change, trendDirection, trendColor }
}

const summaryCards = computed<SummaryCard[]>(() => {
  const allMonthsSelected = selectedMonth.value === 'all'
  const displayTotals = allMonthsSelected ? allYearTotals.value : getMonthTotals(selectedEntry.value)
  const exceptionSnapshot = getMonthTotals(selectedEntry.value).openExceptions
  const currentMonthTotals = getMonthTotals(selectedEntry.value)
  const previousMonthTotals = previousEntry.value ? getMonthTotals(previousEntry.value) : null
  const currentForTrend = allMonthsSelected ? getMonthTotals(metrics[metrics.length - 1]) : currentMonthTotals
  const previousForTrend = allMonthsSelected
    ? getMonthTotals(metrics[metrics.length - 2])
    : previousMonthTotals

  const trendFor = (
    key: 'shipments' | 'onTimeRate' | 'lateShipments' | 'openExceptions',
    preference: 'neutral' | 'higher' | 'lower',
    format: 'percent' | 'points' = 'percent',
  ) => getTrend(
    currentForTrend[key],
    previousForTrend ? previousForTrend[key] : null,
    preference,
    format,
  )

  return [
    {
      label: 'Shipments',
      value: formatNumber(displayTotals.shipments),
      ...trendFor('shipments', 'neutral'),
      icon: 'mdi-truck-fast',
      color: 'primary',
    },
    {
      label: 'On-time delivery',
      value: `${displayTotals.onTimeRate.toFixed(1)}%`,
      ...trendFor('onTimeRate', 'higher', 'points'),
      icon: 'mdi-clock-check-outline',
      color: 'success',
    },
    {
      label: 'Late shipments',
      value: formatNumber(displayTotals.lateShipments),
      ...trendFor('lateShipments', 'lower'),
      icon: 'mdi-truck-alert-outline',
      color: 'warning',
    },
    {
      label: 'Open exceptions',
      value: formatNumber(exceptionSnapshot),
      ...trendFor('openExceptions', 'lower'),
      icon: 'mdi-alert-circle-outline',
      color: 'info',
    },
  ]
})

const chartLabels = metrics.map((entry) => entry.month.replace(' 2025', ''))

const shipmentChartData = computed(() => ({
  labels: chartLabels,
  datasets: [
    {
      label: 'Shipments',
      data: metrics.map((entry) => getMonthTotals(entry).shipments),
      backgroundColor: metrics.map((_, index) =>
        selectedMonthIndex.value < 0 || index === selectedMonthIndex.value
          ? 'rgba(139, 92, 246, 0.85)'
          : 'rgba(139, 92, 246, 0.2)',
      ),
      borderColor: metrics.map((_, index) =>
        selectedMonthIndex.value < 0 || index === selectedMonthIndex.value
          ? '#8b5cf6'
          : 'rgba(139, 92, 246, 0.35)',
      ),
      borderWidth: 2,
      borderRadius: 8,
      maxBarThickness: 30,
    },
  ],
}))

const onTimeChartData = computed(() => ({
  labels: chartLabels,
  datasets: [
    {
      label: 'On-time delivery',
      data: metrics.map((entry) => getMonthTotals(entry).onTimeRate),
      borderColor: '#34d399',
      segment: {
        borderColor: (context: ScriptableLineSegmentContext) =>
          selectedMonthIndex.value < 0 ||
          context.p0DataIndex === selectedMonthIndex.value ||
          context.p1DataIndex === selectedMonthIndex.value
            ? '#34d399'
            : 'rgba(148, 163, 184, 0.3)',
      },
      backgroundColor:
        selectedMonthIndex.value < 0 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(52, 211, 153, 0.04)',
      fill: true,
      borderWidth: 3,
      tension: 0.35,
      pointBackgroundColor: metrics.map((_, index) =>
        selectedMonthIndex.value < 0 || index === selectedMonthIndex.value
          ? '#34d399'
          : 'rgba(148, 163, 184, 0.3)',
      ),
      pointBorderColor: metrics.map((_, index) =>
        selectedMonthIndex.value < 0 || index === selectedMonthIndex.value
          ? '#34d399'
          : 'rgba(148, 163, 184, 0.3)',
      ),
      pointBorderWidth: 2,
      pointRadius: metrics.map((_, index) =>
        selectedMonthIndex.value < 0 ? 4 : index === selectedMonthIndex.value ? 7 : 2,
      ),
    },
  ],
}))

const regionalPerformance = computed(() => {
  const regions = metrics[0].regions.map(({ name }) => name)

  return regions.map((name) => {
    const sourceMonths =
      selectedMonth.value === 'all' ? metrics : [selectedEntry.value]
    const totals = sourceMonths.reduce(
      (accumulator, entry) => {
        const region = entry.regions.find((item) => item.name === name)
        if (region) {
          accumulator.shipments += region.shipments
          accumulator.onTimeShipments += region.onTimeShipments
        }
        return accumulator
      },
      { shipments: 0, onTimeShipments: 0 },
    )

    return {
      name,
      shipments: totals.shipments,
      onTimeRate: (totals.onTimeShipments / totals.shipments) * 100,
    }
  })
})

const regionalChartData = computed(() => ({
  labels: regionalPerformance.value.map((region) => region.name),
  datasets: [
    {
      label: 'On-time delivery',
      data: regionalPerformance.value.map((region) => region.onTimeRate),
      backgroundColor: 'rgba(56, 189, 248, 0.8)',
      borderColor: '#38bdf8',
      borderWidth: 1,
      borderRadius: 7,
      maxBarThickness: 34,
    },
  ],
}))

const shipmentByRegionChartData = computed(() => ({
  labels: chartLabels,
  datasets: metrics[0].regions.map(({ name }) => ({
    label: name,
    data: metrics.map((entry) => entry.regions.find((region) => region.name === name)?.shipments ?? 0),
    backgroundColor: metrics.map((_, index) =>
      selectedMonthIndex.value < 0 || index === selectedMonthIndex.value
        ? regionColors[name].color
        : regionColors[name].muted,
    ),
    borderRadius: 3,
    stack: 'regional-shipments',
  })),
}))

const averageShipmentWeightChartData = computed(() => ({
  labels: chartLabels,
  datasets: [
    {
      label: 'Average shipment weight',
      data: metrics.map((entry) => entry.freightWeightLbs / getMonthTotals(entry).shipments),
      borderColor: '#c084fc',
      segment: {
        borderColor: (context: ScriptableLineSegmentContext) =>
          selectedMonthIndex.value < 0 ||
          context.p0DataIndex === selectedMonthIndex.value ||
          context.p1DataIndex === selectedMonthIndex.value
            ? '#c084fc'
            : 'rgba(148, 163, 184, 0.3)',
      },
      backgroundColor:
        selectedMonthIndex.value < 0 ? 'rgba(192, 132, 252, 0.15)' : 'rgba(192, 132, 252, 0.04)',
      fill: true,
      borderWidth: 3,
      tension: 0.35,
      pointBackgroundColor: metrics.map((_, index) =>
        selectedMonthIndex.value < 0 || index === selectedMonthIndex.value
          ? '#c084fc'
          : 'rgba(148, 163, 184, 0.3)',
      ),
      pointBorderColor: metrics.map((_, index) =>
        selectedMonthIndex.value < 0 || index === selectedMonthIndex.value
          ? '#c084fc'
          : 'rgba(148, 163, 184, 0.3)',
      ),
      pointBorderWidth: 2,
      pointRadius: metrics.map((_, index) =>
        selectedMonthIndex.value < 0 ? 4 : index === selectedMonthIndex.value ? 7 : 2,
      ),
    },
  ],
}))

const exceptionChartData = computed(() => ({
  labels: chartLabels,
  datasets: categoryKeys.map((category) => ({
    label: category,
    data: metrics.map((entry) => entry.exceptionCategories[category]),
    backgroundColor: metrics.map((_, index) =>
      selectedMonthIndex.value < 0 || index === selectedMonthIndex.value
        ? categoryColors[category].color
        : categoryColors[category].muted,
    ),
    borderRadius: 3,
    stack: 'exceptions',
  })),
}))

const monthTickColor = (context: { tick: { value: number } }) =>
  selectedMonthIndex.value < 0 || context.tick.value === selectedMonthIndex.value
    ? '#e2e8f0'
    : '#64748b'

const monthlyChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: monthTickColor },
    },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.12)' },
      ticks: {
        color: '#cbd5e1',
        callback: (value: string | number) => numberFormatter.format(Number(value)),
      },
    },
  },
}

const onTimeChartOptions = {
  ...monthlyChartOptions,
  scales: {
    ...monthlyChartOptions.scales,
    y: {
      min: 90,
      max: 100,
      grid: { color: 'rgba(148, 163, 184, 0.12)' },
      ticks: {
        color: '#cbd5e1',
        callback: (value: string | number) => `${value}%`,
      },
    },
  },
}

const regionalChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: TooltipItem<'bar'>) => {
          const region = regionalPerformance.value[context.dataIndex]
          return `${(context.parsed.x ?? 0).toFixed(1)}% on time | ${formatNumber(region.shipments)} shipments`
        },
      },
    },
  },
  scales: {
    x: {
      min: 0,
      max: 100,
      grid: { color: 'rgba(148, 163, 184, 0.12)' },
      ticks: {
        color: '#cbd5e1',
        callback: (value: string | number) => `${value}%`,
      },
    },
    y: {
      grid: { display: false },
      ticks: { color: '#cbd5e1' },
    },
  },
}

const exceptionChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: '#cbd5e1', usePointStyle: true, padding: 18 },
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { color: monthTickColor },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.12)' },
      ticks: { color: '#cbd5e1' },
    },
  },
}

const shipmentByRegionChartOptions = {
  ...monthlyChartOptions,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: '#cbd5e1', usePointStyle: true, padding: 18 },
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: { color: monthTickColor },
    },
    y: {
      stacked: true,
      beginAtZero: true,
      grid: { color: 'rgba(148, 163, 184, 0.12)' },
      ticks: {
        color: '#cbd5e1',
        callback: (value: string | number) => numberFormatter.format(Number(value)),
      },
    },
  },
}

const averageShipmentWeightChartOptions = {
  ...monthlyChartOptions,
  scales: {
    ...monthlyChartOptions.scales,
    y: {
      min: 1200,
      max: 1800,
      grid: { color: 'rgba(148, 163, 184, 0.12)' },
      ticks: {
        color: '#cbd5e1',
        callback: (value: string | number) => `${numberFormatter.format(Number(value))} lb`,
      },
    },
  },
}
</script>

<template>
  <v-app-bar color="surface" flat height="80" class="px-4 border-b">
    <v-container fluid class="pa-0">
      <v-row align="center" justify="space-between" no-gutters>
        <v-col cols="12" md="6">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="42" class="mr-3">
              <v-icon icon="mdi-truck-fast" color="white" />
            </v-avatar>
            <div>
              <div class="text-overline text-primary">FastForward Logistics</div>
              <div class="text-h5 font-weight-bold">Operations dashboard</div>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="6" class="d-flex justify-md-end">
          <v-select
            v-model="selectedMonth"
            :items="monthOptions"
            item-title="title"
            item-value="value"
            density="comfortable"
            variant="outlined"
            hide-details
            class="month-picker"
            prepend-inner-icon="mdi-calendar"
            aria-label="Filter dashboard by month"
            style="max-width: 220px;"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>

  <v-main>
    <v-container class="py-8" fluid>
      <div class="mb-4 d-flex align-center justify-space-between flex-wrap ga-3">
        <div>
          <div class="text-overline text-medium-emphasis">Leadership overview · 2025</div>
          <h1 class="text-h4 font-weight-bold mb-1">
            {{ selectedMonth === 'all' ? 'Full-year operations' : selectedMonth }}
          </h1>
          <div class="text-body-2 text-medium-emphasis">
            Trend indicators compare with the prior month. Year view uses full-year shipment totals and the December exception snapshot.
          </div>
        </div>
        <v-chip color="primary" variant="tonal" prepend-icon="mdi-calendar-range" size="large">
          {{ selectedMonth === 'all' ? 'All months' : 'Monthly view' }}
        </v-chip>
      </div>

      <v-row class="mb-6">
        <v-col v-for="card in summaryCards" :key="card.label" cols="12" sm="6" md="3">
          <MetricCard
            :label="card.label"
            :value="card.value"
            :change="card.change"
            :trend-direction="card.trendDirection"
            :trend-color="card.trendColor"
            :icon="card.icon"
            :color="card.color"
          />
        </v-col>
      </v-row>

      <v-row class="mb-6">
        <v-col cols="12" lg="6">
          <v-card rounded="xl" class="pa-4 chart-card h-100">
            <div class="d-flex align-center justify-space-between mb-1">
              <h2 class="text-h6 font-weight-bold">Shipment volume</h2>
              <v-chip color="primary" size="small" variant="tonal">Shipments</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis mb-4">Monthly shipments across all regions</div>
            <div style="height: 300px">
              <Bar :data="shipmentChartData" :options="monthlyChartOptions" />
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card rounded="xl" class="pa-4 chart-card h-100">
            <div class="d-flex align-center justify-space-between mb-1">
              <h2 class="text-h6 font-weight-bold">On-time delivery</h2>
              <v-chip color="success" size="small" variant="tonal">Delivery rate</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis mb-4">Share of shipments delivered on time</div>
            <div style="height: 300px">
              <Line :data="onTimeChartData" :options="onTimeChartOptions" />
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="6">
          <v-card rounded="xl" class="pa-4 chart-card h-100">
            <div class="d-flex align-center justify-space-between mb-1">
              <h2 class="text-h6 font-weight-bold">Regional performance</h2>
              <v-chip color="info" size="small" variant="tonal">On-time rate</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              Shipment-weighted {{ selectedMonth === 'all' ? 'full-year' : selectedMonth }} delivery rate by region
            </div>
            <div style="height: 300px">
              <Bar :data="regionalChartData" :options="regionalChartOptions" />
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card rounded="xl" class="pa-4 chart-card h-100">
            <div class="d-flex align-center justify-space-between mb-1">
              <h2 class="text-h6 font-weight-bold">Open exceptions</h2>
              <v-chip color="warning" size="small" variant="tonal">Month-end backlog</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis mb-4">Open exception counts by category at month end</div>
            <div style="height: 300px">
              <Bar :data="exceptionChartData" :options="exceptionChartOptions" />
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2">
        <v-col cols="12" lg="6">
          <v-card rounded="xl" class="pa-4 chart-card h-100">
            <div class="d-flex align-center justify-space-between mb-1">
              <h2 class="text-h6 font-weight-bold">Monthly shipments by region</h2>
              <v-chip color="primary" size="small" variant="tonal">Shipments</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              Regional contribution to monthly shipment volume
            </div>
            <div style="height: 300px">
              <Bar :data="shipmentByRegionChartData" :options="shipmentByRegionChartOptions" />
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card rounded="xl" class="pa-4 chart-card h-100">
            <div class="d-flex align-center justify-space-between mb-1">
              <h2 class="text-h6 font-weight-bold">Average shipment weight</h2>
              <v-chip color="accent" size="small" variant="tonal">lb / shipment</v-chip>
            </div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              Shipment-weighted freight weight per shipment
            </div>
            <div style="height: 300px">
              <Line :data="averageShipmentWeightChartData" :options="averageShipmentWeightChartOptions" />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
