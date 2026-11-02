const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

let browserInstance = null;

let cachedAssets = null;

function getLetterheadAssets(forceReload = false) {
  if (cachedAssets && !forceReload) return cachedAssets;

  let headerBase64 = "";
  let footerBase64 = "";
  let logoBase64 = "";

  const candidateDirs = [
    path.join(__dirname, "../assets/logos"),
    path.join(__dirname, "../../frontend/public/images/logos"),
    path.join(__dirname, "../../frontend/public/images/logo's"),
  ];

  for (const dir of candidateDirs) {
    try {
      const hPath = path.join(dir, "header.png");
      const fPath = path.join(dir, "footer.png");
      const lPath = path.join(dir, "logo.png");

      if (!headerBase64 && fs.existsSync(hPath)) {
        headerBase64 = `data:image/png;base64,${fs.readFileSync(hPath).toString("base64")}`;
      }
      if (!footerBase64 && fs.existsSync(fPath)) {
        footerBase64 = `data:image/png;base64,${fs.readFileSync(fPath).toString("base64")}`;
      }
      if (!logoBase64 && fs.existsSync(lPath)) {
        logoBase64 = `data:image/png;base64,${fs.readFileSync(lPath).toString("base64")}`;
      }
    } catch (e) {
      // ignore
    }
  }

  cachedAssets = { headerBase64, footerBase64, logoBase64 };
  return cachedAssets;
}

async function getBrowser() {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = null;
    try {
      browserInstance = await puppeteer.launch({
        headless: true,
        executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-web-security",
        ],
      });
    } catch (err) {
      browserInstance = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--disable-web-security",
        ],
      });
    }
  }

  return browserInstance;
}

async function resetBrowser() {
  try {
    if (browserInstance) {
      await browserInstance.close().catch(() => {});
    }
  } finally {
    browserInstance = null;
  }
}

/**
 * Generates an official Pathology PDF Report buffer for a given patient registration record.
 * Each test category (e.g., Hematology, Biochemistry, Serology, Microbiology) is printed on its own dedicated page with demographics header, test results, signature block, and note footer.
 * @param {Object} record Patient registration document
 * @returns {Promise<Buffer>} PDF Buffer
 */
