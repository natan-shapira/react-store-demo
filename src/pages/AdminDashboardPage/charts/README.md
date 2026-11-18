# Admin charts

Shared chart components for the admin sections, one folder per component (for example `BarChart/BarChart.tsx`).

A chart receives data that is already shaped for it and only draws it. It does not fetch data or know whether the data comes from DummyJSON, from sample data or from the project's own server; the section page connects the data hook, the transform and the chart.

Charts are imported only by admin pages, so a chart library ends up in the admin chunks and not in the bundle every user downloads.
