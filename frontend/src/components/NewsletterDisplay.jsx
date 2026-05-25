import { useRef, useState } from "react";
import NewsletterTemplate from "./NewsletterTemplate";

export default function NewsletterDisplay({ newsletter, topic, fromDate, toDate }) {
  const data = typeof newsletter === "string" ? JSON.parse(newsletter) : newsletter;
  const contentRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setDownloading(true);

    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      // Clone the element into a fixed off-screen container so html2canvas
      // renders the FULL content height, not just the visible viewport.
      const source = contentRef.current;
      const clone = source.cloneNode(true);
      const wrapper = document.createElement("div");
      
      // FIX: Changed background from #ffffff to #FDFBF7 to match your premium magazine paper theme
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

      const canvas = await html2canvas(wrapper, {
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        backgroundColor: "#FDFBF7", // FIX: Match premium matte background on canvas render
        scrollX: 0,
        scrollY: 0,
        windowWidth: source.offsetWidth + 48,
        height: wrapper.scrollHeight,
        windowHeight: wrapper.scrollHeight,
      });

      document.body.removeChild(wrapper);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let yOffset = 0;

      // First page
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Subsequent pages: shift the image up so the next slice shows
      while (heightLeft > 0) {
        yOffset -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, yOffset, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${data?.newsletterTitle ?? topic ?? "newsletter"}-${fromDate}-${toDate}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF download failed. Please try again.");
    } finally {
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

      {/* FIX: Set the dashboard panel background to our premium color wrapper */}
      <div className="bg-magazine-bg rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div ref={contentRef}>
          <NewsletterTemplate data={data} />
        </div>
      </div>
    </div>
  );
}