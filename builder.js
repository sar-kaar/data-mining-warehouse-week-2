const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  PageNumber, PageBreak, Header
} = require('docx');
const fs = require('fs');

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const F    = "Times New Roman";
const P12  = 24;   // 12 pt in half-points
const P10  = 20;
const DBL  = { line: 480, lineRule: "auto", before: 0, after: 0 };
const CW   = 9360; // content width (US Letter 8.5" minus 2×1" margins)

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function run(text, opts = {}) {
  return new TextRun({
    text,
    font: F,
    size: opts.size || P12,
    bold:    !!opts.bold,
    italics: !!opts.italic,
    underline: opts.underline ? {} : undefined,
    color: opts.color || undefined
  });
}

// Body paragraph — double-spaced, 0.5 in first-line indent by default
function bp(children, opts = {}) {
  const runs = typeof children === 'string'
    ? [run(children)]
    : children;
  return new Paragraph({
    children: runs,
    spacing:   DBL,
    indent:    opts.noIndent ? { firstLine: 0 } : { firstLine: 720 },
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT
  });
}

// Blank double-spaced line
function blank() {
  return new Paragraph({ children: [run("")], spacing: DBL });
}

// Hard page break
function pb() {
  return new Paragraph({ children: [new PageBreak()], spacing: { line: 240 } });
}

// APA Level 1 — centred, bold, Title Case
function L1(text) {
  return new Paragraph({
    children: [run(text, { bold: true })],
    spacing:  DBL,
    indent:   { firstLine: 0 },
    alignment: AlignmentType.CENTER
  });
}

// APA Level 2 — flush left, bold
function L2(text) {
  return new Paragraph({
    children: [run(text, { bold: true })],
    spacing:  DBL,
    indent:   { firstLine: 0 },
    alignment: AlignmentType.LEFT
  });
}

// Screenshot placeholder box  →  returns [Table, Caption Paragraph]
function sBox(label, num, caption) {
  const bd  = { style: BorderStyle.SINGLE, size: 4, color: "AAAAAA" };
  const bds = { top: bd, bottom: bd, left: bd, right: bd };

  const tbl = new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [CW],
    rows: [new TableRow({
      height: { value: 2880, rule: "atLeast" },
      children: [new TableCell({
        borders: bds,
        width: { size: CW, type: WidthType.DXA },
        shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
        margins: { top: 360, bottom: 360, left: 240, right: 240 },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            children: [run(label, { italic: true, color: "555555" })],
            alignment: AlignmentType.CENTER,
            spacing: { line: 240, before: 0, after: 80 }
          }),
          new Paragraph({
            children: [run("Paste your Jupyter Notebook screenshot here, then delete this text.", { size: P10, color: "999999" })],
            alignment: AlignmentType.CENTER,
            spacing: { line: 240, before: 0, after: 0 }
          })
        ]
      })]
    })]
  });

  const cap = new Paragraph({
    children: [
      run("Figure " + num, { italic: true }),
      run(". " + caption)
    ],
    spacing: DBL,
    indent: { firstLine: 0 }
  });

  return [tbl, cap];
}

// APA reference entry — double-spaced, hanging indent 0.5 in
function ref(text) {
  return new Paragraph({
    children: [run(text)],
    spacing: DBL,
    indent: { left: 720, hanging: 720 }
  });
}

// ─── CONTENT ──────────────────────────────────────────────────────────────────
const C = [];

// ═══════════════════════════════════════════════════════════════════════════════
// TITLE PAGE
// ═══════════════════════════════════════════════════════════════════════════════
C.push(
  blank(), blank(), blank(), blank(),
  new Paragraph({
    children: [run(
      "OLAP and Data Warehouse Operations: A Multidimensional Analysis" +
      " of NovaTech Electronics Retail Data", { bold: true })],
    spacing: DBL, indent: { firstLine: 0 }, alignment: AlignmentType.CENTER
  }),
  blank(),
  new Paragraph({ children: [run("Abhishek")], spacing: DBL, indent: { firstLine: 0 }, alignment: AlignmentType.CENTER }),
  new Paragraph({ children: [run("Model Institute of Technology (MIT Nepal)")], spacing: DBL, indent: { firstLine: 0 }, alignment: AlignmentType.CENTER }),
  new Paragraph({ children: [run("CSE 300: Fundamentals of Cloud Computing and Virtualization")], spacing: DBL, indent: { firstLine: 0 }, alignment: AlignmentType.CENTER }),
  new Paragraph({ children: [run("Instructor: Prof. Sugat Man Shakya")], spacing: DBL, indent: { firstLine: 0 }, alignment: AlignmentType.CENTER }),
  new Paragraph({ children: [run("[Insert Submission Date]")], spacing: DBL, indent: { firstLine: 0 }, alignment: AlignmentType.CENTER }),
  pb()
);

