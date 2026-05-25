// import { api } from "@/lib/api";
// import { useRef, useState } from "react";
// // import axios from 'axios';

// type Props = {
//   open: boolean;
//   onClose: () => void;
//   onImported?: () => void;
//   load: () => void;
// };

// export default function PropertyImportModal({
//   open,
//   onClose,
//   onImported,
//   load,
// }: Props) {
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const [file, setFile] = useState<File | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<any>(null);

//   if (!open) return null;

//   const handleUpload = async () => {
//     if (!file) return;

//     try {
//       setLoading(true);
//       setResult(null);

//       const formData = new FormData();
//       formData.append("file", file);

//       const res = await api.post("/properties/import", formData);

//       setResult(res.data);
//       onImported?.();
//       // load();
//       onClose();
//     } catch (error: any) {
//       setResult({
//         success: false,
//         message:
//           error?.response?.data?.message || "Import failed. Please try again.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//       <div className="w-full max-w-2xl rounded-3xl border border-line bg-panel p-6 shadow-2xl">
//         <div className="flex items-start justify-between gap-4">
//           <div>
//             <h2 className="text-xl font-semibold text-text">
//               Import Properties
//             </h2>
//             <p className="mt-1 text-sm text-muted">
//               Upload CSV or Excel file using the provided template.
//             </p>
//           </div>

//           <button
//             onClick={onClose}
//             className="rounded-full border border-line px-3 py-1 text-sm text-muted"
//           >
//             Close
//           </button>
//         </div>

//         <div className="mt-6 rounded-2xl border border-dashed border-line p-5">
//           <p className="text-sm text-muted">Supported fields:</p>

//           <div className="mt-3 flex flex-wrap gap-2">
//             {[
//               "title",
//               "category",
//               "location",
//               "price",
//               "buildingName",
//               "city",
//               "metaTitle",
//               "metaDescription",
//               "shortDescription",
//               "fullDescription",
//               "appDescription",
//               "address",
//               "tag",
//               "url",
//               "author",
//               "status",
//               "thumbnail",
//             ].map((field) => (
//               <span
//                 key={field}
//                 className="rounded-full border border-line px-3 py-1 text-xs text-muted"
//               >
//                 {field}
//               </span>
//             ))}
//           </div>

//           <div className="mt-5 flex flex-wrap gap-3">
//             <a
//               href="/property_import_template.xlsx"
//               download
//               className="rounded-xl border border-line px-4 py-2 text-sm text-text"
//             >
//               Download Excel Template
//             </a>

//             <a
//               href="/property_import_template.csv"
//               download
//               className="rounded-xl border border-line px-4 py-2 text-sm text-text"
//             >
//               Download CSV Template
//             </a>
//           </div>

//           <div className="mt-5">
//             <input
//               ref={inputRef}
//               type="file"
//               accept=".csv,.xlsx,.xls"
//               onChange={(e) => setFile(e.target.files?.[0] || null)}
//               className="block w-full text-sm text-muted"
//             />
//           </div>

//           {file ? (
//             <p className="mt-3 text-sm text-text">
//               Selected file: <span className="font-medium">{file.name}</span>
//             </p>
//           ) : null}
//         </div>

//         <div className="mt-6 flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="rounded-xl border border-line px-4 py-2 text-sm text-muted"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={handleUpload}
//             disabled={!file || loading}
//             className="rounded-xl bg-gold px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
//           >
//             {loading ? "Importing..." : "Import"}
//           </button>
//         </div>

//         {result ? (
//           <div className="mt-6 rounded-2xl border border-line bg-card/70 p-4">
//             <p className="font-medium text-text">
//               {result.success ? "Import completed" : "Import failed"}
//             </p>

//             {result.message ? (
//               <p className="mt-2 text-sm text-muted">{result.message}</p>
//             ) : null}

//             {result.summary ? (
//               <div className="mt-3 text-sm text-muted">
//                 <p>Total rows: {result.summary.total}</p>
//                 <p>Inserted: {result.summary.inserted}</p>
//                 <p>Failed: {result.summary.failed}</p>
//               </div>
//             ) : null}

//             {Array.isArray(result.errors) && result.errors.length ? (
//               <div className="mt-3">
//                 <p className="mb-2 text-sm font-medium text-red-400">Errors</p>
//                 <ul className="space-y-1 text-xs text-red-300">
//                   {result.errors.map((err: any, i: number) => (
//                     <li key={i}>
//                       Row {err.row}: {err.message}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             ) : null}
//           </div>
//         ) : null}
//       </div>
//     </div>
//   );
// }
"use client";

import { ChangeEvent, useState } from "react";
import { Modal } from "@/components/modal";
import { ActionButton } from "@/components/ui";
import { api } from "@/lib/api";

// ─────────────────────────────────────────────────────────────────────────────
// Sample template — exact same file as property_import_template_clean.xlsx
// Columns: title, category, location, price, buildingName, city, metaTitle,
//          metaDescription, shortDescription, fullDescription, appDescription,
//          address, tag, url, author, status, thumbnail
// 3 sample rows included.
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE_XLSX_B64 =
  "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";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function b64ToBlob(b64: string, mime: string): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadSampleXlsx() {
  const blob = b64ToBlob(
    SAMPLE_XLSX_B64,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  downloadBlob(blob, "property_import_template.xlsx");
}

function downloadSampleCsv() {
  const headers = [
    "title","category","location","price","buildingName","city",
    "metaTitle","metaDescription","shortDescription","fullDescription",
    "appDescription","address","tag","url","author","status","thumbnail",
  ];

  const rows = [
    [
      "Marina View Residences","Residential","Dubai Marina","2500000","Tower A","Dubai",
      "Marina View Residences | Luxury Apartments in Dubai Marina",
      "Premium waterfront apartments in Dubai Marina.",
      "Luxury waterfront homes with premium amenities.",
      "Marina View Residences offers spacious apartments with sea views and modern finishes.",
      "Luxury waterfront homes with modern amenities for app users.",
      "Marina Walk, Dubai Marina, Dubai","luxury","/property/marina-view-residences","admin","active",
      "https://example.com/images/marina-view.jpg",
    ],
    [
      "Sobha Skyvue Stellar","Residential","Bukadra / MBR City","0","Sobha Hartland 2","Dubai",
      "Sobha Skyvue Stellar Apartments in Dubai | Modern Living with City Views",
      "Explore Sobha Skyvue Stellar Apartments in Dubai.",
      "","Premium tower with wide views towards Downtown Dubai.",
      "","","Apartments","/property/sobha-skyvue-stellar","admin","ready","",
    ],
    [
      "Sobha Sanctuary","Residential","Dubailand","0","Sobha Sanctuary","Dubai",
      "","","",
      "Sobha Sanctuary is a premium villa community that blends luxury with nature.",
      "","Al Yufrah 1, Dubailand, Dubai.","Villas","/property/Sobha-Sanctuary","admin","draft","",
    ],
  ];

  const escape = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, "property_import_template.csv");
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const SUPPORTED_FIELDS = [
  "title","category","location","price","buildingName","city",
  "metaTitle","metaDescription","shortDescription","fullDescription",
  "appDescription","address","tag","url","author","status","thumbnail",
];

export default function PropertyImportModal({
  open,
  onClose,
  fetchProperty,
}: {
  open: boolean;
  onClose: () => void;
  fetchProperty: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/properties/import", formData);
      setResult(
        res?.data?.message ||
          `Import successful: ${res?.data?.imported ?? "?"} properties imported.`,
      );
      fetchProperty();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Import failed.",
      );
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import Properties"
      subtitle="Upload CSV or Excel file using the provided template."
      size="md"
    >
      <div className="space-y-5">
        {/* Supported fields */}
        <div className="rounded-2xl border border-line bg-panel/40 p-4 space-y-3">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Supported fields:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUPPORTED_FIELDS.map((f) => (
              <span
                key={f}
                className="inline-flex items-center rounded-full border border-line bg-panel px-2.5 py-0.5 text-xs text-text"
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Download template buttons */}
        <div className="space-y-2">
          <p className="text-xs text-muted">
            Download a sample file to see the expected format and column order:
          </p>
          <div className="flex flex-wrap gap-2">
            {/* ── Excel download — uses the baked-in .xlsx file ── */}
            <button
              type="button"
              onClick={downloadSampleXlsx}
              className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-text hover:border-gold/50 hover:text-gold transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Download Excel Template
            </button>

            {/* ── CSV download — generated on the fly ── */}
            <button
              type="button"
              onClick={downloadSampleCsv}
              className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-text hover:border-gold/50 hover:text-gold transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Download CSV Template
            </button>
          </div>
        </div>

        {/* File upload */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">
            Upload your file
          </p>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="input w-full"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFile(e.target.files?.[0] || null)
            }
          />
          {file && (
            <p className="text-xs text-muted">
              Selected:{" "}
              <span className="text-text font-medium">{file.name}</span>
            </p>
          )}
        </div>

        {/* Feedback */}
        {result && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            ✓ {result}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            ✗ {error}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6">
        <ActionButton secondary onClick={handleClose}>
          Cancel
        </ActionButton>
        <ActionButton onClick={handleImport} disabled={!file || importing}>
          {importing ? "Importing..." : "Import"}
        </ActionButton>
      </div>
    </Modal>
  );
}