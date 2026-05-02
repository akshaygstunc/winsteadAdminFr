import { useState } from "react";
import { Modal } from "@/components/modal";
import { api } from "@/lib/api";

type Props = {
    open: boolean;
    onClose: () => void;
    onSelect: (images: string[]) => void;
    multiple?: boolean; // optional: allow single/multi select
};

export default function ImagePickerModal({
    open,
    onClose,
    onSelect,
    multiple = true,
}: Props) {
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [urlInput, setUrlInput] = useState("");

    // 🔹 Upload files
    const uploadFiles = async (files: FileList) => {
        setUploading(true);

        try {
            const uploaded: string[] = [];

            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);

                const res = await api.post("/content/upload/gallery", formData);

                const url =
                    res?.data?.url ||
                    res?.data?.data?.url ||
                    res?.data?.fileUrl ||
                    res?.data?.location ||
                    "";

                if (url) uploaded.push(url);
            }

            setImages((prev) =>
                multiple ? [...prev, ...uploaded] : uploaded
            );
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setUploading(false);
        }
    };

    // 🔹 Add via URL
    const addUrl = () => {
        if (!urlInput.trim()) return;

        setImages((prev) =>
            multiple ? [...prev, urlInput.trim()] : [urlInput.trim()]
        );

        setUrlInput("");
    };

    // 🔹 Remove image
    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // 🔹 Confirm selection
    const handleSelect = () => {
        onSelect(images);
        setImages([]);
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose} title="Upload / Select Images">
            <div className="space-y-4">

                {/* Upload */}
                <input
                    type="file"
                    multiple={multiple}
                    className="input"
                    accept="image/*,video/*"
                    onChange={(e) => {
                        if (e.target.files) uploadFiles(e.target.files);
                    }}
                />

                {uploading && (
                    <p className="text-sm text-muted">Uploading...</p>
                )}

                {/* URL Input */}
                <div className="flex gap-2">
                    <input
                        className="input flex-1"
                        placeholder="Paste image URL"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                    />
                    <button onClick={addUrl} className="btn">
                        Add
                    </button>
                </div>

                {/* Preview Grid */}
                {images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                        {images.map((img, i) => (
                            <div
                                key={i}
                                className="relative rounded-xl overflow-hidden border"
                            >
                                <img
                                    src={img}
                                    alt="preview"
                                    className="h-24 w-full object-cover"
                                />

                                <button
                                    onClick={() => removeImage(i)}
                                    className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-muted border border-dashed p-4 rounded-xl text-center">
                        No images selected
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                    <button onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button onClick={handleSelect} className="btn">
                        Save Images
                    </button>
                </div>
            </div>
        </Modal>
    );
}