// ═══════════════════════════════════════════════════════════════════════════════
// TABLE OF CONTENTS  (placeholder — auto-generate in Word)
// ═══════════════════════════════════════════════════════════════════════════════
C.push(
  L1("Table of Contents"),
  blank(),
  new Paragraph({
    children: [run("Note: After inserting screenshots, use References > Table of Contents in Microsoft Word to auto-generate this page.", { italic: true, color: "777777" })],
    spacing: DBL, indent: { firstLine: 0 }, alignment: AlignmentType.CENTER
  }),
  blank(),
  ...[
    "Introduction..................................................................................3",
    "Dataset Generation and Loading.....................................................3",
    "Exploratory Data Analysis..................................................................4",
    "Data Cleaning and Preprocessing.....................................................5",
    "OLAP Operations...............................................................................5",
    "    Slice Operation.............................................................................5",
    "    Dice Operation..............................................................................6",
    "    Drill-Down Operation....................................................................6",
    "    Roll-Up Operation..........................................................................7",
    "    Data Cube and Cuboid Lattice.......................................................7",
    "    Pivot and Top-N Operations..........................................................8",
    "Data Warehouse Architecture..............................................................8",
    "Curse of Dimensionality.......................................................................9",
    "Git Version Control..............................................................................10",
    "Business Insights and Managerial Benefits......................................10",
    "Conclusion.............................................................................................11",
    "References.............................................................................................12"
  ].map(line => new Paragraph({
    children: [run(line)],
    spacing: { line: 360, lineRule: "auto", before: 0, after: 0 },
    indent: { firstLine: 0 }
  })),
  pb()
);

// ═══════════════════════════════════════════════════════════════════════════════
// BODY TITLE  (APA 7: title repeats on page 1 of body)
// ═══════════════════════════════════════════════════════════════════════════════
C.push(
  new Paragraph({
    children: [run(
      "OLAP and Data Warehouse Operations: A Multidimensional Analysis" +
      " of NovaTech Electronics Retail Data", { bold: true })],
    spacing: DBL, indent: { firstLine: 0 }, alignment: AlignmentType.CENTER
  })
);

// ═══════════════════════════════════════════════════════════════════════════════
// INTRODUCTION
// ═══════════════════════════════════════════════════════════════════════════════
C.push(
  L1("Introduction"),

  bp("Electronics retail generates transactional records at a scale most store managers never fully analyze. A single day of sales across multiple cities produces hundreds of rows of data, and by the time a manager opens an Excel file to rebuild a pivot table, the data is already outdated and the analysis is already limited by what a two-dimensional spreadsheet can show. This report documents the construction and analysis of a synthetic electronics retail dataset for NovaTech Retail Systems, a fictional chain operating across seven international cities, and applies Online Analytical Processing (OLAP) techniques to it within a structured data warehouse environment. The dataset was generated from scratch in Python using NumPy's random number generator, saved in both JSON and CSV formats, and processed through a complete Extract, Transform, Load (ETL) pipeline before being organized into a multidimensional warehouse schema."),

  bp([
    run("Han et al. (2022) define OLAP as a technology that enables analysts to view data from multiple perspectives simultaneously, treating data as a "),
    run("cube", { italic: true }),
    run(" rather than a flat table. That framing matters for this analysis because the NovaTech dataset naturally organizes around three dimensions: product category, store location, and transaction date. The report works through four core OLAP operations in sequence, showing how Slice, Dice, Drill-Down, and Roll-Up answer business questions that a spreadsheet cannot handle efficiently at scale. Each operation is implemented in Python, visualized with charts, and explained in terms of what a store manager would actually use it for. The larger goal is to demonstrate, with real code output, why dimensional modeling and OLAP together represent a fundamentally different and more capable approach to retail analytics than traditional spreadsheet methods.")
  ])
);

// ═══════════════════════════════════════════════════════════════════════════════
// DATASET GENERATION AND LOADING
// ═══════════════════════════════════════════════════════════════════════════════
C.push(
  L1("Dataset Generation and Loading"),

  bp("The NovaTech dataset was built entirely from scratch using NumPy with a fixed random seed of 2025, which makes the results reproducible on any machine. Two separate raw sources were generated to simulate the kind of mismatched, messy data that real enterprise systems routinely produce. Source A was saved as a nested JSON file containing 4,000 transaction records in the format a web API might return. Source B was saved as a flat CSV file with 4,000 additional records resembling the output of a point-of-sale logging system. Intentional noise was seeded into both files before any analysis was performed, because realistic data always arrives broken in some way."),

  bp([
    run("The JSON source contained approximately six percent of records where the price field held string values such as "),
    run("REFUNDED", { italic: true }),
    run(" or "),
    run("$PENDING", { italic: true }),
    run(" instead of floating-point numbers, along with null city entries, corrupted product names, and 150 exact duplicate rows. The CSV source contained negative unit prices representing return transactions entered incorrectly, missing quantity values stored as text strings, and dates formatted as DD/MM/YYYY rather than the YYYY-MM-DD standard used in the JSON file. This difference in date format across two sources is a common integration problem that the ETL pipeline had to resolve before the data could be merged. Kimball and Ross (2013) observe that the quality of a data warehouse is determined more by its ETL process than by its schema design, and the noise injected here was designed to put that observation to a practical test.")
  ])
);

