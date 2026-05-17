# Lesson 2 Lab — Data Analysis Report
**Student Name:** Abhishek  
**Course:** CSE 300 – Fundamentals of Cloud Computing and Virtualization  
**Institution:** Model Institute of Technology (MIT Nepal)  
**Instructor:** Prof. Sugat Man Shakya  
**Date:** [Submission Date]

---

## 1. Introduction and Dataset Generation

*(Write 1–2 paragraphs here — explain:)*
- You created a **synthetic electronics retail dataset** called "NovaTech Retail Systems"
- Dataset covers 7 cities: London, New York, Tokyo, Dubai, Sydney, Berlin, Kathmandu
- 7 products: Smart TV, Gaming Laptop, Wireless Earbuds, Tablet Pro, Smart Watch, 4K Camera, Gaming Console
- Used **NumPy random number generator** (`np.random.seed(2025)`) to generate 4,000 rows each across two sources
- Source A saved as **JSON** (nested format, web API simulation) with intentional noise: string prices ("REFUNDED", "$PENDING"), null cities, corrupted product names, 150 duplicate rows
- Source B saved as **CSV** (flat POS log format) with intentional noise: negative unit prices, missing quantities ("QTY_ERR"), inconsistent date format (dd/mm/yyyy)
- Both files read back and standardized, then merged into one clean DataFrame

**[📸 SCREENSHOT 1 — Cell 3 output: "Source A (JSON) saved" confirmation]**  
**[📸 SCREENSHOT 2 — Cell 4 output: "Source B (CSV) saved" confirmation]**

---

## 2. Exploratory Data Analysis (EDA)

*(Summarize what EDA revealed — refer to screenshots)*

- `.info()` showed that `price` in JSON source was `object` dtype instead of `float` due to string mix-ups
- `.describe()` revealed negative `UNIT_PRICE` values (min = –$300) in CSV source
- `.isnull().sum()` found null cities and missing quantity fields
- `.nunique()` confirmed 7 products, 7 cities, 4 quarters

**[📸 SCREENSHOT 3 — Cell 7: .columns and .dtypes JSON]**  
**[📸 SCREENSHOT 4 — Cell 8: .columns and .dtypes CSV]**  
**[📸 SCREENSHOT 5 — Cell 9: Shape, Size, .info() JSON]**  
**[📸 SCREENSHOT 6 — Cell 10: Shape, Size, .info() CSV]**  
**[📸 SCREENSHOT 7 — Cell 11: .describe() both sources]**  
**[📸 SCREENSHOT 8 — Cell 12: Null/Missing Value Count]**  
**[📸 SCREENSHOT 9 — Cell 13: Malformed price strings identified]**  
**[📸 SCREENSHOT 10 — Cell 15: Boxplot of UNIT_PRICE (negative outliers)]**  
**[📸 SCREENSHOT 11 — Cell 16: Histogram of UNIT_PRICE]**

---

## 3. Transformation and Cleaning

*(Explain what was cleaned and why)*

- `pd.to_numeric(..., errors='coerce')` converted non-numeric prices/quantities to NaN
- `pd.to_datetime(..., dayfirst=True)` handled both date formats (yyyy-mm-dd and dd/mm/yyyy)
- Median imputation filled 5% of missing QUANTITY values
- Dropped: duplicate TXN_IDs, null CITY rows, "UNKNOWN" cities, negative prices, corrupted product names
- Feature Engineering added: `REVENUE = QUANTITY × UNIT_PRICE`, `QUARTER`, `YEAR`, `MONTH`, `WEEK`, `DAY`, `CITY_CODE`
- Store addresses assigned from City lookup table (supports Drill-Down)

**[📸 SCREENSHOT 12 — Cell 18: Merged dataset shape]**  
**[📸 SCREENSHOT 13 — Cell 21: Records removed per cleaning step]**  
**[📸 SCREENSHOT 14 — Cell 22: Feature engineering output (head 6)]**  
**[📸 SCREENSHOT 15 — Cell 23: City → Store Address mapping table]**

---

## 4. OLAP Operations

### Dimensions and Measures
*(Copy output from Cell 24 here or screenshot it)*

**[📸 SCREENSHOT 16 — Cell 24: Dimensions and Measures identified]**  
**[📸 SCREENSHOT 17 — Cell 25: Mean and Max of REVENUE]**

### Star Schema
*(Explain: Fact table at center, 3 dimension tables directly connected — flat, denormalized)*

**[📸 SCREENSHOT 18 — Cell 28: Star Schema diagram]**

### Snowflake Schema
*(Explain: dim_location split into dim_city → dim_store; dim_product split to add CATEGORY)*

**[📸 SCREENSHOT 19 — Cell 29: Snowflake dim_city and dim_store tables]**  
**[📸 SCREENSHOT 20 — Cell 30: Snowflake Schema diagram]**

### Fact Constellation Schema
*(Explain: Two fact tables — FACT_SALES and FACT_INVENTORY — sharing dim_product and dim_city)*

**[📸 SCREENSHOT 21 — Cell 31: Fact Constellation Schema diagram]**

### SLICE Operation
*(Explain: Fixed one dimension — QUARTER == 'Q1' — to see only Q1 sales across all products and cities)*

**[📸 SCREENSHOT 22 — Cell 33: SLICE output — row count, Q1 total revenue]**  
**[📸 SCREENSHOT 23 — Cell 34: SLICE bar chart — Q1 revenue by product]**