async function generatePathologyPDF(record, options = {}) {
    const includeHeaderFooter = options.includeHeaderFooter !== false;
    const includeWatermark = options.watermark !== false;
    const { headerBase64, footerBase64, logoBase64 } = getLetterheadAssets();
    const todayDate = new Date().toLocaleDateString("en-GB");

    // Extract test results and map with populated test details for category / classification
    const allResults = (record.testResults && record.testResults.length > 0)
        ? record.testResults
        : ((record.tests && record.tests.length > 0)
            ? record.tests.map(t => ({
                testName: typeof t === "string" ? t : (t.testName || t.name || "Diagnostic Parameter"),
                resultValue: t.resultValue || "",
                unit: t.unit || "",
                referenceRange: typeof t === "object" ? (t.referenceRange || "-") : "-",
                category: typeof t === "object" ? (t.category || t.organ || "GENERAL PATHOLOGY") : "GENERAL PATHOLOGY",
                method: typeof t === "object" ? (t.method || "") : ""
            }))
            : [{ testName: "Routine Pathology Parameter", resultValue: "", unit: "", referenceRange: "-", category: "GENERAL PATHOLOGY", method: "" }]
        );

    // Strictly render only tests that have entered result values (omit unentered pending tests from PDF)
    const enteredOnly = allResults.filter(tr => {
        const val = tr.toObject ? tr.toObject().resultValue : tr.resultValue;
        return val && String(val).trim() !== "" && String(val).trim() !== "—";
    });
    const rawResults = enteredOnly;

    if (rawResults.length === 0) {
        throw new Error("No test results have been entered yet. Cannot generate PDF report.");
    }

    // Map each result to its specific Classification/Category (checking category FIRST)
    const testResults = rawResults.map(tr => {
        const itemObj = tr.toObject ? tr.toObject() : tr;
        
        const popTest = (typeof itemObj.testId === "object" && itemObj.testId !== null) ? itemObj.testId : null;
        const matchedTest = popTest || (record.tests || []).find(t => {
            if (!t) return false;
            const targetId = itemObj.testId ? (itemObj.testId._id ? itemObj.testId._id.toString() : itemObj.testId.toString()) : null;
            if (t._id && targetId && t._id.toString() === targetId) return true;
            if (t.testName && itemObj.testName && t.testName.trim().toLowerCase() === itemObj.testName.trim().toLowerCase()) return true;
            return false;
        });

        let categoryName = "";
        if (popTest && popTest.category && popTest.category !== "-") {
            categoryName = popTest.category;
        } else if (itemObj.category && itemObj.category !== "-") {
            categoryName = itemObj.category;
        } else if (matchedTest && matchedTest.category && matchedTest.category !== "-") {
            categoryName = matchedTest.category;
        } else if (popTest && popTest.organ && popTest.organ !== "-") {
            categoryName = popTest.organ;
        } else if (itemObj.organ && itemObj.organ !== "-") {
            categoryName = itemObj.organ;
        } else if (matchedTest && matchedTest.organ && matchedTest.organ !== "-") {
            categoryName = matchedTest.organ;
        } else {
            categoryName = "GENERAL PATHOLOGY";
        }

        const methodStr = (popTest && popTest.method && popTest.method !== "-")
            ? popTest.method
            : ((itemObj.method && itemObj.method !== "-")
                ? itemObj.method
                : (matchedTest && matchedTest.method && matchedTest.method !== "-" ? matchedTest.method : ""));

        return {
            ...itemObj,
            category: categoryName.trim().toUpperCase(),
            method: methodStr
        };
    });

    // Group test items strictly by Category / Classification
    const categoryGroups = {};
    testResults.forEach(item => {
        let catKey = item.category || "GENERAL PATHOLOGY";
        if (!categoryGroups[catKey]) {
            categoryGroups[catKey] = [];
        }
        categoryGroups[catKey].push(item);
    });

    const categoryKeys = Object.keys(categoryGroups);

    // Format sample text
    let sampleTypeText = "Clot-Act, Urine";
    if (record.sampleReceived) {
        if (typeof record.sampleReceived === "string") {
            sampleTypeText = record.sampleReceived;
        } else if (typeof record.sampleReceived === "object") {
            sampleTypeText = record.sampleReceived.sampleType || record.sampleReceived.transportMethod || "Clot-Act, Urine";
        }
    }

    const patientAge = record.age ? `${record.age.value} ${record.age.type}` : "N/A";
    const patientGender = record.gender || "N/A";
    const sampleDrawnByText = record.sampleDrawnBy || record.sampleReceived?.person?.name || "Zedlabs, Eluru";
    const reportIssuedDate = record.authorizedAt || record.registrationDate || todayDate;
    const pathologistName = record.authorizedBy || "Dr.Ravi Kumar Manyam";

    // Build HTML template with per-category page wrapping
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <title>Pathology Report - ${record.registrationNumber}</title>
        <style>
            @page {
                size: A4;
                margin: 0;
            }
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                color: #0f172a;
                background-color: #ffffff;
                padding: 0;
                margin: 0;
                font-size: 11px;
                line-height: 1.4;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .report-page {
                min-height: 297mm;
                max-height: 297mm;
                height: 297mm;
                position: relative;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                page-break-after: always;
                break-after: page;
                box-sizing: border-box;
                background: #ffffff;
                overflow: hidden;
            }
            .report-page.last-page {
                page-break-after: auto;
                break-after: auto;
            }
            .report-page-header-banner {
                width: 100%;
                flex-shrink: 0;
            }
            .report-page-header-banner img {
                width: 100%;
                display: block;
            }
            .report-page-footer-banner {
                width: 100%;
                flex-shrink: 0;
                margin-top: auto;
            }
            .report-page-footer-banner img {
                width: 100%;
                display: block;
            }
            .letterhead-clearance-top {
                height: 32mm;
                flex-shrink: 0;
            }
            .letterhead-clearance-bottom {
                height: 22mm;
                flex-shrink: 0;
                margin-top: auto;
            }
            .watermark-layer {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 300px;
                height: 300px;
                opacity: 0.07;
                pointer-events: none;
                z-index: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .watermark-layer img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            .report-content {
                flex: 1;
                position: relative;
                z-index: 1;
                display: flex;
                flex-direction: column;
                padding: 0 32px;
            }
            /* Clean Patient Card matching Medoraa letterhead style */
            .patient-card {
                border: 1.5px solid #cbd5e1;
                border-radius: 8px;
                background: #ffffff;
                margin: 16px 0 16px 0;
                overflow: hidden;
            }
            .patient-card-row {
                display: flex;
                border-bottom: 1px solid #cbd5e1;
            }
            .patient-card-row.last-row {
                border-bottom: none;
            }
            .patient-card-cell {
                padding: 7px 14px;
                box-sizing: border-box;
            }
            .patient-card-cell.with-divider {
                border-right: 1px solid #cbd5e1;
            }
            .meta-label {
                font-size: 9px;
                font-weight: 700;
                color: #64748b;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                margin-bottom: 2px;
            }
            .meta-val {
                font-size: 12.5px;
                font-weight: 800;
                color: #0f172a;
                line-height: 1.25;
            }
            /* Category Section Heading */
            .category-heading {
                font-size: 13px;
                font-weight: 800;
                color: #0f172a;
                margin: 10px 0 8px 0;
                padding-bottom: 4px;
                border-bottom: 1.5px solid #0f172a;
                letter-spacing: 0.3px;
            }
            /* Results Table: Orange Health Labs minimal style */
            .results-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
                margin-bottom: 4px;
            }
            .results-table th {
                border-bottom: 1.5px solid #cbd5e1;
                padding: 7px 8px;
                text-align: left;
                font-weight: 700;
                font-size: 10px;
                text-transform: uppercase;
                color: #64748b;
            }
            .results-table td {
                padding: 7px 8px;
                border-bottom: 1px solid #f1f5f9;
                vertical-align: top;
                color: #0f172a;
            }
            .results-table td.result-val {
                font-weight: 800;
                color: #0f172a;
            }
            .results-table td.ref-range {
                color: #475569;
                font-size: 10px;
                white-space: pre-line;
            }
            .test-method-line {
                font-size: 9px;
                color: #64748b;
                font-style: italic;
                margin: 4px 0 14px 4px;
            }
            .footer-note {
                font-size: 9px;
                color: #64748b;
                font-style: italic;
                margin-bottom: 10px;
            }
            /* Signature Block — Left Aligned (Orange Health Labs style) */
            .signature-section {
                margin-top: 24px;
                margin-bottom: 10px;
            }
            .approved-label {
                font-size: 9.5px;
                color: #64748b;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 2px;
            }
            .sig-name {
                font-family: Georgia, 'Times New Roman', serif;
                font-style: italic;
                font-size: 20px;
                font-weight: 700;
                color: #0f172a;
                line-height: 1.2;
                margin-bottom: 2px;
            }
            .sig-details {
                font-size: 10px;
                font-weight: 700;
                color: #1e293b;
            }
            .sig-role {
                font-size: 9.5px;
                color: #64748b;
                font-weight: 500;
            }
            .page-number {
                font-size: 9px;
                color: #94a3b8;
                font-weight: 600;
                text-align: right;
                margin-top: auto;
                margin-bottom: 4px;
            }
        </style>
    </head>
    <body>
        ${categoryKeys.map((categoryName, catIndex) => {
            const items = categoryGroups[categoryName];
            const isLastPage = catIndex === categoryKeys.length - 1;

            let titleDisplay = categoryName.trim().replace(/#+$/, "").trim();
            if (titleDisplay === titleDisplay.toUpperCase()) {
                titleDisplay = titleDisplay.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
            }

            const methodText = items[0]?.method && items[0].method !== "-"
                ? items[0].method
                : "Enzyme Kinetic Assay; Fully Automated Laboratory Analyzer";

            return `
                <div class="report-page ${isLastPage ? 'last-page' : ''}">
                    ${includeWatermark && logoBase64 ? `
                    <div class="watermark-layer">
                        <img src="${logoBase64}" alt="Watermark" />
                    </div>
                    ` : ""}

                    <!-- Header Banner -->
                    ${includeHeaderFooter && headerBase64 ? `
                    <div class="report-page-header-banner">
                        <img src="${headerBase64}" alt="Medoraa Labs" />
                    </div>
                    ` : `
                    <div class="letterhead-clearance-top"></div>
                    `}

                    <!-- Content -->
                    <div class="report-content">
                        <div>
                            <!-- Patient Demographics Card -->
                            <div class="patient-card">
                                <div class="patient-card-row">
                                    <div class="patient-card-cell with-divider" style="width: 50%;">
                                        <div class="meta-label">REGISTRATION NO.</div>
                                        <div class="meta-val">${record.registrationNumber}</div>
                                    </div>
                                    <div class="patient-card-cell" style="width: 50%;">
                                        <div class="meta-label">DATE &amp; TIME</div>
                                        <div class="meta-val">${record.registrationDate || todayDate} ${record.registrationTime ? `| ${record.registrationTime}` : ""}</div>
                                    </div>
                                </div>
                                <div class="patient-card-row">
                                    <div class="patient-card-cell with-divider" style="width: 50%;">
                                        <div class="meta-label">PATIENT NAME</div>
                                        <div class="meta-val" style="text-transform: uppercase;">${record.patientName}</div>
                                    </div>
                                    <div class="patient-card-cell" style="width: 50%;">
                                        <div class="meta-label">AGE / GENDER</div>
                                        <div class="meta-val">${patientAge} / ${patientGender}</div>
                                    </div>
                                </div>
                                <div class="patient-card-row last-row">
                                    <div class="patient-card-cell with-divider" style="width: 50%;">
                                        <div class="meta-label">REF. BY</div>
                                        <div class="meta-val">${record.referredBy || "Self"}</div>
                                    </div>
                                    <div class="patient-card-cell" style="width: 50%;">
                                        <div class="meta-label">SAMPLE TYPE</div>
                                        <div class="meta-val">${sampleTypeText}</div>
                                    </div>
                                </div>
                            </div>

                            <!-- Category Section Heading -->
                            <div class="category-heading">${titleDisplay}</div>

                            <!-- Results Table -->
                            <table class="results-table">
                                <thead>
                                    <tr>
                                        <th style="width: 42%;">Test</th>
                                        <th style="width: 24%;">Result</th>
                                        <th style="width: 34%;">Biological Reference Interval</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${items.map(item => `
                                        <tr>
                                            <td style="font-weight: 600;">${item.testName}</td>
                                            <td class="result-val">${item.resultValue || "—"} ${item.unit || ""}</td>
                                            <td class="ref-range">${item.referenceRange || "-"}</td>
                                        </tr>
                                    `).join("")}
                                </tbody>
                            </table>
                            <div class="test-method-line">${sampleTypeText} | ${methodText}</div>

                            ${record.notes ? `
                                <div style="font-size: 10px; color: #334155; margin-bottom: 8px;">
                                    <strong>Clinical Remarks:</strong> <em>${record.notes}</em>
                                </div>
                            ` : ""}

                            <div class="footer-note">Note: Please correlate clinically. Contact us for any discrepancy.</div>

                            <!-- Pathologist Signature Directly Below Note -->
                            <div class="signature-section">
                                <div class="approved-label">Approved by</div>
                                <div class="sig-name">${pathologistName}</div>
                                <div class="sig-details">Dr. Ravi Kumar Manyam, Ph.D</div>
                                <div class="sig-role">Biochemist &amp; Pathologist</div>
                            </div>
                        </div>

                        ${categoryKeys.length > 1 ? `
                        <div class="page-number">Page ${catIndex + 1} of ${categoryKeys.length}</div>
                        ` : ""}
                    </div>

                    <!-- Footer Banner -->
                    ${includeHeaderFooter && footerBase64 ? `
                    <div class="report-page-footer-banner">
                        <img src="${footerBase64}" alt="Medoraa Labs Footer" />
                    </div>
                    ` : `
                    <div class="letterhead-clearance-bottom"></div>
                    `}
                </div>
            `;
        }).join("")}
    </body>
    </html>
    `;

    // Acquire singleton/reused browser instance
    let browser;
    let page;
    try {
        browser = await getBrowser();
        page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "domcontentloaded", timeout: 60000 });
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "0mm",
                bottom: "0mm",
                left: "0mm",
                right: "0mm"
            }
        });
        return pdfBuffer;
    } catch (err) {
        await resetBrowser();
        throw err;
    } finally {
        if (page) await page.close().catch(() => {});
    }
}

/**
 * Helper to generate Code128 Vector SVG
 */
function generateCode128SVG(text) {
    const CODE128B_PATTERNS = [
        "212222","222122","222221","121223","121322","131222","122213","122312","132212","221213",
        "221312","231212","112232","122132","122231","113222","123122","123221","223211","221132",
        "221231","213212","223112","312131","311222","321122","321221","312212","322112","322211",
        "212123","212321","232121","111323","131123","131321","112313","132113","132311","211313",
        "231113","231311","112133","112331","132131","113123","113321","133121","313121","211331",
        "231131","213113","213311","213131","311123","311321","331121","312113","312311","332111",
        "314111","221411","431111","111224","111422","121124","121421","141122","141221","112214",
        "112412","122114","122411","142112","142211","241211","221114","413111","241112","134111",
        "111242","121142","121241","114212","124112","124211","411212","421112","421211","212141",
        "214121","412121","111143","111341","131141","114113","114311","411113","411311","113141",
        "114131","311141","411131","211412","211214","211232","2331112"
    ];
    const START_B = 104;
    const STOP = 106;

    let checksum = START_B;
    let patternSequence = [CODE128B_PATTERNS[START_B]];

    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const codeVal = charCode - 32;
        if (codeVal >= 0 && codeVal <= 95) {
            checksum += codeVal * (i + 1);
            patternSequence.push(CODE128B_PATTERNS[codeVal]);
        }
    }

    const checkDigit = checksum % 103;
    patternSequence.push(CODE128B_PATTERNS[checkDigit]);
    patternSequence.push(CODE128B_PATTERNS[STOP]);

    const fullPattern = patternSequence.join("");
    let x = 0;
    const barHeight = 40;
    let rects = "";

    for (let i = 0; i < fullPattern.length; i++) {
        const width = parseInt(fullPattern[i], 10);
        if (i % 2 === 0) {
            rects += `<rect x="${x}" y="0" width="${width}" height="${barHeight}" fill="#000000"/>`;
        }
        x += width;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x} ${barHeight}" width="100%" height="${barHeight}px" preserveAspectRatio="none">${rects}</svg>`;
}

/**
 * Generates an official Thermal Outsource Transfer Label PDF Buffer (100mm x 150mm / 4" x 6")
 * @param {Object} record Patient registration document
 * @param {Object} [hospitalDoc] Destination hospital document (if matched)
 * @returns {Promise<Buffer>} PDF Buffer
 */
async function generateTransferLabelPDF(record, hospitalDoc = null) {
    const transfer = record.sampleTransfer || {};
    const refLabName = (transfer.referenceLab || "REFERENCE LABORATORY").toUpperCase();
    
    // Address & Contact info resolution
    let labAddress = "Diagnostic Outsource Center";
    let labPhone = transfer.contactNumber || "N/A";
    let pocName = transfer.contactPersonName || "Lab In-Charge";

    if (!hospitalDoc && transfer.referenceLab) {
        try {
            const Hospital = require("../models/Hospital");
            hospitalDoc = await Hospital.findOne({
                $or: [
                    { hospitalName: new RegExp(`^${transfer.referenceLab.trim()}$`, "i") },
                    { "labs.labName": new RegExp(`^${transfer.referenceLab.trim()}$`, "i") }
                ]
            });
        } catch (err) {}
    }

    if (hospitalDoc) {
        if (hospitalDoc.pocName) pocName = hospitalDoc.pocName;
        if (hospitalDoc.telephoneNumber) labPhone = hospitalDoc.telephoneNumber;
        if (hospitalDoc.address) {
            const addrParts = [
                hospitalDoc.address.doorNo,
                hospitalDoc.address.completeAddress,
                hospitalDoc.address.city || hospitalDoc.address.village,
                hospitalDoc.address.district,
                hospitalDoc.address.state,
                hospitalDoc.address.pincode ? `PIN: ${hospitalDoc.address.pincode}` : ""
            ].filter(Boolean);
            if (addrParts.length > 0) labAddress = addrParts.join(", ");
        }
    }

    const dateStr = transfer.transferredAt ? new Date(transfer.transferredAt).toLocaleString("en-GB") : new Date().toLocaleString("en-GB");

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <title>Sample Transfer Label - ${refLabName}</title>
        <style>
            @page {
                size: 100mm 150mm;
                margin: 0;
            }
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                width: 100mm;
                height: 150mm;
                font-family: Arial, Helvetica, sans-serif;
                background-color: #ffffff;
                color: #000000;
                padding: 4mm;
                font-size: 11px;
                line-height: 1.35;
            }
            .label-box {
                border: 2.5px solid #000000;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 4mm;
            }
            .header-banner {
                background-color: #000000;
                color: #ffffff;
                text-align: center;
                padding: 6px 0;
                font-weight: 900;
                font-size: 12px;
                letter-spacing: 1.5px;
                text-transform: uppercase;
            }
            .card-section {
                border: 1.5px solid #000000;
                border-radius: 4px;
                padding: 10px 12px;
                margin-top: 10px;
                background-color: #ffffff;
            }
            .badge-header {
                font-size: 10px;
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: 0.8px;
                padding-bottom: 4px;
                margin-bottom: 6px;
                border-bottom: 1.5px solid #000000;
            }
            .from-badge {
                color: #000000;
            }
            .to-badge {
                color: #000000;
                font-size: 11px;
            }
            .lab-name-from {
                font-size: 13px;
                font-weight: 900;
                text-transform: uppercase;
                color: #000000;
                margin-bottom: 2px;
            }
            .lab-name-to {
                font-size: 16px;
                font-weight: 900;
                text-transform: uppercase;
                color: #000000;
                line-height: 1.25;
                margin-bottom: 4px;
            }
            .sub-text {
                font-size: 10px;
                font-weight: 600;
                color: #334155;
                margin-bottom: 4px;
            }
            .address-text {
                font-size: 11px;
                font-weight: 700;
                color: #000000;
                line-height: 1.4;
                margin-top: 4px;
            }
            .contact-row {
                font-size: 10.5px;
                font-weight: 700;
                color: #000000;
                margin-top: 5px;
            }
            .footer-warning {
                font-size: 8.5px;
                font-weight: 900;
                text-align: center;
                border-top: 1.5px solid #000000;
                padding-top: 5px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
        </style>
    </head>
    <body>
        <div class="label-box">
            <div>
                <!-- Header Banner -->
                <div class="header-banner">
                    SAMPLE TRANSFER DISPATCH LABEL
                </div>

                <!-- FROM ADDRESS (SENDER LAB) -->
                <div class="card-section" style="background-color: #f8fafc;">
                    <div class="badge-header from-badge">FROM (SENDER LAB):</div>
                    <div class="lab-name-from">MEDORAA LABS & DIAGNOSTICS</div>
                    <div class="sub-text">Diagnostic & Pathology Clinical Services</div>
                    <div class="address-text">
                        Main Center, Eluru Road, Eluru<br/>
                        Andhra Pradesh - 534001
                    </div>
                    <div class="contact-row" style="margin-top: 6px;">
                        <strong>Phone:</strong> +91 40 2345 6789 / +91 98765 43210
                    </div>
                    <div class="contact-row">
                        <strong>Email:</strong> contact@medoraalabs.com
                    </div>
                    <div class="contact-row" style="font-size: 9.5px; color: #475569; margin-top: 4px;">
                        <strong>Dispatch Date:</strong> ${dateStr}
                    </div>
                </div>

                <!-- TO ADDRESS (DESTINATION REFERENCE LAB) -->
                <div class="card-section" style="margin-top: 12px; border-width: 2px;">
                    <div class="badge-header to-badge">TO (DESTINATION / REFERENCE LAB):</div>
                    <div class="lab-name-to">${refLabName}</div>
                    ${hospitalDoc?.branch ? `<div class="sub-text" style="font-size: 11px; font-weight: 800;">Branch: ${hospitalDoc.branch}</div>` : ""}
                    <div class="contact-row" style="margin-top: 6px;">
                        <strong>Attn / Contact Person:</strong> ${pocName}
                    </div>
                    <div class="address-text" style="margin-top: 6px;">
                        <strong>Delivery Address:</strong><br/>
                        ${labAddress}
                    </div>
                    <div class="contact-row" style="margin-top: 6px; font-size: 11px;">
                        <strong>Contact Number:</strong> ${labPhone}
                    </div>
                </div>
            </div>

            <!-- Footer Warning Banner -->
            <div class="footer-warning">
                ★ CAUTION: BIOLOGICAL DIAGNOSTIC SPECIMEN — HANDLE WITH CARE ★
            </div>
        </div>
    </body>
    </html>
    `;

    let browser;
    let page;
    try {
        browser = await getBrowser();
        page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "domcontentloaded", timeout: 60000 });
        const pdfBuffer = await page.pdf({
            width: "100mm",
            height: "150mm",
            printBackground: true,
            margin: {
                top: "2mm",
                bottom: "2mm",
                left: "2mm",
                right: "2mm"
            }
        });
        return pdfBuffer;
    } catch (err) {
        await resetBrowser();
        throw err;
    } finally {
        if (page) await page.close().catch(() => {});
    }
}

/**
 * Generates an official Patient Registration & Payment Receipt PDF Buffer
 * Classic diagnostic lab receipt layout design.
 * @param {Object} record Patient registration document
 * @returns {Promise<Buffer>} PDF Buffer
 */
/**
 * Builds the receipt HTML string for a given patient record (sync, no Puppeteer).
 * Shared by both the HTML preview endpoint and the PDF generator.
 * @param {Object} record Patient registration document
 * @returns {string} HTML string
 */
function buildReceiptHTML(record, autoPrint = false, options = {}) {
    const includeHeaderFooter = options.includeHeaderFooter !== false;
    const includeWatermark = options.watermark !== false;
    const { headerBase64, footerBase64, logoBase64 } = getLetterheadAssets();
    const regNo = record.registrationNumber || record._id;
    const barcodeSVG = generateCode128SVG(regNo);
    const dateStr = record.registrationDate || new Date().toLocaleDateString("en-GB");
    const timeStr = record.registrationTime || new Date().toLocaleTimeString();

    const tests = record.tests || [];
    const computedSubtotal = tests.reduce((sum, t) => sum + (parseFloat(t.patientPrice || t.price || 0) || 0), 0);
    const subtotal = (record.subtotal !== undefined && record.subtotal > 0) ? record.subtotal : computedSubtotal;

    let rawDiscount = record.discount || 0;
    let discount = rawDiscount;
    if (record.discountType === "percentage" && rawDiscount > 0 && rawDiscount <= 100) {
        discount = (subtotal * rawDiscount) / 100;
    }
    discount = Math.min(subtotal, Math.max(0, discount));

    const computedTotalAmount = Math.max(0, subtotal - discount);
    const totalAmount = (record.totalAmount !== undefined && record.totalAmount > 0 && record.totalAmount !== subtotal)
        ? record.totalAmount
        : computedTotalAmount;
    const paidAmount = record.paidAmount !== undefined ? Number(record.paidAmount) : (record.paid !== undefined ? Number(record.paid) : totalAmount);
    const balanceDue = Math.max(0, totalAmount - paidAmount);
    const paymentMethod = record.paymentMethod || "Cash";

    const testChunks = [];
    if (tests.length === 0) {
        testChunks.push([]);
    } else {
        for (let i = 0; i < tests.length; i += 6) {
            testChunks.push(tests.slice(i, i + 6));
        }
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <title>Receipt - ${regNo}</title>
        <style>
            @page {
                size: A4;
                margin: 0;
            }
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                color: #0f172a;
                background-color: #ffffff;
                padding: 0;
                margin: 0;
                font-size: 11.5px;
                line-height: 1.4;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            @media print {
                body {
                    background-color: #ffffff;
                    padding: 0;
                    margin: 0;
                }
                .no-print { display: none !important; }
                .page-break { page-break-after: always; break-after: page; }
            }
            .page-wrapper {
                display: flex;
                flex-direction: column;
                min-height: 297mm;
                max-height: 297mm;
                height: 297mm;
                position: relative;
                box-sizing: border-box;
                background: #ffffff;
                overflow: hidden;
            }
            .page-wrapper.page-break {
                page-break-after: always;
                break-after: page;
            }
            .page-header-banner {
                width: 100%;
                flex-shrink: 0;
                margin: 0;
                padding: 0;
                line-height: 0;
            }
            .page-header-banner img {
                width: 100%;
                display: block;
            }
            .page-footer-banner {
                width: 100%;
                flex-shrink: 0;
                margin-top: auto;
            }
            .page-footer-banner img {
                width: 100%;
                display: block;
            }
            .page-letterhead-clearance-top {
                height: 32mm;
                flex-shrink: 0;
            }
            .page-letterhead-clearance-bottom {
                height: 22mm;
                flex-shrink: 0;
                margin-top: auto;
            }
            .receipt-body {
                flex: 1;
                position: relative;
                z-index: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 0;
            }
            .receipt-watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 300px;
                height: 300px;
                opacity: 0.07;
                pointer-events: none;
                z-index: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .receipt-watermark img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            .receipt-content-inner {
                position: relative;
                z-index: 1;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                flex: 1;
                padding: 0 32px;
            }
            /* Clean Patient Card matching exact user reference */
            .patient-card {
                border: 1.5px solid #cbd5e1;
                border-radius: 8px;
                background: #ffffff;
                margin: 16px 0 18px 0;
                overflow: hidden;
            }
            .patient-card-row {
                display: flex;
                border-bottom: 1px solid #cbd5e1;
            }
            .patient-card-row.last-row {
                border-bottom: none;
            }
            .patient-card-cell {
                padding: 7px 14px;
                box-sizing: border-box;
            }
            .patient-card-cell.with-divider {
                border-right: 1px solid #cbd5e1;
            }
            .meta-label {
                font-size: 9px;
                font-weight: 700;
                color: #64748b;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                margin-bottom: 2px;
            }
            .meta-val {
                font-size: 12.5px;
                font-weight: 800;
                color: #0f172a;
                line-height: 1.25;
            }
            .section-title {
                font-size: 10.5px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #1e293b;
                margin-bottom: 6px;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 14px;
                font-size: 10.5px;
            }
            .items-table th {
                background-color: #f8fafc;
                border-top: 1.5px solid #cbd5e1;
                border-bottom: 1.5px solid #cbd5e1;
                padding: 6px 8px;
                text-align: left;
                font-weight: 700;
                font-size: 9.5px;
                text-transform: uppercase;
                color: #475569;
            }
            .items-table td {
                padding: 6px 8px;
                border-bottom: 1px solid #e2e8f0;
                vertical-align: middle;
                color: #0f172a;
            }
            .summary-table {
                width: 48%;
                margin-left: auto;
                border-collapse: collapse;
                margin-bottom: 14px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                overflow: hidden;
            }
            .summary-table td {
                padding: 5px 10px;
                border-bottom: 1px solid #e2e8f0;
                font-size: 10.5px;
            }
            .summary-label {
                font-weight: 700;
                text-align: right;
                text-transform: uppercase;
                font-size: 9.5px;
                color: #475569;
            }
            .summary-val {
                text-align: right;
                font-weight: 800;
                font-size: 11px;
                color: #0f172a;
            }
            .total-row td {
                background-color: #f1f5f9;
                font-size: 11.5px;
            }
            .barcode-section {
                text-align: center;
                margin-top: 10px;
                margin-bottom: 16px;
            }
            .barcode-box {
                display: inline-block;
                width: 210px;
            }
            .barcode-num {
                font-family: monospace;
                font-size: 10.5px;
                font-weight: 800;
                letter-spacing: 2px;
                margin-top: 3px;
                color: #1e293b;
            }
            .signature-section {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 20px;
                padding-top: 8px;
                font-size: 9.5px;
                font-weight: 700;
                color: #334155;
            }
            .sig-box {
                text-align: center;
                width: 190px;
            }
            .sig-line {
                border-top: 1px solid #94a3b8;
                margin-bottom: 4px;
            }
            .footer-note {
                font-size: 9px;
                text-align: center;
                color: #64748b;
                border-top: 1px dashed #cbd5e1;
                padding-top: 6px;
                margin-top: 12px;
                margin-bottom: 8px;
            }
        </style>
    </head>
    <body>
        ${testChunks.map((chunk, chunkIndex) => {
            const isLastPage = chunkIndex === testChunks.length - 1;
            
            return `
        <div class="page-wrapper ${!isLastPage ? 'page-break' : ''}">

            <!-- FULL-WIDTH HEADER BANNER -->
            ${includeHeaderFooter && headerBase64 ? `
            <div class="page-header-banner">
                <img src="${headerBase64}" alt="Medoraa Labs" />
            </div>
            ` : `
            <div class="page-letterhead-clearance-top"></div>
            `}

            <!-- RECEIPT BODY (No outer black border) -->
            <div class="receipt-body">
                ${includeWatermark && logoBase64 ? `
                <div class="receipt-watermark">
                    <img src="${logoBase64}" alt="Watermark" />
                </div>
                ` : ""}

                <div class="receipt-content-inner">
                    <div>
                        <!-- Patient Card matching user sample image -->
                        <div class="patient-card">
                            <div class="patient-card-row">
                                <div class="patient-card-cell with-divider" style="width: 50%;">
                                    <div class="meta-label">REGISTRATION NO.</div>
                                    <div class="meta-val">${regNo}</div>
                                </div>
                                <div class="patient-card-cell" style="width: 50%;">
                                    <div class="meta-label">DATE &amp; TIME</div>
                                    <div class="meta-val">${dateStr} | ${timeStr}</div>
                                </div>
                            </div>
                            <div class="patient-card-row">
                                <div class="patient-card-cell with-divider" style="width: 50%;">
                                    <div class="meta-label">PATIENT NAME</div>
                                    <div class="meta-val" style="text-transform: uppercase;">${record.patientName}</div>
                                </div>
                                <div class="patient-card-cell" style="width: 50%;">
                                    <div class="meta-label">AGE / GENDER</div>
                                    <div class="meta-val">${record.age?.value ? `${record.age.value} ${record.age.type}` : "N/A"} / ${record.gender || "N/A"}</div>
                                </div>
                            </div>
                            <div class="patient-card-row last-row">
                                <div class="patient-card-cell" style="width: 100%;">
                                    <div class="meta-label">MOBILE NUMBER</div>
                                    <div class="meta-val">+91 ${record.mobileNumber || "N/A"}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Prescribed Tests / Billing Table -->
                        <div class="section-title">
                            Prescribed Investigations &amp; Charges
                        </div>
                        <table class="items-table">
                            <thead>
                                <tr>
                                    <th style="width: 8%; text-align: center;">S.No</th>
                                    <th style="width: 52%;">Test / Parameter Name</th>
                                    <th style="width: 22%;">Category</th>
                                    <th style="width: 18%; text-align: right;">Price (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${chunk.length > 0 ? chunk.map((t, idx) => `
                                    <tr>
                                        <td style="text-align: center; font-weight: 700;">${(chunkIndex * 6) + idx + 1}</td>
                                        <td style="font-weight: 700;">${typeof t === 'string' ? t : (t.testName || t.name)}</td>
                                        <td style="text-transform: uppercase; font-size: 9.5px; color: #475569;">${(typeof t === 'object' && t.category) ? t.category : "General"}</td>
                                        <td style="text-align: right; font-weight: 800; font-family: monospace;">₹${parseFloat(t.patientPrice || 0).toFixed(2)}</td>
                                    </tr>
                                `).join("") : `
                                    <tr>
                                        <td colspan="4" style="text-align: center; color: #64748b; font-style: italic; padding: 12px;">
                                            No tests selected for this registration.
                                        </td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                    </div>

                    <div>
                        ${isLastPage ? `
                        <!-- Billing Totals Summary -->
                        <table class="summary-table">
                            <tr>
                                <td class="summary-label">Subtotal Amount:</td>
                                <td class="summary-val">₹${parseFloat(subtotal).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td class="summary-label">Discount:</td>
                                <td class="summary-val" style="color: #16a34a;">${discount > 0 ? `- ₹${parseFloat(discount).toFixed(2)}` : `₹0.00`}</td>
                            </tr>
                            <tr class="total-row">
                                <td class="summary-label" style="font-weight: 900; color: #0f172a;">Total Net Amount:</td>
                                <td class="summary-val" style="font-weight: 900; font-size: 12.5px;">₹${parseFloat(totalAmount).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td class="summary-label" style="font-weight: 800; color: #1e40af;">Amount Paid by Patient:</td>
                                <td class="summary-val" style="font-weight: 900; color: #1e40af;">₹${parseFloat(paidAmount).toFixed(2)}</td>
                            </tr>
                            ${balanceDue > 0 ? `
                            <tr>
                                <td class="summary-label" style="color: #dc2626; font-weight: 800;">Balance Due:</td>
                                <td class="summary-val" style="color: #dc2626; font-weight: 900;">₹${parseFloat(balanceDue).toFixed(2)}</td>
                            </tr>
                            ` : ""}
                            <tr>
                                <td class="summary-label">Payment Mode:</td>
                                <td class="summary-val" style="text-transform: uppercase;">${paymentMethod}</td>
                            </tr>
                        </table>
                        ` : `<div style="text-align: right; font-size: 10px; font-weight: 700; color: #64748b; margin-bottom: 16px;">Continued on next page...</div>`}

                        <!-- Barcode Section -->
                        <div class="barcode-section">
                            <div class="barcode-box">
                                ${barcodeSVG}
                                <div class="barcode-num">* ${regNo} *</div>
                            </div>
                        </div>

                        <!-- Signatures -->
                        <div class="signature-section">
                            <div class="sig-box">
                                <div class="sig-line"></div>
                                <div>ISSUED BY DESK OPERATOR</div>
                            </div>
                            <div class="sig-box">
                                <div class="sig-line"></div>
                                <div>AUTHORIZED SIGNATURE</div>
                            </div>
                        </div>

                        <!-- Footer Disclaimer -->
                        <div class="footer-note">
                            Thank you for choosing Medoraa Labs. Please bring this receipt for sample status queries.
                        </div>
                    </div>
                </div>
            </div>

            <!-- FULL-WIDTH FOOTER BANNER -->
            ${includeHeaderFooter && footerBase64 ? `
            <div class="page-footer-banner">
                <img src="${footerBase64}" alt="Medoraa Labs Footer" />
            </div>
            ` : `
            <div class="page-letterhead-clearance-bottom"></div>
            `}

        </div>
    `;
    }).join("")}
        ${autoPrint ? `<script>
            window.onload = function() {
                window.print();
            };
        </script>` : ''}
    </body>
    </html>
    `;
    return htmlContent;
}

async function generateReceiptPDF(record, options = {}) {
    const htmlContent = buildReceiptHTML(record, false, options);

    let browser;
    let page;
    try {
        browser = await getBrowser();
        page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "domcontentloaded", timeout: 60000 });
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "0mm",
                bottom: "0mm",
                left: "0mm",
                right: "0mm"
            }
        });
        return pdfBuffer;
    } catch (err) {
        await resetBrowser();
        throw err;
    } finally {
        if (page) await page.close().catch(() => {});
    }
}

/**
 * Builds the standalone 50x15mm Bottle/Vial Label HTML string for a given patient record.
 * Displays ONLY:
 * 1. NAME: [Patient Name]
 * 2. AGE: [Age] • GENDER: [Gender]
 * 3. TEST: [Prescribed Test]
 * Centered horizontally and vertically on a single 50x15mm sticker.
 * @param {Object} record Patient registration document
 * @param {boolean} autoPrint Automatically trigger window.print() on load
 * @returns {string} HTML string
 */
function buildBottleLabelHTML(record, autoPrint = false, rotation = 0) {
    const pageW = "50mm";
    const pageH = "15mm";

    const patientName = (record.patientName || "").toUpperCase().trim() || "PATIENT";
    const ageVal = record.age?.value || "";
    let ageType = "Y";
    if (record.age?.type) {
        ageType = record.age.type.toLowerCase().startsWith("y") ? "Y" : record.age.type.substring(0, 1).toUpperCase();
    }
    const ageDisplay = ageVal ? `${ageVal} ${ageType}` : "N/A";
    const genderDisplay = (record.gender || "N/A").toUpperCase();

    // Dynamic scaling for name (+2px larger: base 8.0px)
    const nameLen = patientName.length;
    let nameFontSize = "8.0px";
    if (nameLen > 28) {
        nameFontSize = "6.8px";
    } else if (nameLen > 20) {
        nameFontSize = "7.4px";
    }

    // Extract all test names into a single list
    let rawTests = [];
    if (Array.isArray(record.tests) && record.tests.length > 0) {
        rawTests = record.tests;
    } else if (Array.isArray(record.testResults) && record.testResults.length > 0) {
        rawTests = record.testResults;
    }

    const testNamesList = rawTests.map(t => {
        if (typeof t === "object" && t !== null) {
            return (t.testName || t.name || "").trim();
        }
        return String(t || "").trim();
    }).filter(Boolean);

    const uniqueTests = Array.from(new Set(testNamesList.length > 0 ? testNamesList : ["ROUTINE TEST"]));
    const testsJoined = uniqueTests.join(", ").toUpperCase();
    const testsLen = testsJoined.length;

    // Normal patients (1-4 tests): stays large at 6.0px
    // Extreme orders (10-13+ tests): automatically scales down to 4.0px with zero bottom cutoff
    let testFontSize = "6.0px";
    let testLineHeight = "1.15";
    if (testsLen > 180) {
        testFontSize = "4.0px";
        testLineHeight = "0.95";
    } else if (testsLen > 120) {
        testFontSize = "4.6px";
        testLineHeight = "1.02";
    } else if (testsLen > 70) {
        testFontSize = "5.2px";
        testLineHeight = "1.08";
    }

    const topPadding = testsLen > 180 ? "3.0mm" : "4.0mm";
    const rowMargin = testsLen > 180 ? "0.05mm" : "0.1mm";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8" />
        <title>Bottle Label - ${record.patientName || 'Specimen'}</title>
        <style>
            @page {
                size: ${pageW} ${pageH};
                margin: 0;
            }
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            html, body {
                width: ${pageW};
                height: ${pageH};
                margin: 0;
                padding: 0;
                overflow: hidden;
                background: #ffffff;
                color: #000000;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                font-size: 5.0px;
                line-height: 1.1;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .label-page {
                width: ${pageW};
                height: ${pageH};
                box-sizing: border-box;
                position: relative;
                page-break-after: avoid;
                break-after: avoid;
                page-break-inside: avoid;
                break-inside: avoid;
                overflow: hidden;
                background: #ffffff;
                font-size: 5.0px;
                line-height: 1.1;
                padding: 0;
                margin: 0;
            }
            .label-content {
                width: 48.5mm;
                box-sizing: border-box;
                text-align: left;
                font-size: 5.0px;
                line-height: 1.1;
                padding: ${topPadding} 0.8mm 0 0.8mm;
                margin: 0;
                background: #ffffff;
            }
            .label-row {
                width: 100%;
                box-sizing: border-box;
                display: flex;
                align-items: baseline;
                justify-content: flex-start;
                text-align: left;
                font-size: 5.0px;
                line-height: 1.1;
                margin: 0;
                padding: 0;
            }
            .name-row {
                white-space: nowrap;
                line-height: 1.1;
                margin: 0 0 ${rowMargin} 0;
                padding: 0;
            }
            .demo-row {
                white-space: nowrap;
                line-height: 1.1;
                margin: 0 0 ${rowMargin} 0;
                padding: 0;
                gap: 2.5mm;
            }
            .test-row {
                display: block;
                width: 100%;
                line-height: ${testLineHeight};
                word-break: break-word;
                white-space: normal;
                margin: 0;
                padding: 0;
            }
            .lbl-key {
                font-size: 6.8px;
                font-weight: 700;
                color: #000000;
                letter-spacing: 0.05px;
                flex-shrink: 0;
                white-space: nowrap;
            }
            .test-key {
                font-size: 6.0px;
                font-weight: 700;
                color: #000000;
                letter-spacing: 0.05px;
            }
            .lbl-val {
                font-size: 7.2px;
                font-weight: 600;
                color: #000000;
            }
            .name-val {
                font-size: 8.0px;
                font-weight: 700;
                text-transform: uppercase;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 44mm;
            }
            .test-val {
                font-weight: 600;
                text-transform: uppercase;
                color: #000000;
                word-break: break-word;
                font-size: 6.0px;
            }
        </style>
    </head>
    <body>
        <div class="label-page">
            <div class="label-content">
                <!-- Line 1: N: Patient Name -->
                <div class="label-row name-row">
                    <span class="lbl-key">N:</span>&nbsp;<span class="lbl-val name-val" style="font-size: ${nameFontSize};">${patientName}</span>
                </div>
                <!-- Line 2: AGE: and G: -->
                <div class="label-row demo-row">
                    <div><span class="lbl-key">AGE:</span>&nbsp;<span class="lbl-val">${ageDisplay}</span></div>
                    <div><span class="lbl-key">G:</span>&nbsp;<span class="lbl-val">${genderDisplay}</span></div>
                </div>
                <!-- Line 3: TT: All Test Names -->
                <div class="test-row">
                    <span class="lbl-key test-key" style="font-size: ${testFontSize};">TT:</span>&nbsp;<span class="lbl-val test-val" style="font-size: ${testFontSize};">${testsJoined}</span>
                </div>
            </div>
        </div>
        ${autoPrint ? `
        <script>
            window.onload = function() {
                window.focus();
                window.print();
            };
        </script>
        ` : ''}
    </body>
    </html>
    `;
}

module.exports = { generatePathologyPDF, generateTransferLabelPDF, generateReceiptPDF, buildReceiptHTML, buildBottleLabelHTML, getBrowser };



