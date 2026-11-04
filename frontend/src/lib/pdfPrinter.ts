/**
 * Utility to print a PDF directly using the exact same PDF bytes as Download.
 * Fetches the PDF from the URL, creates a Blob URL, loads it in a dedicated
 * print iframe, and triggers the native browser print dialog.
 * Never captures or screenshots the PDF viewer interface.
 *
 * @param pdfUrl URL of the generated PDF (with duplex back.pdf included)
 */
export async function printPdfDirect(pdfUrl: string): Promise<void> {
  try {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF for printing: HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    // Remove any previous print frame
    const existing = document.getElementById("pdf-direct-print-frame");
    if (existing) {
      existing.remove();
    }

    const iframe = document.createElement("iframe");
    iframe.id = "pdf-direct-print-frame";
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.src = blobUrl;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        let printed = false;
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            printed = true;
          }
        } catch (e) {
          console.warn("Iframe direct print blocked by browser sandbox; falling back to print window:", e);
        }

        // Fallback for Chromium versions where iframe PDF print is sandboxed
        if (!printed) {
          const win = window.open(blobUrl, "_blank");
          win?.focus();
        }

        // Clean up blob URL safely after print dialog closes
        setTimeout(() => {
          try {
            URL.revokeObjectURL(blobUrl);
            iframe.remove();
          } catch {}
        }, 120000);
      }, 500);
    };
  } catch (err) {
    console.error("Print PDF error:", err);
    window.open(pdfUrl, "_blank");
  }
}