### DICE Operation
*(Explain: Fixed three dimensions simultaneously — Smart TV + London + Q1 — to isolate a sub-cube)*

**[📸 SCREENSHOT 24 — Cell 35: DICE output — matching rows, revenue, units sold]**  
**[📸 SCREENSHOT 25 — Cell 36: DICE bar chart — London store comparison]**

### DRILL-DOWN: City → Store Address
Give an example of a Drill-Down (moving from City to Store Address):

> "When a manager sees that **London** has the highest city-level revenue, they Drill-Down to see exactly which London store (12 Oxford St or 88 Regent Ave) is driving that revenue. This moves from the coarse City dimension to the fine Store Address dimension — revealing hidden granular detail that was invisible at the city level."

**[📸 SCREENSHOT 26 — Cell 37: City Level vs Store Address Level tables]**  
**[📸 SCREENSHOT 27 — Cell 38: Drill-Down side-by-side bar chart]**

### ROLL-UP: Daily → Yearly
Give an example of a Roll-Up (moving from Daily to Yearly totals):

> "When a manager needs a strategic view, they Roll-Up from individual daily transaction records (365 rows per year) → Monthly summaries (12 rows) → Quarterly totals (4 rows) → a single Yearly total. This aggregates fine-grained noise into a clean executive summary."

**[📸 SCREENSHOT 28 — Cell 39: Daily, Monthly, Quarterly, Yearly tables]**  
**[📸 SCREENSHOT 29 — Cell 40: Roll-Up multi-level bar charts]**

### PIVOT Operation
**[📸 SCREENSHOT 30 — Cell 41: Product × City Pivot Table Heatmap]**

### TOP-N Operation
**[📸 SCREENSHOT 31 — Cell 42: Top 3 Cities bar chart]**  
**[📸 SCREENSHOT 32 — Cell 43: Top 2 Products by Quantity]**

---

## 5. Data Cube and Cuboids

*(Explain: Apex Cuboid = Grand Total, Base Cuboid = most granular, intermediate cuboids between)*

**[📸 SCREENSHOT 33 — Cell 44: Apex Cuboid grand total + Base Cuboid sample]**  
**[📸 SCREENSHOT 34 — Cell 45: Lattice of Cuboids diagram]**  
**[📸 SCREENSHOT 35 — Cell 46: 3D Data Cube scatter]**

---

## 6. Curse of Dimensionality

*(Explain: As we add dimensions, the number of possible cube cells grows exponentially. Most cells become empty (sparse). A 5-D cube with 7 products × 7 cities × 4 quarters × 12 months × 14 stores = 32,928 possible cells but only a fraction have actual data. Remedy: pre-aggregate only used cuboids, apply PCA to reduce dimensions.)*

**[📸 SCREENSHOT 36 — Cell 47: Sparsity calculation output]**  
**[📸 SCREENSHOT 37 — Cell 48: Exponential growth + sparsity chart]**

---

## 7. Standardization and PCA

**[📸 SCREENSHOT 38 — Cell 49: Standardized feature stats]**  
**[📸 SCREENSHOT 39 — Cell 50: Before PCA 3D scatter]**  
**[📸 SCREENSHOT 40 — Cell 51: After PCA 2D scatter]**  
**[📸 SCREENSHOT 41 — Cell 52: Variance Explained bar chart]**

---

## 8. Why Data Cube is Better Than a Flat Excel Spreadsheet

*(Write 1 paragraph — reference the comparison table from Cell 55)*

> A flat Excel spreadsheet stores data in a single two-dimensional table, forcing managers to manually create pivot tables for every new business question — a slow, error-prone process that collapses with large datasets. In contrast, the NovaTech Data Cube pre-computes multiple cuboids across three dimensions (Product, City, Quarter), enabling instant Slice, Dice, Roll-Up, and Drill-Down operations without manually reconfiguring anything. Excel cannot handle 8,000+ rows without freezing, whereas the OLAP cube operates on millions of records in milliseconds. Additionally, as Han et al. (2011) note, OLAP cubes support hierarchical aggregations (daily → yearly) natively, which Excel cannot replicate without complex formulas. This makes the Data Cube fundamentally superior for managerial decision-making.

**[📸 SCREENSHOT 42 — Cell 55: Data Cube vs Flat Excel comparison table]**

---

## 9. Git Version Control

**[📸 SCREENSHOT 43 — Terminal: git init output]**  
**[📸 SCREENSHOT 44 — Terminal: git add + git commit output]**  
**[📸 SCREENSHOT 45 — Terminal: git log --oneline]**  
**[📸 SCREENSHOT 46 — GitHub: Remote repository link visible in browser]**

---

## 10. References (APA 7 Format)

Han, J., Kamber, M., & Pei, J. (2011). *Data mining: Concepts and techniques* (3rd ed.). Morgan Kaufmann. https://doi.org/10.1016/B978-0-12-381479-1.00001-0

Kimball, R., & Ross, M. (2013). *The data warehouse toolkit: The definitive guide to dimensional modeling* (3rd ed.). Wiley. https://www.wiley.com/en-us/The+Data+Warehouse+Toolkit-p-9781118530801

---

*Report length: 4–5 pages when formatted in Times New Roman 12pt, double-spaced with screenshots.*
