'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect, useRef } from 'react';
import { FieldLabel } from '@/components/crud-kit';

type TiptapEditorProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    note?: string;
};

function btnClass(active?: boolean) {
    return `rounded-xl border px-3 py-1.5 text-xs ${active
            ? 'border-gold bg-gold/10 text-gold'
            : 'border-line bg-card text-text'
        }`;
}

export function TiptapEditor({
    label,
    value,
    onChange,
    note,
}: TiptapEditorProps) {
    const fileRef = useRef<HTMLInputElement>(null);

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

            // ✅ ADD ALIGNMENT SUPPORT
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),

            Link.configure({
                openOnClick: false,
                autolink: true,
                linkOnPaste: true,
            }),

            Placeholder.configure({
                placeholder: `Write ${label.toLowerCase()} here...`,
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

    if (!editor) return null;

    return (
        <div className="space-y-2">
            <FieldLabel label={label} />

            {/* ✅ ADD IMAGE UPLOAD INPUT */}
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    try {
                        const formData = new FormData();
                        formData.append('file', file);

                        const res = await api.post('/upload', formData);
                        const url = res?.data?.url;

                        if (url) {
                            editor.chain().focus().setImage({ src: url }).run();
                        }
                    } catch (err) {
                        console.error('Upload failed', err);
                    }
                }}
            />

            <div className="overflow-hidden rounded-2xl border border-line bg-panel">
                <div className="flex flex-wrap gap-2 border-b border-line px-3 py-3">

                    <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}>Bold</button>
                    <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}>Italic</button>
                    <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))}>Underline</button>
                    <button onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive('strike'))}>Strike</button>

                    <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))}>H1</button>
                    <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}>H2</button>
                    <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))}>H3</button>

                    <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}>Bullet</button>
                    <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}>Numbered</button>

                    <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))}>Quote</button>
                    <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)}>HR</button>

                    {/* 🔗 Link */}
                    <button
                        onClick={() => {
                            const url = window.prompt('Enter URL');
                            if (!url) return;
                            editor.chain().focus().setLink({ href: url }).run();
                        }}
                        className={btnClass(editor.isActive('link'))}
                    >
                        Link
                    </button>

                    {/* 🖼 Image (UPDATED: upload + URL) */}
                    <button
                        onClick={() => {
                            const input = window.prompt(
                                "Paste image URL OR type 'upload'"
                            );

                            if (!input) return;

                            if (input.toLowerCase() === 'upload') {
                                fileRef.current?.click();
                                return;
                            }

                            editor.chain().focus().setImage({ src: input }).run();
                        }}
                        className={btnClass(false)}
                    >
                        Image
                    </button>

                    {/* 🎥 YouTube */}
                    <button
                        onClick={() => {
                            const url = window.prompt('Enter YouTube URL');
                            if (!url) return;
                            editor.commands.setYoutubeVideo({
                                src: url,
                                width: 640,
                                height: 360,
                            });
                        }}
                        className={btnClass(false)}
                    >
                        YouTube
                    </button>

                    {/* 🎬 MP4 Video */}
                    <button
                        onClick={() => {
                            const url = window.prompt('Enter video URL (.mp4)');
                            if (!url) return;

                            editor.chain().focus().insertContent(`
                <video controls style="width:100%; border-radius:8px;">
                  <source src="${url}" type="video/mp4" />
                </video>
              `).run();
                        }}
                        className={btnClass(false)}
                    >
                        Video
                    </button>

                    {/* ✅ ALIGNMENT BUTTONS */}
                    <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))}>Left</button>
                    <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))}>Center</button>
                    <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))}>Right</button>

                    <button onClick={() => editor.chain().focus().setParagraph().run()} className={btnClass(editor.isActive('paragraph'))}>Paragraph</button>
                    <button onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className={btnClass(false)}>Clear</button>
                    <button onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)}>Undo</button>
                    <button onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)}>Redo</button>

                </div>

                <EditorContent editor={editor} style={{ minHeight: '120px' }} />
            </div>

            {note ? <p className="text-xs text-muted">{note}</p> : null}
        </div>
    );
}