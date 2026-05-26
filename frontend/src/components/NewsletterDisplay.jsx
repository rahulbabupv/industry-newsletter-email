import { useRef, useState } from "react";
// STATIC IMPORTS: Pull libraries directly into the bundle payload to bypass dynamic SSL protocol errors!
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import NewsletterTemplate from "./NewsletterTemplate";

export default function NewsletterDisplay({ newsletter, topic, fromDate, toDate }) {
  const data = typeof newsletter === "string" ? JSON.parse(newsletter) : newsletter;
  const contentRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const waitForImages = (element) => {
    const images = element.querySelectorAll("img");
    const promises = Array.from(images).map((img) => {
      if (img.complete && img.naturalHeight > 0) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        const timeout = setTimeout(resolve, 5000); // Fallback timeout per image
        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          resolve(); // Resolve even on error to not block
        };
      });
    });
    return Promise.all(promises);
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setDownloading(true);

    let wrapper = null;

    try {
      const source = contentRef.current;
      const clone = source.cloneNode(true);
      wrapper = document.createElement("div");
      
      Object.assign(wrapper.style, {
        position: "fixed",
        top: "0",
        left: "-9999px",
        width: source.offsetWidth + "px",
        background: "#FDFBF7", 
        padding: "24px",
        boxSizing: "border-box",
      });
      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // Wait for asset imagery sync
      await waitForImages(wrapper);

      const canvas = await html2canvas(wrapper, {
        scale: 1.5,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: "#FDFBF7",
        scrollX: 0,
        scrollY: 0,
        windowWidth: source.offsetWidth + 48,
        windowHeight: wrapper.scrollHeight,
        imageTimeout: 20000,
        removeContainer: true
      });

      if (wrapper && wrapper.parentNode) {
        document.body.removeChild(wrapper);
        wrapper = null;
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.85);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let yOffset = 0;

      pdf.addImage(imgData, "JPEG", 0, yOffset, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        yOffset -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, yOffset, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${data?.newsletterTitle ?? topic ?? "newsletter"}-${fromDate}-${toDate}.pdf`);
    } catch (err) {
      console.error("CRITICAL EXPORT FAILURE DETECTED:", err);
      alert(`PDF download failed. Technical Reason: ${err.message || "Canvas timeout"}.`);
    } finally {
      if (wrapper && wrapper.parentNode) {
        document.body.removeChild(wrapper);
      }
      setDownloading(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Your Newsletter</h2>
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating PDF…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      <div className="bg-magazine-bg rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div ref={contentRef}>
          <NewsletterTemplate data={data} topic={topic} />
        </div>
      </div>
    </div>
  );
}