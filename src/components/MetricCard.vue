<script setup lang="ts">
type TrendDirection = 'up' | 'down' | 'flat'
type TrendColor = 'success' | 'error' | 'info'

defineProps<{
  label: string
  value: string
  change: string
  trendDirection: TrendDirection
  trendColor: TrendColor
  icon: string
  color: string
}>()
</script>

<template>
  <v-card rounded="xl" class="summary-card h-100" variant="tonal">
    <v-card-item class="pb-2">
      <template #prepend>
        <v-avatar :color="color" size="42">
          <v-icon :icon="icon" color="white" />
        </v-avatar>
      </template>
      <v-card-title class="text-subtitle-2 text-medium-emphasis">{{ label }}</v-card-title>
    </v-card-item>

    <v-card-text class="pt-0">
      <div class="d-flex justify-space-between align-end">
        <div class="text-h5 font-weight-bold">{{ value }}</div>
        <v-chip
          :color="trendColor"
          size="small"
          variant="tonal"
          class="ml-2"
        >
          <v-icon
            :icon="
              trendDirection === 'up'
                ? 'mdi-arrow-up'
                : trendDirection === 'down'
                  ? 'mdi-arrow-down'
                  : 'mdi-minus'
            "
            size="16"
            class="mr-1"
          />
          {{ change }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>
