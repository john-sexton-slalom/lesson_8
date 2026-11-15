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
import metricsData from './data/metrics.json'

type MetricRow = {
  month: string
  revenue: number
  visitors: number
  conversions: number
  orders: number
}

const metrics = metricsData as MetricRow[]
const selectedMonth = ref('all')

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler)

const monthOptions = [
  { title: 'All months', value: 'all' },
  ...metrics.map((entry) => ({ title: entry.month, value: entry.month })),
]

const visibleRows = computed(() => {
  if (selectedMonth.value === 'all') {
    return metrics
  }

  return metrics.filter((entry) => entry.month === selectedMonth.value)
})

const currentEntry = computed(() => {
  if (visibleRows.value.length === 0) {
    return metrics[0]
  }

  return visibleRows.value[0]
})

const previousEntry = computed(() => {
  if (selectedMonth.value === 'all') {
    const index = metrics.length - 2
    return index >= 0 ? metrics[index] : null
  }

  const currentIndex = metrics.findIndex((entry) => entry.month === selectedMonth.value)
  return currentIndex > 0 ? metrics[currentIndex - 1] : null
})

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat('en-US')

const formatCurrency = (value: number) => currencyFormatter.format(value)
const formatCompactCurrency = (value: number) => compactCurrencyFormatter.format(value)
const formatNumber = (value: number) => numberFormatter.format(value)

const getChangePercent = (current: number, previous: number) => {
  if (!previous) return 0
  return ((current - previous) / previous) * 100
}

const getSummaryCards = computed(() => {
  const revenueTotal = visibleRows.value.reduce((sum, row) => sum + row.revenue, 0)
  const visitorsTotal = visibleRows.value.reduce((sum, row) => sum + row.visitors, 0)
  const ordersTotal = visibleRows.value.reduce((sum, row) => sum + row.orders, 0)
  const conversionAvg =
    visibleRows.value.reduce((sum, row) => sum + row.conversions, 0) / Math.max(visibleRows.value.length, 1)

  const comparison = selectedMonth.value === 'all' ? metrics[metrics.length - 1] : currentEntry.value
  const comparisonPrev = previousEntry.value ?? comparison

  return [
    {
      label: 'Revenue',
      value: selectedMonth.value === 'all' ? formatCompactCurrency(revenueTotal) : formatCurrency(currentEntry.value.revenue),
      change: `${getChangePercent(comparison.revenue, comparisonPrev.revenue).toFixed(1)}%`,
      direction: comparison.revenue >= comparisonPrev.revenue ? 'up' : 'down',
      icon: 'mdi-currency-usd',
      color: 'primary',
    },
    {
      label: 'Visitors',
      value: selectedMonth.value === 'all' ? formatNumber(visitorsTotal) : formatNumber(currentEntry.value.visitors),
      change: `${getChangePercent(comparison.visitors, comparisonPrev.visitors).toFixed(1)}%`,
      direction: comparison.visitors >= comparisonPrev.visitors ? 'up' : 'down',
      icon: 'mdi-account-group',
      color: 'success',
    },
    {
      label: 'Conversion rate',
      value: selectedMonth.value === 'all' ? `${conversionAvg.toFixed(1)}%` : `${currentEntry.value.conversions.toFixed(1)}%`,
      change: `${(comparison.conversions - comparisonPrev.conversions).toFixed(1)} pts`,
      direction: comparison.conversions >= comparisonPrev.conversions ? 'up' : 'down',
      icon: 'mdi-percent',
      color: 'warning',
    },
    {
      label: 'Orders',
      value: selectedMonth.value === 'all' ? formatNumber(ordersTotal) : formatNumber(currentEntry.value.orders),
      change: `${getChangePercent(comparison.orders, comparisonPrev.orders).toFixed(1)}%`,
      direction: comparison.orders >= comparisonPrev.orders ? 'up' : 'down',
      icon: 'mdi-bag-check',
      color: 'info',
    },
  ]
})

const chartRows = computed(() => {
  if (selectedMonth.value === 'all') {
    return metrics
  }

  return metrics.filter((entry) => entry.month === selectedMonth.value)
})

const revenueChartData = computed(() => ({
  labels: chartRows.value.map((row) => row.month.replace(' 2025', '')),
  datasets: [
    {
      label: 'Revenue',
      data: chartRows.value.map((row) => row.revenue),
      backgroundColor: 'rgba(139, 92, 246, 0.18)',
      borderColor: '#8b5cf6',
      borderWidth: 2,
      borderRadius: 10,
      maxBarThickness: 28,
    },
  ],
}))