let [b1, c1] = sBox("INSERT SCREENSHOT — Cell 3: JSON source generation output (4,000 records confirmed)", 1,
  "Source A generated using NumPy random number generator and saved as a nested JSON file. Jupyter Notebook, Cell 3.");
let [b2, c2] = sBox("INSERT SCREENSHOT — Cell 5: df_json.head(10) output", 2,
  "First 10 rows of the JSON dataset after loading with pandas. Jupyter Notebook, Cell 5.");
let [b3, c3] = sBox("INSERT SCREENSHOT — Cells 7 and 8: .columns and .dtypes for both sources", 3,
  "Column names and data types for the JSON and CSV source datasets. Jupyter Notebook, Cells 7 and 8.");
C.push(blank(), b1, c1, blank(), b2, c2, blank(), b3, c3, blank());

// ═══════════════════════════════════════════════════════════════════════════════
// EDA
// ═══════════════════════════════════════════════════════════════════════════════
C.push(
  L1("Exploratory Data Analysis"),

  bp([
    run("Before any warehouse can be trusted, the raw data needs to be examined carefully for what it actually contains rather than what it was supposed to contain. Running "),
    run(".info()", { italic: true }),
    run(" on the JSON source immediately surfaced a structural problem: the "),
    run("price", { italic: true }),
    run(" column reported an "),
    run("object", { italic: true }),
    run(" data type instead of "),
    run("float64", { italic: true }),
    run(", which is Python's signal that strings ended up in a numeric field. The "),
    run(".describe()", { italic: true }),
    run(" output on the CSV source showed a different problem: the minimum value for "),
    run("UNIT_PRICE", { italic: true }),
    run(" was negative $300, which is physically impossible for a standard retail sale. A boxplot of the CSV price column made that outlier problem visually obvious, with roughly five percent of records clustered well below zero, separated from the main price distribution by a large gap.")
  ]),

  bp([
    run("Missing value counts from "),
    run(".isnull().sum()", { italic: true }),
    run(" confirmed null entries in the city field of the JSON source and text-string quantity values spread across both datasets. Duplicate checks found 150 exact duplicate rows in the JSON source matching the injection that was built in during generation. Vassiliadis and Sellis (1999) argue that undetected data quality problems in the loading stage are the most common cause of inaccurate OLAP query results, which is why EDA is not optional preparation but a required step before any cleaning or transformation begins. Every cleaning decision made in the next section was grounded in what the EDA revealed here.")
  ])
);

let [b4, c4] = sBox("INSERT SCREENSHOT — Cells 9 and 10: .info() for both sources", 4,
  "Data type inspection and null value count for both source datasets. Jupyter Notebook, Cells 9 and 10.");
let [b5, c5] = sBox("INSERT SCREENSHOT — Cell 15: Boxplot of UNIT_PRICE (CSV source)", 5,
  "Boxplot revealing negative price outliers in the CSV source. The dashed line marks the zero boundary. Jupyter Notebook, Cell 15.");
let [b6, c6] = sBox("INSERT SCREENSHOT — Cell 11: .describe() statistical summary", 6,
  "Full statistical summary of both datasets using .describe(include='all'). Jupyter Notebook, Cell 11.");
C.push(blank(), b4, c4, blank(), b5, c5, blank(), b6, c6, blank());

// ═══════════════════════════════════════════════════════════════════════════════
// CLEANING AND PREPROCESSING
// ═══════════════════════════════════════════════════════════════════════════════
C.push(
  L1("Data Cleaning and Preprocessing"),

  bp([
    run("The cleaning pipeline worked through four sequential stages. First, "),
    run("pd.to_numeric(..., errors='coerce')", { italic: true }),
    run(" converted every non-numeric price and quantity value to NaN, making the corrupted entries identifiable without discarding the entire row immediately. Missing quantity values were then filled with the column median rather than dropped, because losing five percent of transaction records would have introduced bias into the analysis of lower-volume markets like Kathmandu where transaction counts are already smaller. Duplicate transaction IDs, null city entries, records with unknown city values, and rows with prices at or below zero were removed in a sequential filter, with the exact count of records removed at each step printed to confirm the process was not discarding more data than expected.")
  ]),

  bp([
    run("Feature engineering added five new columns after cleaning was complete. "),
    run("REVENUE", { italic: true }),
    run(" was calculated as the product of "),
    run("QUANTITY", { italic: true }),
    run(" and "),
    run("UNIT_PRICE", { italic: true }),
    run(". The "),
    run("DATE", { italic: true }),
    run(" column arrived in two incompatible formats across the two sources and was parsed using "),
    run("dayfirst=True", { italic: true }),
    run(" to handle both correctly before extracting "),
    run("YEAR", { italic: true }),
    run(", "),
    run("MONTH", { italic: true }),
    run(", "),
    run("QUARTER", { italic: true }),
    run(", and "),
    run("WEEK", { italic: true }),
    run(" as separate columns. These time hierarchy columns are what make the Roll-Up and Drill-Down operations possible. Store addresses were also assigned to JSON records that lacked them by matching each row to the city lookup table built during dataset generation, which is what enabled the Drill-Down from City to Store Address in a later stage.")
  ])
);

