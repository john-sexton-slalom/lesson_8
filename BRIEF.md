# FastForward Logistics Operations Dashboard

## Summary

FastForward Logistics is a mid-size freight and supply chain company. Its operations team needs a single internal dashboard for leadership meetings to review shipment volume, on-time delivery, regional performance, and open exceptions.

## Data

Use the local JSON dataset at `src/data/metrics.json`. It contains monthly synthetic records for Jan-Dec 2025, including:

- Shipment and on-time shipment counts by region
- Total freight weight by month, used to derive average shipment weight
- Month-end open exception counts by category

Monthly and yearly shipment totals, on-time rates, late shipments, and regional rates are derived from shipment counts. Yearly on-time rates are shipment-weighted. Average shipment weight is total freight weight divided by shipment count. Open exceptions are month-end snapshots; when viewing the full year, the summary card shows the latest available snapshot rather than summing snapshots across months.

## Layout

- Dark Vuetify dashboard with a FastForward Logistics title and month picker.
- Four summary cards: shipments, on-time delivery, late shipments, and open exceptions.
- Monthly charts for shipment volume and on-time delivery.
- Regional on-time performance and open exceptions by category.
- Monthly shipments by region and average shipment weight.
- Responsive Vuetify grid using `v-container`, `v-row`, and `v-col`.

## Interactions

- The month picker defaults to all months.
- Summary cards display selected-month metrics or full-year totals and weighted rates.
- Charts retain the full-year context; selecting a month emphasizes it in monthly charts and updates regional performance.
- Summary-card trend indicators compare against the previous month. The full-year open-exception card uses the latest month-end snapshot.

## Technology

- Vue 3 + TypeScript + Vuetify 3
- Chart.js via vue-chartjs
- Local fake data only; no API calls
- Single-page dashboard