const visitorChartData = computed(() => ({
  labels: chartRows.value.map((row) => row.month.replace(' 2025', '')),
  datasets: [
    {
      label: 'Visitors',
      data: chartRows.value.map((row) => row.visitors),
      borderColor: '#34d399',
      backgroundColor: 'rgba(52, 211, 153, 0.18)',
      fill: true,
      borderWidth: 3,
      tension: 0.35,
      pointBackgroundColor: '#34d399',
      pointRadius: 4,
    },
  ],
}))

const conversionChartData = computed(() => ({
  labels: chartRows.value.map((row) => row.month.replace(' 2025', '')),
  datasets: [
    {
      label: 'Conversion rate',
      data: chartRows.value.map((row) => row.conversions),
      borderColor: '#fbbf24',
      backgroundColor: 'rgba(251, 191, 36, 0.18)',
      fill: true,
      borderWidth: 3,
      tension: 0.35,
      pointBackgroundColor: '#fbbf24',
      pointRadius: 4,
    },
  ],
}))

const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#cbd5e1' },
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.12)' },
      ticks: { color: '#cbd5e1' },
    },
  },
}

const areaChartOptions = {
  ...baseChartOptions,
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#cbd5e1' },
    },
    y: {
      grid: { color: 'rgba(148, 163, 184, 0.12)' },
      ticks: {
        color: '#cbd5e1',
        callback: (value: string | number) => `${value}%`,
      },
    },
  },
}

const currentMonthLabel = computed(() => {
  if (selectedMonth.value === 'all') {
    return 'All months'
  }

  return selectedMonth.value
})
</script>

<template>
  <v-app class="dashboard-shell">
    <v-app-bar color="surface" flat height="80" class="px-4 border-b">
      <v-container fluid class="pa-0">
        <v-row align="center" justify="space-between" no-gutters>
          <v-col cols="12" md="6">
            <div class="d-flex align-center">
              <v-icon color="primary" icon="mdi-view-dashboard-outline" size="28" class="mr-3" />
              <div>
                <div class="text-overline text-primary">Performance</div>
                <div class="text-h5 font-weight-bold">My Dashboard</div>
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
              style="max-width: 220px;"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container class="py-8" fluid>
        <div class="mb-4 d-flex align-center justify-space-between flex-wrap gap-2">
          <div>
            <div class="text-overline text-medium-emphasis">Overview</div>
            <div class="text-h4 font-weight-bold">{{ currentMonthLabel }}</div>
          </div>
          <v-chip color="primary" variant="tonal" prepend-icon="mdi-trending-up" size="large">
            {{ selectedMonth === 'all' ? 'Year-to-date' : 'Monthly view' }}
          </v-chip>
        </div>

        <v-row class="mb-6">
          <v-col v-for="card in getSummaryCards" :key="card.label" cols="12" sm="6" md="3">
            <v-card rounded="xl" class="summary-card h-100" variant="tonal">
              <v-card-item class="pb-2">
                <template #prepend>
                  <v-avatar :color="card.color" size="42">
                    <v-icon :icon="card.icon" color="white" />
                  </v-avatar>
                </template>
                <v-card-title class="text-subtitle-2 text-medium-emphasis">{{ card.label }}</v-card-title>
              </v-card-item>

              <v-card-text class="pt-0">
                <div class="d-flex justify-space-between align-end">
                  <div class="text-h5 font-weight-bold">{{ card.value }}</div>
                  <v-chip
                    :color="card.direction === 'up' ? 'success' : 'error'"
                    size="small"
                    variant="tonal"
                    class="ml-2"
                  >
                    <v-icon :icon="card.direction === 'up' ? 'mdi-arrow-up' : 'mdi-arrow-down'" size="16" class="mr-1" />
                    {{ card.change }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-6">
          <v-col cols="12" lg="8">
            <v-card rounded="xl" class="pa-4 chart-card h-100">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="text-h6 font-weight-bold">Monthly revenue</div>
                <v-chip color="primary" size="small" variant="flat">USD</v-chip>
              </div>
              <div style="height: 320px">
                <Bar :data="revenueChartData" :options="baseChartOptions" />
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" lg="4">
            <v-card rounded="xl" class="pa-4 chart-card h-100">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="text-h6 font-weight-bold">Visitors</div>
                <v-chip color="success" size="small" variant="flat">Traffic</v-chip>
              </div>
              <div style="height: 320px">
                <Line :data="visitorChartData" :options="baseChartOptions" />
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <v-card rounded="xl" class="pa-4 chart-card">
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="text-h6 font-weight-bold">Conversion trend</div>
                <v-chip color="warning" size="small" variant="flat">% conversion</v-chip>
              </div>
              <div style="height: 280px">
                <Line :data="conversionChartData" :options="areaChartOptions" />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>