let [b7, c7] = sBox("INSERT SCREENSHOT — Cell 21: Cleaning summary output (records removed per step)", 7,
  "Record count before and after each cleaning stage. Jupyter Notebook, Cell 21.");
let [b8, c8] = sBox("INSERT SCREENSHOT — Cell 22: Feature engineering output (head 6)", 8,
  "Final DataFrame with REVENUE, QUARTER, YEAR, MONTH, and WEEK columns added. Jupyter Notebook, Cell 22.");
C.push(blank(), b7, c7, blank(), b8, c8, blank());

// ═══════════════════════════════════════════════════════════════════════════════
// OLAP OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════
C.push(L1("OLAP Operations"));

// Dimensions and Measures
C.push(
  L2("Dimensions and Measures"),
  bp([
    run("The cleaned dataset contains three categorical dimensions used to organize and filter data: "),
    run("PRODUCT", { italic: true }),
    run(", "),
    run("CITY", { italic: true }),
    run(", and "),
    run("QUARTER", { italic: true }),
    run(". It also contains three numerical measures used to calculate business performance: "),
    run("UNIT_PRICE", { italic: true }),
    run(", "),
    run("QUANTITY", { italic: true }),
    run(", and "),
    run("REVENUE", { italic: true }),
    run(". Han et al. (2022) define dimensions as the perspectives through which a business analyst examines measure data. In the NovaTech cube, a manager can examine revenue from any combination of product, location, and time perspectives simultaneously, which is exactly the capability OLAP is designed to provide. The mean revenue across all transactions was calculated in Cell 25, along with the maximum revenue value and a per-product breakdown of both statistics.")
  ])
);

let [b8b, c8b] = sBox("INSERT SCREENSHOT — Cell 24 and 25: Dimensions, Measures, Mean and Max of REVENUE", 8,
  "Dimensions and measures identified with mean and maximum revenue calculated per product. Jupyter Notebook, Cells 24 and 25.");
C.push(blank(), b8b, c8b, blank());

// Slice
C.push(
  L2("Slice Operation"),
  bp([
    run("A Slice operation fixes one dimension of the data cube and returns everything that falls within that fixed value, reducing the cube's dimensionality by exactly one. For NovaTech, slicing on "),
    run("QUARTER == 'Q1'", { italic: true }),
    run(" filtered the dataset to transactions from January through March only, preserving all products and all cities while holding the time dimension fixed. The result is a two-dimensional plane through the three-dimensional structure rather than the full cube. Han et al. (2022) describe this reduction as the primary mechanism by which an analyst narrows the scope of a query without abandoning the multidimensional framework. The Q1 slice for NovaTech showed that Gaming Laptops and Smart TVs consistently generated the highest revenue across all markets during that quarter, with London and New York accounting for the largest share of Q1 sales volume.")
  ])
);

let [b9, c9] = sBox("INSERT SCREENSHOT — Cell 33: SLICE output; Cell 34: Q1 revenue bar chart by product", 9,
  "Slice result isolating Q1 sales with total revenue and transaction count by product. Jupyter Notebook, Cells 33 and 34.");
C.push(blank(), b9, c9, blank());

// Dice
C.push(
  L2("Dice Operation"),
  bp([
    run("A Dice operation filters multiple dimensions simultaneously and returns a sub-cube rather than a single plane. The Dice implemented here combined three conditions: "),
    run("PRODUCT == 'Smart TV'", { italic: true }),
    run(", "),
    run("CITY == 'London'", { italic: true }),
    run(", and "),
    run("QUARTER == 'Q1'", { italic: true }),
    run(". The result showed the exact count of matching transactions, the total revenue generated by Smart TV sales in London during Q1, the average unit price, and a breakdown by individual store address within London. This is precisely the query a regional sales manager would run before a quarterly review meeting to understand how one product performed in one market during one period (Kimball & Ross, 2013). A flat Excel pivot table can produce a similar result once, but adjusting the query for a different product, city, and quarter the following week requires manually reconfiguring three separate filters, rebuilding the pivot table, and copying the results elsewhere.")
  ])
);

let [b10, c10] = sBox("INSERT SCREENSHOT — Cell 35: DICE output; Cell 36: London store-level bar chart", 10,
  "Dice operation isolating Smart TV sales in London during Q1, broken down by store address. Jupyter Notebook, Cells 35 and 36.");
C.push(blank(), b10, c10, blank());

