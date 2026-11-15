<script setup lang="ts">
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  ArcElement,
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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler)

const stats = [
  { label: 'Monthly revenue', value: '$84.2K', change: '+18.2%', icon: 'mdi-cash-register', color: 'primary' },
  { label: 'Active users', value: '24,860', change: '+8.1%', icon: 'mdi-account-group', color: 'success' },
  { label: 'Conversion rate', value: '6.4%', change: '+1.7%', icon: 'mdi-chart-line', color: 'warning' },
  { label: 'Support tickets', value: '318', change: '-12.3%', icon: 'mdi-ticket-confirmation', color: 'info' },
]

const revenueData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Revenue',
      data: [4200, 5200, 6100, 7000, 7600, 8600, 9400],
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.18)',
      fill: true,
      tension: 0.35,
      borderWidth: 3,
      pointBackgroundColor: '#8b5cf6',
      pointRadius: 4,
    },
  ],
}

const trafficData = {
  labels: ['North', 'South', 'West', 'East'],
  datasets: [
    {
      label: 'Visitors',
      data: [980, 1240, 1050, 1420],
      backgroundColor: ['#8b5cf6', '#34d399', '#fbbf24', '#38bdf8'],
      borderRadius: 8,
    },
  ],
}

const segmentData = {
  labels: ['Product', 'Marketing', 'Support', 'Sales'],
  datasets: [
    {
      data: [42, 28, 18, 12],
      backgroundColor: ['#8b5cf6', '#34d399', '#fbbf24', '#38bdf8'],
      borderWidth: 0,
    },
  ],
}

const lineOptions = {
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
      ticks: { color: '#cbd5e1', callback: (value: string | number) => `$${value}` },
    },
  },
}

const barOptions = {
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

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#e2e8f0',
        usePointStyle: true,
        padding: 16,
      },
    },
  },
}

const actions = [
  { title: 'Launch campaign', detail: 'Quarterly brand push scheduled for this week', icon: 'mdi-bullhorn', color: 'primary' },
  { title: 'Review onboarding', detail: '3 drop-off points identified in the funnel', icon: 'mdi-clipboard-check', color: 'success' },
  { title: 'Resolve support queue', detail: '18 tickets remain above SLA target', icon: 'mdi-headset', color: 'warning' },
]
</script>

<template>
  <v-container fluid class="dashboard pa-6">
    <v-row class="mb-4" align="center" justify="space-between">
      <v-col cols="12" md="8">
        <div class="text-overline text-primary mb-2">Overview</div>
        <h1 class="text-h3 font-weight-bold mb-0">My dashboard</h1>
      </v-col>
      <v-col cols="12" md="4" class="d-flex justify-md-end">
        <v-btn color="primary" prepend-icon="mdi-plus" size="large">New report</v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" md="3">
        <v-card rounded="xl" class="h-100" variant="tonal">
          <v-card-item class="pb-2">
            <template #prepend>
              <v-avatar :color="stat.color" size="42">
                <v-icon :icon="stat.icon" color="white" />
              </v-avatar>
            </template>
            <v-card-title class="text-subtitle-2 text-medium-emphasis">{{ stat.label }}</v-card-title>
          </v-card-item>

          <v-card-text class="pt-0">
            <div class="d-flex align-center justify-space-between">
              <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
              <v-chip color="success" size="small" variant="tonal">{{ stat.change }}</v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card rounded="xl" class="pa-4 h-100">
          <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="text-h6 font-weight-bold mb-0">Performance</h2>
            <v-chip color="primary" size="small" variant="flat">+12.4%</v-chip>
          </div>
          <div style="height: 320px">
            <Line :data="revenueData" :options="lineOptions" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card rounded="xl" class="pa-4 h-100">
          <h2 class="text-h6 font-weight-bold mb-4">Audience mix</h2>
          <div style="height: 260px">
            <Doughnut :data="segmentData" :options="doughnutOptions" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="7">
        <v-card rounded="xl" class="pa-4">
          <div class="d-flex justify-space-between align-center mb-4">
            <h2 class="text-h6 font-weight-bold mb-0">Regional traffic</h2>
            <v-btn variant="text" size="small">View all</v-btn>
          </div>
          <div style="height: 280px">
            <Bar :data="trafficData" :options="barOptions" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card rounded="xl" class="pa-4 h-100">
          <h2 class="text-h6 font-weight-bold mb-4">Priority actions</h2>
          <v-list bg-color="transparent" density="comfortable">
            <v-list-item v-for="item in actions" :key="item.title" class="px-0">
              <template #prepend>
                <v-avatar :color="item.color" size="40">
                  <v-icon :icon="item.icon" color="white" />
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.detail }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
