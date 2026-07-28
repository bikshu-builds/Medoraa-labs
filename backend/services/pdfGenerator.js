const puppeteer = require("puppeteer");

let browserInstance = null;

async function getBrowser() {
  try {
    // Reuse existing browser if it's still running
    if (browserInstance && browserInstance.isConnected()) {
      return browserInstance;
    }

    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    // Reset browserInstance if the browser closes
    browserInstance.on("disconnected", () => {
      browserInstance = null;
    });

    return browserInstance;
  } catch (err) {
    console.error("Failed to launch browser:", err);
    throw err;
  }
}

/**
 * Generates an official Pathology PDF Report buffer for a given patient registration record.
 * @param {Object} record Patient registration document
 * @returns {Promise<Buffer>} PDF Buffer
 */
async function generatePathologyPDF(record) {
    const todayDate = new Date().toLocaleDateString("en-GB");

    // Group test results by category / organ
    const testResults = (record.testResults && record.testResults.length > 0)
        ? record.testResults
        : ((record.tests && record.tests.length > 0)
            ? record.tests.map(t => ({
                testName: typeof t === "string" ? t : (t.testName || t.name || "Diagnostic Parameter"),
                resultValue: t.resultValue || "—",
                unit: t.unit || "",
                referenceRange: typeof t === "object" ? (t.referenceRange || "-") : "-",
                category: t.category || "GENERAL PATHOLOGY"
            }))
            : [{ testName: "Routine Pathology Parameter", resultValue: "—", unit: "", referenceRange: "-", category: "GENERAL PATHOLOGY" }]
        );

    const categoryGroups = {};
    testResults.forEach(item => {
        const cat = (item.category || "PATHOLOGY OBSERVATIONS").toUpperCase();
        if (!categoryGroups[cat]) {
            categoryGroups[cat] = [];
        }
        categoryGroups[cat].push(item);
    });

    const categoryKeys = Object.keys(categoryGroups);

    // Format sample text
    let sampleTypeText = "Clot-Act, Blood / Urine";
    if (record.sampleReceived) {
        if (typeof record.sampleReceived === "string") {
            sampleTypeText = record.sampleReceived;
        } else if (typeof record.sampleReceived === "object") {
            sampleTypeText = record.sampleReceived.sampleType || record.sampleReceived.transportMethod || "Clot-Act, Blood / Urine";
        }
    }

    const patientAge = record.age ? `${record.age.value} ${record.age.type}` : "N/A";
    const patientGender = record.gender || "N/A";

    // Build HTML template
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <title>Pathology Report - ${record.registrationNumber}</title>
        <style>
            @page {
                size: A4;
                margin: 15mm 15mm 15mm 15mm;
            }
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #111827;
                margin: 0;
                padding: 0;
                background-color: #ffffff;
                -webkit-print-color-adjust: exact;
            }
            .page-container {
                width: 100%;
                box-sizing: border-box;
            }
            .demographics-table {
                width: 100%;
                border-collapse: collapse;
                border: 1.5px solid #000000;
                margin-bottom: 24px;
                font-size: 11px;
            }
            .demographics-table td {
                padding: 6px 10px;
                border: 1px solid #000000;
                vertical-align: middle;
            }
            .label {
                font-weight: 800;
                text-transform: uppercase;
            }
            .val {
                font-weight: 700;
            }
            .category-block {
                margin-bottom: 24px;
            }
            .category-title {
                text-align: center;
                font-size: 13px;
                font-weight: 900;
                text-transform: uppercase;
                text-decoration: underline;
                margin-bottom: 16px;
                letter-spacing: 0.5px;
            }
            .results-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
                margin-bottom: 12px;
            }
            .results-table th {
                border-bottom: 2px solid #000000;
                padding: 6px;
                text-align: left;
                font-weight: 800;
                text-transform: uppercase;
            }
            .results-table td {
                padding: 6px;
                border-bottom: 1px solid #e5e7eb;
                vertical-align: top;
            }
            .test-method {
                font-size: 10.5px;
                margin-top: 10px;
                color: #1f2937;
            }
            .test-method-label {
                font-weight: 900;
            }
            .signature-block {
                margin-top: 40px;
                text-align: right;
                font-size: 11px;
            }
            .signature-name {
                font-family: Georgia, serif;
                font-style: italic;
                font-weight: bold;
                font-size: 20px;
                margin-bottom: 4px;
            }
            .signature-line {
                border-top: 1px solid #000000;
                width: 200px;
                margin-left: auto;
                margin-top: 4px;
                margin-bottom: 4px;
            }
            .signature-title {
                font-weight: 800;
            }
            .signature-sub {
                color: #4b5563;
                font-weight: 600;
            }
            .page-break {
                page-break-before: always;
            }
        </style>
    </head>
    <body>
        <div class="page-container">
            <!-- Boxed Demographics Table -->
            <table class="demographics-table">
                <tr>
                    <td style="width: 58%;">
                        <span class="label">NAME :</span> <span class="val">${record.patientName}</span>
                    </td>
                    <td style="width: 42%;">
                        <span class="label">Age :</span> <span class="val">${patientAge}</span> &nbsp;&nbsp;&nbsp;&nbsp;
                        <span class="label">Sex :</span> <span class="val">${patientGender}</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span class="label">Ref/Dr :</span> <span class="val">${record.referredBy || "SELF (Self)"}</span>
                    </td>
                    <td>
                        <span class="label">Registration Date :</span> <span class="val">${record.registrationDate || todayDate}</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span class="label">Sample Drawn By :</span> <span class="val">${record.sampleReceived?.person || "Zedlabs, Eluru"}</span>
                    </td>
                    <td>
                        <span class="label">Report Issued Date :</span> <span class="val">${record.authorizedAt || record.registrationDate || todayDate}</span>
                    </td>
                </tr>
                <tr>
                    <td>
                        <span class="label">SAMPLE :</span> <span class="val">${sampleTypeText}</span>
                    </td>
                    <td>
                        <span class="label">Report No :</span> <span class="val" style="font-family: monospace;">${record.registrationNumber}</span>
                    </td>
                </tr>
            </table>

            <!-- Organ / Category Grouped Sections -->
            ${categoryKeys.map((catName, idx) => {
                const items = categoryGroups[catName];
                return `
                    <div class="category-block ${idx > 0 ? "page-break" : ""}">
                        <div class="category-title">${catName} REPORT#</div>
                        <table class="results-table">
                            <thead>
                                <tr>
                                    <th style="width: 42%;">Test Name</th>
                                    <th style="width: 25%;">Observed Value</th>
                                    <th style="width: 33%;">Reference Range</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.map(item => `
                                    <tr>
                                        <td style="font-weight: 700;">${item.testName}</td>
                                        <td style="font-weight: 800;">${item.resultValue || "—"} ${item.unit || ""}</td>
                                        <td style="white-space: pre-line;">${item.referenceRange || "-"}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>

                        <div class="test-method">
                            <span class="test-method-label">Test Method :-</span> Enzyme Kinetic Assay; Fully Automated Biochemistry & Hematology Analyzer
                        </div>
                    </div>
                `;
            }).join("")}

            ${record.notes ? `
                <div style="margin-top: 15px; font-size: 11px;">
                    <span style="font-weight: 800; text-transform: uppercase;">Clinical Remarks:</span>
                    <span style="font-style: italic;">${record.notes}</span>
                </div>
            ` : ""}

            <!-- Pathologist Signature Block -->
            <div class="signature-block">
                <div class="signature-name">${record.authorizedBy || "Dr. Ravi Kumar Manyam"}</div>
                <div class="signature-line"></div>
                <div class="signature-title">Dr. Ravi Kumar Manyam; Ph.D</div>
                <div class="signature-sub">Biochemist & Pathologist</div>
            </div>
        </div>
    </body>
    </html>
    `;

    // Acquire singleton/reused browser instance
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "15mm",
                bottom: "15mm",
                left: "15mm",
                right: "15mm"
            }
        });
        return pdfBuffer;
    } finally {
        await page.close();
    }
}

module.exports = { generatePathologyPDF, getBrowser };

