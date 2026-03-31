"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
    FaBold,
    FaItalic,
    FaStrikethrough,
    FaListUl,
    FaListOl,
    FaQuoteLeft,
    FaCode,
    FaUndo,
    FaRedo,
} from "react-icons/fa";
import { useEffect } from "react";

interface TextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    minHeight?: string;
}

function MenuButton({
    onClick,
    isActive = false,
    disabled = false,
    children,
}: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`h-9 w-9 rounded-lg flex items-center justify-center transition border ${isActive
                    ? "bg-[#C8A96A] text-black border-[#C8A96A]"
                    : "bg-[#181818] text-white border-[#2A2A2A] hover:border-[#C8A96A] hover:text-[#C8A96A]"
                } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
        >
            {children}
        </button>
    );
}

export default function TextEditor({
    value,
    onChange,
    placeholder = "Write here...",
    minHeight = "220px",
}: TextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value || "",
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class:
                    "focus:outline-none prose prose-invert max-w-none text-white px-4 py-3",
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (!editor) return;

        const currentHtml = editor.getHTML();
        if (value !== currentHtml) {
            editor.commands.setContent(value || "", { emitUpdate: false });
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className="rounded-2xl border border-[#2A2A2A] bg-[#111111] overflow-hidden">
            <div className="flex flex-wrap gap-2 p-3 border-b border-[#1A1A1A] bg-[#101010]">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive("bold")}
                >
                    <FaBold size={13} />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive("italic")}
                >
                    <FaItalic size={13} />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive("strike")}
                >
                    <FaStrikethrough size={13} />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive("bulletList")}
                >
                    <FaListUl size={13} />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive("orderedList")}
                >
                    <FaListOl size={13} />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    isActive={editor.isActive("blockquote")}
                >
                    <FaQuoteLeft size={13} />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    isActive={editor.isActive("codeBlock")}
                >
                    <FaCode size={13} />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().chain().focus().undo().run()}
                >
                    <FaUndo size={13} />
                </MenuButton>

                <MenuButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().chain().focus().redo().run()}
                >
                    <FaRedo size={13} />
                </MenuButton>
            </div>

            <div
                className="text-white"
                style={{ minHeight }}
            >
                <EditorContent editor={editor} />
            </div>

            <style jsx global>{`
        .ProseMirror {
          min-height: ${minHeight};
          color: white;
          line-height: 1.7;
        }

        .ProseMirror p {
          margin: 0 0 0.75rem 0;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.25rem;
          margin: 0.75rem 0;
        }

        .ProseMirror blockquote {
          border-left: 3px solid #c8a96a;
          padding-left: 1rem;
          color: #d1d5db;
          margin: 1rem 0;
        }

        .ProseMirror pre {
          background: #0a0a0a;
          color: #f3f4f6;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
        }

        .ProseMirror code {
          background: rgba(255, 255, 255, 0.08);
          padding: 0.15rem 0.35rem;
          border-radius: 0.35rem;
          font-size: 0.9em;
        }

        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3 {
          color: white;
          margin: 1rem 0 0.5rem;
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
        </div>
    );
}