// This script converts Markdown files to PDF
// Run with: node convert_to_pdf.js

const fs = require('fs');
const path = require('path');
const markdownpdf = require('markdown-pdf');
const options = {
  remarkable: {
    html: true,
    breaks: true,
    plugins: [ /* remarkable plugins */ ]
  },
  cssPath: 'pdf_style.css',  // Optional custom CSS
  paperBorder: '1cm',        // PDF paper border
  paperFormat: 'A4',         // PDF paper format
  paperOrientation: 'portrait' // PDF paper orientation
};

// Files to convert (add all markdown files that need to be converted)
const files = [
  'USER_MANUAL.md'
];

// Check if the markdown-pdf module is installed
try {
  require.resolve('markdown-pdf');
} catch (e) {
  console.error('The markdown-pdf module is not installed. Please install it first:');
  console.error('npm install markdown-pdf');
  process.exit(1);
}

// Create PDF style
const cssContent = `
body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
}

h1, h2, h3, h4, h5, h6 {
  color: #2c3e50;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}

h1 {
  font-size: 2.2em;
  text-align: center;
  border-bottom: 2px solid #6c63ff;
  padding-bottom: 10px;
}

h2 {
  font-size: 1.8em;
  border-bottom: 1px solid #ddd;
  padding-bottom: 5px;
}

h3 {
  font-size: 1.5em;
}

a {
  color: #6c63ff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

code {
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  padding: 2px 4px;
}

pre {
  background-color: #f8f8f8;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 10px;
  overflow-x: auto;
}

blockquote {
  border-left: 4px solid #6c63ff;
  padding-left: 15px;
  color: #555;
  margin-left: 0;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

table, th, td {
  border: 1px solid #ddd;
}

th, td {
  padding: 10px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 1em auto;
}

hr {
  border: 0;
  height: 1px;
  background: #ddd;
  margin: 2em 0;
}

.page-break {
  page-break-after: always;
}
`;

// Write CSS file
fs.writeFileSync('pdf_style.css', cssContent);

// Convert each markdown file to PDF
files.forEach(file => {
  const inputPath = path.resolve(file);
  const outputPath = path.resolve(file.replace('.md', '.pdf'));
  
  console.log(`Converting ${inputPath} to PDF...`);
  
  markdownpdf(options)
    .from(inputPath)
    .to(outputPath, () => {
      console.log(`PDF created at: ${outputPath}`);
    });
});