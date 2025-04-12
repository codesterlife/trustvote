# TrustVote Documentation

This directory contains the comprehensive documentation for the TrustVote blockchain-based voting system.

## Files Included

1. `USER_MANUAL.md` - The complete user manual in Markdown format
2. `SCREENSHOT_GUIDE.md` - A guide indicating where screenshots should be placed in the manual
3. `convert_to_pdf.js` - A script for converting the markdown manual to PDF
4. `DEPLOYMENT.md` - Instructions for deploying the TrustVote system

## How to Generate the PDF Manual

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Steps to Generate PDF

1. Install the required dependency:
   ```
   npm install markdown-pdf
   ```

2. Run the conversion script:
   ```
   node convert_to_pdf.js
   ```

3. The script will generate `USER_MANUAL.pdf` in the same directory.

## Adding Screenshots

The user manual is designed to include screenshots at key points. Follow these steps to add them:

1. Take screenshots of the application following the guidance in `SCREENSHOT_GUIDE.md`
2. Save the screenshots in the `screenshots` directory with the specified filenames
3. Edit the `USER_MANUAL.md` file to include the images using Markdown syntax:
   ```markdown
   ![Description](screenshots/filename.png)
   ```
4. After adding all screenshots, regenerate the PDF

## Customizing the Manual

To customize the manual:

1. Edit the `USER_MANUAL.md` file to update content
2. Modify the CSS styling in `convert_to_pdf.js` to change the appearance
3. Regenerate the PDF

## Distribution

The generated PDF can be:
- Included in the application as a downloadable resource
- Added to the project repository
- Distributed to users via email or other channels
- Published on the project website

## Keeping Documentation Updated

As the TrustVote system evolves:

1. Update the content in `USER_MANUAL.md` to reflect new features or changes
2. Take new screenshots when the UI changes significantly
3. Regenerate the PDF manual
4. Maintain a version number and changelog

---

For any questions about the documentation, please contact the TrustVote documentation team.