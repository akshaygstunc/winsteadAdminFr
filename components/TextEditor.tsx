'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';
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
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
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
                class: 'tiptap min-h-[260px] px-4 py-3 text-sm text-text focus:outline-none',
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

            <div className="overflow-hidden rounded-2xl border border-line bg-panel">
                <div className="flex flex-wrap gap-2 border-b border-line px-3 py-3">
                    <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))}>Bold</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))}>Italic</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))}>Underline</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive('strike'))}>Strike</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={btnClass(editor.isActive('heading', { level: 1 }))}>H1</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(editor.isActive('heading', { level: 2 }))}>H2</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(editor.isActive('heading', { level: 3 }))}>H3</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))}>Bullet</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))}>Numbered</button>
                    <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))}>Quote</button>
                    <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)}>HR</button>
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
                    <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} className={btnClass(false)}>Unlink</button>
                    <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={btnClass(editor.isActive('paragraph'))}>Paragraph</button>
                    <button type="button" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className={btnClass(false)}>Clear</button>
                    <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btnClass(false)}>Undo</button>
                    <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btnClass(false)}>Redo</button>
                </div>

                <EditorContent editor={editor} />
            </div>

            {note ? <p className="text-xs text-muted">{note}</p> : null}
        </div>
    );
}