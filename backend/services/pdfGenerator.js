const puppeteer = require("puppeteer");

let browserInstance = null;

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
async function generatePathologyPDF(record) {
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
                margin: 10mm 15mm 10mm 15mm;
            }
            * {
                box-sizing: border-box;
            }
            body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #111827;
                margin: 0;
                padding: 0;
                background-color: #ffffff;
                -webkit-print-color-adjust: exact;
            }
            .report-page {
                box-sizing: border-box;
                min-height: 270mm;
                display: flex;
                flex-direction: column;
                justify-content: flex-start;
                page-break-after: always;
                break-after: page;
            }
            .report-page:last-child {
                page-break-after: auto;
                break-after: auto;
            }
            .demographics-table {
                width: 100%;
                border-collapse: collapse;
                border: 1.5px solid #000000;
                margin-bottom: 20px;
                font-size: 9px;
            }
            .demographics-table td {
                padding: 5px 8px;
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
                flex: 1;
            }
            .category-title {
                text-align: center;
                font-size: 13px;
                font-weight: 900;
                text-transform: uppercase;
                text-decoration: underline;
                margin-bottom: 18px;
                letter-spacing: 0.5px;
            }
            .results-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
                margin-bottom: 16px;
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
                margin-top: 20px;
                color: #1f2937;
            }
            .test-method-label {
                font-weight: 900;
            }
            .footer-note {
                font-size: 10px;
                font-weight: 800;
                color: #000000;
                margin-top: 8px;
            }
            .signature-block {
                text-align: right;
                font-size: 11px;
                margin-top: 30px;
            }
            .signature-name {
                font-family: Georgia, serif;
                font-style: italic;
                font-weight: bold;
                font-size: 20px;
                margin-bottom: 2px;
            }
            .signature-title {
                font-weight: 800;
            }
            .signature-sub {
                color: #4b5563;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        ${categoryKeys.map((categoryName) => {
            const items = categoryGroups[categoryName];
            
            let titleDisplay = categoryName.trim().toUpperCase().replace(/#+$/, "").trim();
            if (!titleDisplay.endsWith("REPORT")) {
                titleDisplay = `${titleDisplay} REPORT`;
            }

            const methodText = items[0]?.method && items[0].method !== "-" 
                ? items[0].method 
                : "Enzyme Kinetic Assay; Fully Automated Laboratory Analyzer";

            return `
                <div class="report-page">
                    <!-- Page Header: Demographics Table -->
                    <div class="page-header">
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
                                    <span class="label">Sample Drawn By :</span> <span class="val">${sampleDrawnByText}</span>
                                </td>
                                <td>
                                    <span class="label">Report Issued Date :</span> <span class="val">${reportIssuedDate}</span>
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
                    </div>

                    <!-- Page Body: Category Test Results -->
                    <div class="category-block">
                        <div class="category-title">${titleDisplay}</div>
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
                            <span class="test-method-label">Test Method :-</span> ${methodText}
                        </div>

                        <div class="footer-note">
                            NOTE : Please Correlate Clinically. If Any Discrepancy, Please Contact.
                        </div>

                        ${record.notes ? `
                            <div style="margin-top: 15px; font-size: 11px;">
                                <span style="font-weight: 800; text-transform: uppercase;">Clinical Remarks:</span>
                                <span style="font-style: italic;">${record.notes}</span>
                            </div>
                        ` : ""}

                        <!-- Pathologist Signature -->
                        <div class="signature-block">
                            <div class="signature-name">${pathologistName}</div>
                            <div class="signature-title">Dr.Ravi Kumar Manyam; Ph.D</div>
                            <div class="signature-sub">Biochemist & Pathologist</div>
                        </div>
                    </div>
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
                top: "10mm",
                bottom: "10mm",
                left: "15mm",
                right: "15mm"
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
function buildReceiptHTML(record, autoPrint = false) {
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
    const paidAmount = (record.paidAmount !== undefined && record.paidAmount > 0 && record.paidAmount !== subtotal)
        ? record.paidAmount
        : (record.paid !== undefined && record.paid > 0 ? record.paid : totalAmount);
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
                margin: 10mm 12mm 10mm 12mm;
            }
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }
            body {
                font-family: 'Georgia', 'Times New Roman', serif;
                color: #000000;
                background-color: #f5f5f5;
                padding: 16px;
                font-size: 12px;
                line-height: 1.4;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            @media print {
                body {
                    background-color: #ffffff;
                    padding: 0;
                }
                .no-print { display: none !important; }
                .page-break { page-break-after: always; }
                .receipt-container { margin-bottom: 0 !important; }
            }
            .receipt-container {
                border: 2px solid #000000;
                padding: 16px;
                background: #ffffff;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 276mm;
                max-width: 185mm;
                margin: 0 auto 20px auto;
            }
            .header-table {
                width: 100%;
                border-bottom: 3px double #000000;
                padding-bottom: 12px;
                margin-bottom: 15px;
            }
            .brand-title {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                font-size: 24px;
                font-weight: 900;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: #000000;
            }
            .brand-sub {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                font-size: 9px;
                font-weight: 700;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                color: #333333;
                margin-top: 2px;
            }
            .header-contact {
                font-family: Arial, sans-serif;
                font-size: 9.5px;
                text-align: right;
                color: #222222;
                line-height: 1.4;
            }
            .title-banner {
                text-align: center;
                border: 1px solid #000000;
                background-color: #f8f8f8;
                padding: 6px;
                font-family: Arial, sans-serif;
                font-weight: 800;
                font-size: 13px;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                margin-bottom: 15px;
            }
            .meta-grid {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
            }
            .meta-grid td {
                padding: 6px 8px;
                border: 1px solid #000000;
                vertical-align: top;
                font-size: 11px;
            }
            .meta-label {
                font-family: Arial, sans-serif;
                font-weight: 700;
                text-transform: uppercase;
                font-size: 10px;
                color: #333333;
            }
            .meta-val {
                font-weight: 700;
                color: #000000;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
                font-size: 11px;
            }
            .items-table th {
                font-family: Arial, sans-serif;
                background-color: #f0f0f0;
                border: 1px solid #000000;
                padding: 8px;
                text-align: left;
                font-weight: 800;
                font-size: 10px;
                text-transform: uppercase;
            }
            .items-table td {
                border: 1px solid #000000;
                padding: 8px;
                vertical-align: middle;
            }
            .summary-table {
                width: 45%;
                margin-left: auto;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .summary-table td {
                padding: 6px 10px;
                border: 1px solid #000000;
                font-size: 11px;
            }
            .summary-label {
                font-family: Arial, sans-serif;
                font-weight: 700;
                text-align: right;
                text-transform: uppercase;
                font-size: 10px;
            }
            .summary-val {
                text-align: right;
                font-weight: 800;
                font-family: monospace;
                font-size: 12px;
            }
            .total-row td {
                background-color: #f8f8f8;
                font-size: 13px;
            }
            .barcode-section {
                text-align: center;
                margin-top: 15px;
                margin-bottom: 25px;
            }
            .barcode-box {
                display: inline-block;
                width: 220px;
            }
            .barcode-num {
                font-family: monospace;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 2px;
                margin-top: 3px;
            }
            .signature-section {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 30px;
                padding-top: 10px;
                font-family: Arial, sans-serif;
                font-size: 10px;
                font-weight: 700;
            }
            .sig-box {
                text-align: center;
                width: 200px;
            }
            .sig-line {
                border-top: 1px solid #000000;
                margin-bottom: 5px;
            }
            .footer-note {
                font-family: Arial, sans-serif;
                font-size: 9.5px;
                text-align: center;
                font-weight: 700;
                border-top: 1px dashed #000000;
                padding-top: 8px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        ${testChunks.map((chunk, chunkIndex) => {
            const isLastPage = chunkIndex === testChunks.length - 1;
            const pageBreakClass = !isLastPage ? "page-break" : "";
            
            return `
        <div class="receipt-container ${pageBreakClass}">
            <div>
                <!-- Classic Header -->
                <table class="header-table">
                    <tr>
                        <td>
                            <div class="brand-title">MEDORAA LABS</div>
                            <div class="brand-sub">DIAGNOSTIC & PATHOLOGY CLINICAL MANAGEMENT SYSTEM</div>
                        </td>
                        <td class="header-contact">
                            <div>Medoraa HQ, Road No 10, Banjara Hills</div>
                            <div>Hyderabad - 500034</div>
                            <div>Tel: +91 40 2345 6789</div>
                            <div>Email: contact@medoraalabs.com</div>
                        </td>
                    </tr>
                </table>

                <!-- Receipt Title -->
                <div class="title-banner">
                    Patient Registration Acknowledgement & Bill Receipt ${testChunks.length > 1 ? `(Page ${chunkIndex + 1} of ${testChunks.length})` : ""}
                </div>

                <!-- Registration & Patient Demographics Grid -->
                <table class="meta-grid">
                    <tr>
                        <td style="width: 50%;">
                            <span class="meta-label">REGISTRATION NO:</span><br/>
                            <span class="meta-val" style="font-family: monospace; font-size: 13px;">${regNo}</span>
                        </td>
                        <td style="width: 50%;">
                            <span class="meta-label">DATE & TIME:</span><br/>
                            <span class="meta-val">${dateStr} | ${timeStr}</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <span class="meta-label">PATIENT NAME:</span><br/>
                            <span class="meta-val" style="font-size: 12px; text-transform: uppercase;">${record.patientName}</span>
                        </td>
                        <td>
                            <span class="meta-label">AGE / GENDER:</span><br/>
                            <span class="meta-val">${record.age?.value ? `${record.age.value} ${record.age.type}` : "N/A"} / ${record.gender || "N/A"}</span>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <span class="meta-label">MOBILE NUMBER:</span><br/>
                            <span class="meta-val">+91 ${record.mobileNumber || "N/A"}</span>
                        </td>
                    </tr>
                </table>

                <!-- Prescribed Tests / Billing Table -->
                <div style="font-family: Arial, sans-serif; font-weight: 800; font-size: 11px; text-transform: uppercase; margin-bottom: 6px;">
                    Prescribed Investigations & Charges
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
                                <td style="text-transform: uppercase; font-size: 10px;">${(typeof t === 'object' && t.category) ? t.category : "General"}</td>
                                <td style="text-align: right; font-weight: 800; font-family: monospace;">₹${parseFloat(t.patientPrice || 0).toFixed(2)}</td>
                            </tr>
                        `).join("") : `
                            <tr>
                                <td colspan="4" style="text-align: center; color: #666; font-style: italic; padding: 12px;">
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
                        <td class="summary-val" style="color: #008000;">${discount > 0 ? `- ₹${parseFloat(discount).toFixed(2)}` : `₹0.00`}</td>
                    </tr>
                    <tr class="total-row">
                        <td class="summary-label" style="font-weight: 900; font-size: 11px;">Total Net Amount:</td>
                        <td class="summary-val" style="font-weight: 900; font-size: 13px;">₹${parseFloat(totalAmount).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td class="summary-label" style="font-weight: 800; color: #1e40af;">Amount Paid by Patient:</td>
                        <td class="summary-val" style="font-weight: 900; color: #1e40af; font-size: 12px;">₹${parseFloat(paidAmount).toFixed(2)}</td>
                    </tr>
                    ${balanceDue > 0 ? `
                    <tr>
                        <td class="summary-label" style="color: #dc2626; font-weight: 800;">Balance Due:</td>
                        <td class="summary-val" style="color: #dc2626; font-weight: 900; font-size: 12px;">₹${parseFloat(balanceDue).toFixed(2)}</td>
                    </tr>
                    ` : ""}
                    <tr>
                        <td class="summary-label">Payment Mode:</td>
                        <td class="summary-val" style="text-transform: uppercase; font-size: 11px;">${paymentMethod}</td>
                    </tr>
                </table>
                ` : `<div style="text-align: right; font-size: 11px; font-weight: 700; color: #666; margin-bottom: 20px;">Continued on next page...</div>`}

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

/**
 * Async wrapper: generates receipt PDF buffer using the shared HTML builder.
 * @param {Object} record Patient registration document
 * @returns {Promise<Buffer>} PDF Buffer
 */
async function generateReceiptPDF(record) {
    const htmlContent = buildReceiptHTML(record);

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
                top: "8mm",
                bottom: "8mm",
                left: "10mm",
                right: "10mm"
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

module.exports = { generatePathologyPDF, generateTransferLabelPDF, generateReceiptPDF, buildReceiptHTML, getBrowser };



