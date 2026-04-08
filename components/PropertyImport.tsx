import { api } from '@/lib/api';
import { useRef, useState } from 'react';
// import axios from 'axios';

type Props = {
    open: boolean;
    onClose: () => void;
    onImported?: () => void;
    load: () => void;
};

export default function PropertyImportModal({
    open,
    onClose,
    onImported,
    load
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    if (!open) return null;

    const handleUpload = async () => {
        if (!file) return;

        try {
            setLoading(true);
            setResult(null);

            const formData = new FormData();
            formData.append('file', file);

            const res = await api.post('/properties/import', formData);

            setResult(res.data);
            onImported?.();
            // load();
            onClose();

        } catch (error: any) {
            setResult({
                success: false,
                message:
                    error?.response?.data?.message || 'Import failed. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-3xl border border-line bg-panel p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-text">Import Properties</h2>
                        <p className="mt-1 text-sm text-muted">
                            Upload CSV or Excel file using the provided template.
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full border border-line px-3 py-1 text-sm text-muted"
                    >
                        Close
                    </button>
                </div>

                <div className="mt-6 rounded-2xl border border-dashed border-line p-5">
                    <p className="text-sm text-muted">
                        Supported fields:
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {[
                            'title',
                            'category',
                            'location',
                            'price',
                            'buildingName',
                            'city',
                            'metaTitle',
                            'metaDescription',
                            'shortDescription',
                            'fullDescription',
                            'appDescription',
                            'address',
                            'tag',
                            'url',
                            'author',
                            'status',
                            'thumbnail',
                        ].map((field) => (
                            <span
                                key={field}
                                className="rounded-full border border-line px-3 py-1 text-xs text-muted"
                            >
                                {field}
                            </span>
                        ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        <a
                            href="/property_import_template.xlsx"
                            download
                            className="rounded-xl border border-line px-4 py-2 text-sm text-text"
                        >
                            Download Excel Template
                        </a>

                        <a
                            href="/property_import_template.csv"
                            download
                            className="rounded-xl border border-line px-4 py-2 text-sm text-text"
                        >
                            Download CSV Template
                        </a>
                    </div>

                    <div className="mt-5">
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-muted"
                        />
                    </div>

                    {file ? (
                        <p className="mt-3 text-sm text-text">
                            Selected file: <span className="font-medium">{file.name}</span>
                        </p>
                    ) : null}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl border border-line px-4 py-2 text-sm text-muted"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="rounded-xl bg-gold px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
                    >
                        {loading ? 'Importing...' : 'Import'}
                    </button>
                </div>

                {result ? (
                    <div className="mt-6 rounded-2xl border border-line bg-card/70 p-4">
                        <p className="font-medium text-text">
                            {result.success ? 'Import completed' : 'Import failed'}
                        </p>

                        {result.message ? (
                            <p className="mt-2 text-sm text-muted">{result.message}</p>
                        ) : null}

                        {result.summary ? (
                            <div className="mt-3 text-sm text-muted">
                                <p>Total rows: {result.summary.total}</p>
                                <p>Inserted: {result.summary.inserted}</p>
                                <p>Failed: {result.summary.failed}</p>
                            </div>
                        ) : null}

                        {Array.isArray(result.errors) && result.errors.length ? (
                            <div className="mt-3">
                                <p className="mb-2 text-sm font-medium text-red-400">Errors</p>
                                <ul className="space-y-1 text-xs text-red-300">
                                    {result.errors.map((err: any, i: number) => (
                                        <li key={i}>
                                            Row {err.row}: {err.message}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
}