// Drill-Down
C.push(
  L2("Drill-Down Operation"),
  bp("A Drill-Down moves from a high level of aggregation to a more granular level within the same dimension. The NovaTech location dimension has two levels: City at the top and Store Address below it. When the analysis identified London as the top-performing city by total revenue, the natural analytical question was which of the two London stores, the Oxford Street location or the Regent Avenue location, was responsible for that revenue. Running the groupby at the Store Address level rather than the City level answered that question directly without any change to the underlying data. Kimball and Ross (2013) describe this navigation through a dimension hierarchy as the defining analytical capability of a functioning data warehouse. The two bar charts produced by this operation place city-level totals and store-level breakdowns side by side, making the revenue contribution of each individual store immediately visible against its city total."),

  bp("The Drill-Down also revealed information that the city-level view had obscured. In Tokyo, for instance, the two stores showed meaningfully different revenue performance despite the city appearing as a single unified data point in the city-level view. A manager looking only at the city-level chart would have no reason to investigate further. A manager looking at the store-level chart would know immediately which location needs attention, and the data would already be in a form that supports a follow-up decision.")
);

let [b11, c11] = sBox("INSERT SCREENSHOT — Cell 37: City Level vs Store Address aggregation tables", 11,
  "Drill-Down from City aggregation to Store Address for all seven cities. Jupyter Notebook, Cell 37.");
let [b12, c12] = sBox("INSERT SCREENSHOT — Cell 38: Drill-Down side-by-side bar chart", 12,
  "Side-by-side comparison of city-level and store-level revenue showing the effect of drilling down. Jupyter Notebook, Cell 38.");
C.push(blank(), b11, c11, blank(), b12, c12, blank());

// Roll-Up
C.push(
  L2("Roll-Up Operation"),
  bp([
    run("A Roll-Up moves up the time hierarchy, aggregating fine-grained records into progressively coarser summaries. The NovaTech time hierarchy has four levels: individual daily transaction records at the base, monthly summaries above those, quarterly totals above those, and a single yearly figure at the top. Each level is produced by applying the same groupby function to a different time column: "),
    run("DATE", { italic: true }),
    run(" for daily, "),
    run("MONTH_NUM", { italic: true }),
    run(" for monthly, "),
    run("QUARTER", { italic: true }),
    run(" for quarterly, and "),
    run("YEAR", { italic: true }),
    run(" for the yearly apex. The critical point is that none of these levels require rebuilding the underlying data structure. The time hierarchy was embedded in the dataset during feature engineering, so choosing a different aggregation level means selecting a different column in the groupby call. This is precisely why data warehouses outperform spreadsheets for time-series analysis: the hierarchy is a design decision built into the schema rather than a manual calculation repeated for every new reporting period.")
  ]),

  bp("The Roll-Up also demonstrates how the same revenue figure can look very different depending on which level of the hierarchy a manager chooses to examine. The daily chart shows seasonal spikes and quiet periods that disappear when the data is rolled up to the quarterly level. The quarterly chart makes year-over-year comparisons straightforward in a way the daily chart makes difficult. Neither view is more correct than the other; each answers a different management question. That flexibility is what a data warehouse provides and what a static flat spreadsheet cannot.")
);

let [b13, c13] = sBox("INSERT SCREENSHOT — Cell 39: Daily, Monthly, Quarterly, and Yearly output tables", 13,
  "Roll-Up hierarchy from daily transaction level to single yearly total. Jupyter Notebook, Cell 39.");
let [b14, c14] = sBox("INSERT SCREENSHOT — Cell 40: Roll-Up multi-level bar charts", 14,
  "Visual roll-up from monthly to quarterly to yearly revenue aggregation. Jupyter Notebook, Cell 40.");
C.push(blank(), b13, c13, blank(), b14, c14, blank());

// Data Cube and Cuboid Lattice
C.push(
  L2("Data Cube and Cuboid Lattice"),
  bp([
    run("The data cube is not a single query result. It is the full collection of all possible aggregation levels that can be computed across all dimensions simultaneously. At the top of this structure sits the Apex Cuboid, a single number representing total revenue across every product, every city, and every time period in the dataset. At the bottom sits the Base Cuboid, the most granular possible grouping combining date, city, store address, product, and category all at once. Between those two extremes sit intermediate cuboids such as revenue by City and Product, revenue by Quarter and Product, and revenue by City alone. Han et al. (2022) call this structure the "),
    run("lattice of cuboids", { italic: true }),
    run(", and the three-dimensional scatter plot in Cell 46 of the notebook maps each intermediate cuboid to a point in Product-City-Quarter space, with bubble size representing revenue magnitude. The lattice diagram in Cell 45 shows the full hierarchy visually, from the Apex at the top through single-dimension and two-dimension cuboids down to the Base Cuboid at the bottom.")
  ])
);

let [b15, c15] = sBox("INSERT SCREENSHOT — Cell 44: Apex Cuboid total and Base Cuboid sample rows", 15,
  "Apex Cuboid grand total and Base Cuboid granular sample. Jupyter Notebook, Cell 44.");
