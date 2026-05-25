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

// ─── Exact sample xlsx file (base64 encoded) ────────────────────────────────
const SAMPLE_XLSX_B64 = "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";

// ─── Helpers ─────────────────────────────────────────────────────────────────
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
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
    ["Marina View Residences","Residential","Dubai Marina","2500000","Tower A","Dubai","Marina View Residences | Luxury Apartments in Dubai Marina","Premium waterfront apartments in Dubai Marina.","Luxury waterfront homes with premium amenities.","Marina View Residences offers spacious apartments with sea views, modern finishes, and excellent connectivity.","Luxury waterfront homes with modern amenities for app users.","Marina Walk, Dubai Marina, Dubai","luxury","/property/marina-view-residences","admin","active","https://example.com/images/marina-view.jpg"],
    ["Sobha Skyvue Stellar","Residential","Bukadra / MBR City","0","Sobha Hartland 2","Dubai","Sobha Skyvue Stellar Apartments in Dubai | Modern Living with City Views","Explore Sobha Skyvue Stellar Apartments in Dubai. Check amenities & prime location.","","Skyvue Stellar at Sobha Hartland 2 is positioned as the tallest and newest addition to the Skyvue Collection.","","","Apartments","/property/sobha-skyvue-stellar","","ready",""],
    ["Sobha Sanctuary","Residential","Dubailand","0","Sobha Sanctuary","Dubai","","","","Sobha Sanctuary is a premium villa community that blends luxury with nature.","","Al Yufrah 1, Dubailand, Dubai.","Villas","/property/Sobha-Sanctuary","","draft",""],
  ];
  const escape = (val: string) => `"${String(val).replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, "property_import_template.csv");
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SUPPORTED_FIELDS = [
  "title","category","location","price","buildingName","city",
  "metaTitle","metaDescription","shortDescription","fullDescription",
  "appDescription","address","tag","url","author","status","thumbnail",
];

// ─── Component ────────────────────────────────────────────────────────────────
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
          `Import successful: ${res?.data?.imported ?? "?"} properties imported.`
      );
      fetchProperty();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Import failed.");
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
            <button
              type="button"
              onClick={downloadSampleXlsx}
              className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-text hover:border-gold/50 hover:text-gold transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Download Excel Template
            </button>

            <button
              type="button"
              onClick={downloadSampleCsv}
              className="flex items-center gap-2 rounded-2xl border border-line bg-panel px-4 py-2.5 text-sm text-text hover:border-gold/50 hover:text-gold transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              Selected: <span className="text-text font-medium">{file.name}</span>
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