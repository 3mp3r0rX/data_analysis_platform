# Data Analysis Platform

A modern, browser-based data analysis platform built with React and TypeScript. This application allows users to upload, analyze, visualize, and manipulate data through an intuitive interface.

## Features

### 🔍 Data Exploration
- Interactive data table with sorting and filtering capabilities
- Support for large datasets with efficient pagination
- CSV file upload with drag-and-drop support
- Export functionality for processed data

### 📊 Data Analysis
- Automated statistical analysis of numeric and categorical columns
- Key metrics calculation (mean, median, standard deviation, quartiles)
- Distribution visualization with interactive histograms
- Exportable analysis reports

### 📈 Data Visualization
- Multiple chart types:
  - Line charts
  - Bar charts
  - Scatter plots
  - Pie charts
- Customizable axes and grouping options
- Responsive and interactive visualizations using Recharts
- Support for large datasets with automatic sampling

### ✏️ Data Editing
- In-line data editing capabilities
- Batch updates
- Change validation
- Undo/redo functionality

### 💻 Code Integration
- Built-in code editors for:
  - SQL queries with SQLite support
  - JavaScript execution
  - Python-like syntax (interface only)
- Interactive notebook interface
- Real-time code execution
- Output capture and display

### 📓 Notebook Interface
- Jupyter-like notebook experience
- Support for both code and markdown cells
- Cell reordering and management
- Interactive code execution

## Technical Stack

- React
- TypeScript
- Tailwind CSS
- D3.js for custom visualizations
- Recharts for charts
- Monaco Editor for code editing
- SQL.js for in-browser SQL queries
- Papa Parse for CSV parsing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/data-analysis-platform.git
cd data-analysis-platform
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload Data**
   - Drag and drop a CSV file onto the upload area
   - Or click to browse and select a file

2. **Explore Data**
   - Use the data table view to sort and filter columns
   - Add multiple filters with different conditions
   - Export filtered data as CSV

3. **Analyze Data**
   - Switch to the Analysis tab to view automated statistical analysis
   - Review distribution histograms
   - Export analysis results

4. **Visualize Data**
   - Create various chart types in the Visualize tab
   - Configure axes and grouping options
   - Interact with the charts for detailed information

5. **Edit Data**
   - Use the Edit tab for in-line data modifications
   - Save changes to update analysis and visualizations

6. **Code and Query**
   - Write SQL queries to analyze data
   - Execute JavaScript code for custom analysis
   - Use the notebook interface for detailed analysis workflows

## License

This project is licensed under the MIT License - see the LICENSE file for details.