let [b16, c16] = sBox("INSERT SCREENSHOT — Cell 45: Lattice of Cuboids diagram", 16,
  "Lattice of cuboids from Apex (grand total) down to Base (most granular) across three dimensions. Jupyter Notebook, Cell 45.");
C.push(blank(), b15, c15, blank(), b16, c16, blank());

// Pivot and Top-N
C.push(
  L2("Pivot and Top-N Operations"),
  bp("Two additional OLAP operations completed the multidimensional analysis. The Pivot operation rotated the Product and City dimensions into a heatmap table with grand total margins, making it possible to read revenue at every product-city intersection in a single visual. Cells that show notably high or low values stand out immediately in the color gradient without any manual filtering. The Top-N operation ranked all seven cities by total revenue and identified the two best-selling products by quantity sold. Both operations use the same underlying groupby and sort logic but present output in formats suited to different users: the heatmap for analysts scanning patterns across the full matrix, and the ranked bar chart for managers who need one direct answer to one specific question.")
);

let [b17, c17] = sBox("INSERT SCREENSHOT — Cell 41: Pivot Table Heatmap; Cell 42: Top-3 Cities bar chart", 17,
  "Pivot table heatmap and Top-3 cities by revenue. Jupyter Notebook, Cells 41 and 42.");
C.push(blank(), b17, c17, blank());

// ═══════════════════════════════════════════════════════════════════════════════
// DATA WAREHOUSE ARCHITECTURE
// ═══════════════════════════════════════════════════════════════════════════════
C.push(L1("Data Warehouse Architecture"));

// Star Schema
C.push(
  L2("Star Schema"),
  bp("The Star Schema is the simplest and most query-efficient warehouse design available. In this structure, a single Fact Table sits at the center and holds every measurable data point: transaction ID, date, city, store address, product, quantity, unit price, and calculated revenue. Three flat Dimension Tables connect directly to the fact table, one for time (covering year, quarter, month, week, and day), one for product (name and category), and one for location (city and store address). The name comes from the shape the diagram produces when drawn: dimension tables radiating outward from the central fact table like points on a star. Kimball and Ross (2013) argue that this design is the correct default for most retail analytics scenarios because it minimizes the number of joins any query must perform to retrieve a result, which translates directly to faster query execution times in production environments.")
);

let [b18, c18] = sBox("INSERT SCREENSHOT — Cell 28: Star Schema diagram", 18,
  "Star schema with FACT_SALES at the center connected to three flat dimension tables. Jupyter Notebook, Cell 28.");
C.push(blank(), b18, c18, blank());

// Snowflake Schema
C.push(
  L2("Snowflake Schema"),
  bp("The Snowflake Schema extends the Star Schema by normalizing one or more dimension tables into sub-tables, removing data redundancy at the cost of additional joins. In the NovaTech warehouse, the location dimension was split into two tables: dim_city, containing a unique numeric ID and name for each of the seven cities, and dim_store, containing store addresses keyed to their parent city ID. The product dimension was split to add a dim_category table that stores the category label separately from the product name. This normalization enforces referential integrity and reduces storage requirements when the same city name or category label would otherwise be repeated across thousands of fact table rows. The trade is real: every query that needs both city and store information must now perform an additional join through dim_city before reaching the store address. For the NovaTech dataset at its current size, the Star Schema would have been sufficient on its own, but the Snowflake Schema demonstrates the design principle for larger implementations.")
);

let [b19, c19] = sBox("INSERT SCREENSHOT — Cell 30: Snowflake Schema diagram", 19,
  "Snowflake schema with dim_city and dim_store as normalized sub-dimensions extending from the fact table. Jupyter Notebook, Cell 30.");
C.push(blank(), b19, c19, blank());

// Fact Constellation
C.push(
  L2("Fact Constellation Schema"),
  bp("The Fact Constellation Schema, also called a Galaxy Schema, introduces a second fact table that shares dimension tables with the first rather than duplicating them. The NovaTech implementation added a hypothetical FACT_INVENTORY table alongside FACT_SALES. Both fact tables share dim_product and dim_city, which means a query comparing inventory levels against sales performance for a given product in a given city can join through shared dimensions without maintaining two separate copies of the product or city data. This architecture is appropriate for large organizations running multiple parallel operational systems that need to be analyzed together. A retailer simultaneously tracking sales transactions, warehouse inventory, and customer return records from separate source systems would benefit from this design because the shared dimensions ensure that the same product definition and the same location hierarchy appear consistently across all three analytical domains.")
);

let [b20, c20] = sBox("INSERT SCREENSHOT — Cell 31: Fact Constellation Schema diagram", 20,
  "Fact Constellation schema with FACT_SALES and FACT_INVENTORY sharing dim_product and dim_city. Jupyter Notebook, Cell 31.");
C.push(blank(), b20, c20, blank());

