# Specification

## Summary
**Goal:** Build a fully client-side EDA (Exploratory Data Analysis) dashboard with CSV upload, interactive data filtering, multiple chart types, a rule-based chatbot, and a dark/light theme toggle.

**Planned changes:**
- CSV file upload with client-side parsing; display first 5 rows preview, descriptive statistics table (count, mean, std, min, max, quartiles), and summary cards (total rows, total columns, missing values)
- Missing value handler section (visible only when missing values exist) with dropdown for Drop rows / Fill with mean / Fill with median, Apply button, and success notification; summary cards update after applying
- Sidebar with Filter Data section: numeric column selector and range slider; filtered dataset reflected in all tables and charts; sidebar collapses to hamburger menu on mobile
- Visualization Hub with chart type dropdown supporting: Histogram, Boxplot, Scatter, Line, Bar, Violin, Heatmap (correlation matrix), Pie, Treemap, and 3D Scatter; axis column selectors where applicable; all charts use the filtered dataset
- Light/Dark theme toggle in the top nav or sidebar; dark mode uses #0E1117 background with #4CAF50 green accent; light mode uses white/light-gray with same green accent; theme persists during session
- Rule-based AI-style chatbot panel (floating button opens drawer); answers questions about row/column count, column names, mean/min/max/std, and missing value counts derived entirely from the loaded dataset; fallback message for unrecognized queries
- Fully mobile-responsive layout: horizontally scrollable tables, responsive charts, touch-friendly tap targets (min 44px), no horizontal overflow at 375px+
- Cohesive dark-tech visual theme: deep charcoal base, vivid green accents, modern sans-serif UI text, monospace data labels, subtle card borders and elevation

**User-visible outcome:** Users can upload a CSV file, explore and filter their data, view 10 chart types, handle missing values, and ask natural language questions about their dataset — all entirely in the browser with no backend, in a polished dark/light themed interface.
