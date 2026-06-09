'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useRef, useState } from 'react';
import { FieldLabel } from '@/components/crud-kit';
import { Upload, Images, Loader2 } from 'lucide-react';
import ImagePickerModal from '@/app/properties/ImagePicker';
import { api } from '@/lib/api';

type TiptapEditorProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    note?: string;
};

function btnClass(active?: boolean) {
    return `rounded-xl border px-3 py-1.5 text-xs transition ${
        active
            ? 'border-gold bg-gold/10 text-gold'
            : 'border-line bg-card text-text hover:border-gold/40'
    }`;
}

export function TiptapEditor({
    label,
    value,
    onChange,
    note,
}: TiptapEditorProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Image.configure({
                inline: false,
                allowBase64: true,
            }),
            Youtube.configure({
                controls: true,
                nocookie: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
            }),
            Placeholder.configure({
                placeholder: `Write ${(label || 'content').toLowerCase()} here...`,
            }),
        ],
        content: value || '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'tiptap px-4 py-3 text-sm text-text focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) return;
        const safeValue = value || '';
        if (editor.getHTML() !== safeValue) {
            editor.commands.setContent(safeValue, { emitUpdate: false });
        }
    }, [value, editor]);

    // Insert a single image URL into the editor at the cursor
    const insertImage = (url: string) => {
        if (!url || !editor) return;
        editor.chain().focus().setImage({ src: url }).run();
    };

    // Handle file upload → insert into editor
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            const response = await api.post('/content/upload/gallery', formData, {});
            const url =
                response?.data?.url ||
                response?.data?.data?.url ||
                response?.data?.fileUrl ||
                response?.data?.data?.fileUrl ||
                response?.data?.location ||
                response?.data?.data?.location ||
                '';
            if (!url) throw new Error('Upload did not return a URL.');
            insertImage(url);
        } catch {
            alert('Failed to upload image.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    if (!editor) return null;

    return (
        <div className="space-y-2">
            <FieldLabel label={label} />

            {/* Hidden file input */}
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
            />

            <div className="overflow-hidden rounded-2xl border border-line bg-panel">
                {/* ── Toolbar ── */}
                <div className="flex flex-wrap gap-2 border-b border-line px-3 py-3">

                    {/* Text formatting */}
                    <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}>Bold</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}>Italic</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))}>Underline</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive('strike'))}>Strike</button>

                    {/* Headings */}
                    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))}>H1</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}>H2</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))}>H3</button>

                    {/* Lists */}
                    <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}>Bullet</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}>Numbered</button>

                    {/* Blocks */}
                    <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))}>Quote</button>
                    <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)}>HR</button>

                    {/* Link */}
                    <button
                        type="button"
                        onClick={() => {
                            const url = window.prompt('Enter URL');
                            if (!url) return;
                            editor.chain().focus().setLink({ href: url }).run();
                        }}
                        className={btnClass(editor.isActive('link'))}
                    >
                        Link
                    </button>

                    {/* ── Image: Upload + Select Uploaded ── */}
                    <div className="flex items-center gap-1.5 rounded-xl border border-line bg-card px-2 py-1">
                        <span className="text-[10px] text-muted font-medium uppercase tracking-wide pr-1">
                            Img
                        </span>

                        {/* Upload file */}
                        <button
                            type="button"
                            disabled={uploading}
                            onClick={() => fileRef.current?.click()}
                            title="Upload image from device"
                            className="flex items-center gap-1 rounded-lg border border-line bg-panel px-2 py-1 text-xs text-text hover:border-gold/50 hover:text-gold transition disabled:opacity-50"
                        >
                            {uploading ? (
                                <Loader2 className="h-3 w-3 animate-spin text-gold" />
                            ) : (
                                <Upload className="h-3 w-3" />
                            )}
                            <span>{uploading ? 'Uploading…' : 'Upload'}</span>
                        </button>

                        {/* Pick from uploaded assets */}
                        <button
                            type="button"
                            onClick={() => setPickerOpen(true)}
                            title="Select from uploaded images"
                            className="flex items-center gap-1 rounded-lg border border-gold/40 bg-gold/10 px-2 py-1 text-xs text-gold hover:bg-gold/20 transition"
                        >
                            <Images className="h-3 w-3" />
                            <span>Select</span>
                        </button>
                    </div>

                    {/* YouTube */}
                    <button
                        type="button"
                        onClick={() => {
                            const url = window.prompt('Enter YouTube URL');
                            if (!url) return;
                            editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
                        }}
                        className={btnClass(false)}
                    >
                        YouTube
                    </button>

                    {/* MP4 Video */}
                    <button
                        type="button"
                        onClick={() => {
                            const url = window.prompt('Enter video URL (.mp4)');
                            if (!url) return;
                            editor.chain().focus().insertContent(
                                `<video controls style="width:100%; border-radius:8px;"><source src="${url}" type="video/mp4" /></video>`
                            ).run();
                        }}
                        className={btnClass(false)}
                    >
                        Video
                    </button>

                    {/* Alignment */}
                    <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))}>Left</button>
                    <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))}>Center</button>
                    <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))}>Right</button>

                    {/* Misc */}
                    <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={btnClass(editor.isActive('paragraph'))}>Paragraph</button>
                    <button type="button" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className={btnClass(false)}>Clear</button>
                    <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)}>Undo</button>
                    <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)}>Redo</button>
                </div>

                <EditorContent editor={editor} style={{ minHeight: '120px' }} />
            </div>

            {note ? <p className="text-xs text-muted">{note}</p> : null}
   
            {/* ImagePickerModal — single select, inserts into editor */}
            <ImagePickerModal
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                multiple={false}
                onSelect={(urls) => {
                    urls.forEach((url) => insertImage(url));
                    setPickerOpen(false);
                }}
            />
        </div>
    );
}