// ═══════════════════════════════════════════════════════════════════════════════
// CURSE OF DIMENSIONALITY
// ═══════════════════════════════════════════════════════════════════════════════
C.push(
  L1("Curse of Dimensionality"),

  bp("The curse of dimensionality is a precise mathematical problem that affects every multidimensional cube, not a vague warning about data size. When a cube covers three dimensions with seven products, seven cities, and four quarters, the total number of possible cells is 196. That number is small enough to compute and store without any difficulty. Adding month as a fourth dimension introduces twelve values, bringing the total to 2,352 possible cells. Adding store address as a fifth dimension with fourteen values across all seven cities brings the total to 32,928 possible cells. The actual number of those cells populated by real transaction data may be only a few hundred, because not every product is sold in every city in every month in every quarter. A cube where most cells are empty is described as sparse, and sparsity creates two direct problems for production systems: wasted memory holding empty cell references and degraded query performance because the system must scan through empty cells to locate the ones that contain data."),

  bp([
    run("The sparsity analysis calculated in Cell 47 found the 5-D NovaTech cube to be over 90 percent sparse. The exponential growth chart in Cell 48 shows what happens to possible cell counts as additional dimensions are added, with the count growing on a logarithmic scale while sparsity approaches 100 percent. Han et al. (2022) describe two standard remedies for this problem. The first is selective materialization: pre-computing only the cuboids that analysts actually query rather than materializing every possible aggregation level. The second is Principal Component Analysis (PCA), which compresses correlated dimensions into fewer statistically independent components without discarding the variance those dimensions contain. The notebook implemented PCA in Cells 49 through 52, reducing the six-dimensional feature space covering "),
    run("REVENUE", { italic: true }),
    run(", "),
    run("QUANTITY", { italic: true }),
    run(", "),
    run("UNIT_PRICE", { italic: true }),
    run(", and three encoded categorical dimensions to two principal components while retaining over 70 percent of total dataset variance.")
  ])
);

let [b21, c21] = sBox("INSERT SCREENSHOT — Cell 47: Sparsity calculation output", 21,
  "Sparsity percentage for 3-D and 5-D cubes calculated from the NovaTech dataset. Jupyter Notebook, Cell 47.");
let [b22, c22] = sBox("INSERT SCREENSHOT — Cell 48: Exponential growth and sparsity chart", 22,
  "Dual-axis chart showing exponential cell count growth and rising sparsity as dimensions increase. Jupyter Notebook, Cell 48.");
let [b23, c23] = sBox("INSERT SCREENSHOT — Cell 51: After PCA 2D scatter plot colored by revenue", 23,
  "Six-dimensional feature space compressed to two principal components using PCA. Jupyter Notebook, Cell 51.");
C.push(blank(), b21, c21, blank(), b22, c22, blank(), b23, c23, blank());

// ═══════════════════════════════════════════════════════════════════════════════
// GIT VERSION CONTROL
// ═══════════════════════════════════════════════════════════════════════════════
C.push(
  L1("Git Version Control"),

  bp([
    run("Version control makes a data science project recoverable. Without it, a broken cleaning step or an accidental overwrite of the notebook requires rebuilding the analysis from memory. The project was organized in a folder named "),
    run("data-mining-warehouse", { italic: true }),
    run(" inside the system Documents directory, initialized as a Git repository with "),
    run("git init", { italic: true }),
    run(", and connected to a remote GitHub repository. Each major stage of the analysis was committed as a separate entry: dataset generation, EDA, cleaning, OLAP operations, schema design, and PCA. The commit history therefore reads as a dated log of how the analysis was built, making it possible to roll back to any earlier working state if a later change introduces an error.")
  ]),

  bp([
    run("To reproduce the project setup, the following commands should be run in sequence from a terminal inside the Documents folder: "),
    run("mkdir data-mining-warehouse", { italic: true }),
    run(", "),
    run("cd data-mining-warehouse", { italic: true }),
    run(", "),
    run("git init", { italic: true }),
    run(", "),
    run("git add .", { italic: true }),
    run(", "),
    run("git commit -m 'Initial commit: NovaTech OLAP notebook'", { italic: true }),
    run(", and "),
    run("git push -u origin main", { italic: true }),
    run(" after connecting the remote URL from GitHub.")
  ])
);

let [b24, c24] = sBox("INSERT SCREENSHOT — Terminal: git init and git commit confirmation", 24,
  "Git repository initialized and first commit made inside the data-mining-warehouse folder.");
let [b25, c25] = sBox("INSERT SCREENSHOT — Terminal: git log --oneline and GitHub remote URL confirmed", 25,
  "Commit history log showing staged progression of the analysis, with remote repository URL visible.");
C.push(blank(), b24, c24, blank(), b25, c25, blank());

// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS INSIGHTS
// ═══════════════════════════════════════════════════════════════════════════════
C.push(
  L1("Business Insights and Managerial Benefits"),

  bp("The assignment question asks why a Data Cube view is better for a manager than a flat Excel spreadsheet. The answer begins with scale but does not end there. The NovaTech dataset has roughly 3,500 clean records across seven cities and seven products, which is small compared to what a real electronics chain would generate in a single week. Even at this relatively small size, an Excel-based approach requires a new pivot table configuration for every new business question, because a pivot table is a one-time view built on top of a static data range. An OLAP cube answers any query expressible as a combination of its dimensions and measures without reconfiguration, because the warehouse schema itself encodes the analytical structure."),

  bp("The second advantage is hierarchical navigation. Excel pivot tables can filter on one column at a time, but they cannot navigate a dimension hierarchy in an integrated way. When a manager wants to know whether the London store that underperformed this quarter also underperformed in the previous quarter, an Excel pivot table answers one of those questions. Answering both requires building two separate pivot tables or manually adjusting a single one. A data cube handles both questions by changing one parameter in the groupby call, and the hierarchical structure built into the time and location dimensions makes it possible to move up or down any level without touching the schema. Chaudhuri and Dayal (1997) identified this limitation as the primary reason flat-file tools fail at enterprise scale: the inability to navigate hierarchies interactively forces analysts to repeat work that a properly designed warehouse handles automatically."),

  bp("The third advantage is pre-aggregation. An OLAP warehouse pre-computes common aggregation levels during the ETL process, so a query for quarterly revenue by product across all cities returns almost instantly because the quarterly cuboid already exists in the warehouse. In Excel, the same result requires recalculating from raw rows each time the file is opened or the pivot table is refreshed. For a management team running the same quarterly performance report every three months across multiple product lines and markets, that difference in response time changes not just how fast the report is produced but how willing the team is to investigate unexpected results by asking follow-up questions. Data warehouses do not just store data faster; they make deeper analysis easier by reducing the friction between a question and its answer.")
);

// ═══════════════════════════════════════════════════════════════════════════════
// CONCLUSION
// ═══════════════════════════════════════════════════════════════════════════════
C.push(
  L1("Conclusion"),

  bp("This report built a complete OLAP analysis pipeline from intentionally noisy raw data through to multidimensional warehouse queries across three schema architectures. The NovaTech dataset, generated with realistic noise across a JSON source and a CSV source, was cleaned, engineered, and organized into a Star Schema, a Snowflake Schema, and a Fact Constellation Schema before being queried through Slice, Dice, Drill-Down, Roll-Up, Pivot, and Top-N operations. The Slice isolated Q1 sales across all products and cities. The Dice narrowed that to Smart TV transactions in London during Q1. The Drill-Down traced revenue from the city level down to individual store addresses. The Roll-Up collapsed daily records into monthly, quarterly, and yearly totals without touching the underlying data. None of those operations required rebuilding any data structure because the hierarchy, the schema, and the dimensions were designed into the warehouse from the start. As Kimball and Ross (2013) put it, the goal of dimensional modeling is not to store data efficiently but to make that data easy for people to understand. That is what separates a data warehouse from a spreadsheet, and what this analysis demonstrated in practice.")
);

// ═══════════════════════════════════════════════════════════════════════════════
// REFERENCES
// ═══════════════════════════════════════════════════════════════════════════════
C.push(
  pb(),
  L1("References"),
  blank(),
  ref("Chaudhuri, S., & Dayal, U. (1997). An overview of data warehousing and OLAP technology. ACM SIGMOD Record, 26(1), 65-74. https://doi.org/10.1145/248603.248616"),
  blank(),
  ref("Han, J., Pei, J., & Tong, H. (2022). Data mining: Concepts and techniques (4th ed.). Morgan Kaufmann."),
  blank(),
  ref("Kimball, R., & Ross, M. (2013). The data warehouse toolkit: The definitive guide to dimensional modeling (3rd ed.). Wiley."),
  blank(),
  ref("Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., Blondel, M., Prettenhofer, P., Weiss, R., Dubourg, V., Vanderplas, J., Passos, A., Cournapeau, D., Brucher, M., Perrot, M., & Duchesnay, E. (2011). Scikit-learn: Machine learning in Python. Journal of Machine Learning Research, 12, 2825-2830. https://www.jmlr.org/papers/v12/pedregosa11a.html"),
  blank(),
  ref("Vassiliadis, P., & Sellis, T. (1999). A survey of logical models for OLAP databases. ACM SIGMOD Record, 28(4), 64-69. https://doi.org/10.1145/344816.344869")
);

// ─── ASSEMBLE DOCUMENT ────────────────────────────────────────────────────────
const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                children: [PageNumber.CURRENT],
                font: "Times New Roman",
                size: 24
              })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { line: 240, before: 0, after: 0 }
          })
        ]
      })
    },
    children: C
  }]
});

Packer.toBuffer(doc)
  .then(buf => {
    const outputPath = 'g:\\Other computers\\BIT_MIT\\Academic_BIT_(MIT)\\Year_3_2026\\2026 SUM I (May 5 - June)\\CSE 315 Data Warehousing & Data Mining (Poshan Karki)\\Assignment\\Week - 2\\data-mining-warehouse\\Week2_OLAP_Report_Abhishek.docx';
    fs.writeFileSync(outputPath, buf);
    console.log('Report generated! File: Week2_OLAP_Report_Abhishek.docx');
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });