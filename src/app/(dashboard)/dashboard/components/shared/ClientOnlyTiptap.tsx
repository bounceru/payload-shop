'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useEffect } from 'react';

export default function ClientOnlyTiptap({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value]);

    if (!editor) return null;

    const buttonStyle = `px-2 py-1 rounded border text-sm bg-white hover:bg-gray-100`;
    const activeStyle = `!bg-blue-100 !border-blue-400 !text-blue-700 font-semibold`;

    return (
        <div className="border rounded bg-white p-3 space-y-2">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 border-b pb-2 mb-2 bg-white">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`${buttonStyle} ${editor.isActive('bold') ? activeStyle : ''}`}
                >
                    Bold
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`${buttonStyle} ${editor.isActive('italic') ? activeStyle : ''}`}
                >
                    Italic
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={`${buttonStyle} ${editor.isActive('underline') ? activeStyle : ''}`}
                >
                    Underline
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`${buttonStyle} ${editor.isActive('strike') ? activeStyle : ''}`}
                >
                    Strike
                </button>
                <button
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={`${buttonStyle} ${editor.isActive('paragraph') ? activeStyle : ''}`}
                >
                    P
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`${buttonStyle} ${editor.isActive('heading', { level: 1 }) ? activeStyle : ''}`}
                >
                    H1
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`${buttonStyle} ${editor.isActive('heading', { level: 2 }) ? activeStyle : ''}`}
                >
                    H2
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`${buttonStyle} ${editor.isActive('heading', { level: 3 }) ? activeStyle : ''}`}
                >
                    H3
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`${buttonStyle} ${editor.isActive('bulletList') ? activeStyle : ''}`}
                >
                    • List
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`${buttonStyle} ${editor.isActive('orderedList') ? activeStyle : ''}`}
                >
                    1. List
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`${buttonStyle} ${editor.isActive('blockquote') ? activeStyle : ''}`}
                >
                    “”
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`${buttonStyle} ${editor.isActive('codeBlock') ? activeStyle : ''}`}
                >
                    Code
                </button>
                <button
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className={buttonStyle}
                >
                    ―
                </button>
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    className={buttonStyle}
                >
                    Undo
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    className={buttonStyle}
                >
                    Redo
                </button>
                <button
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                    className={`${buttonStyle} text-red-600`}
                >
                    Clear
                </button>
            </div>

            {/* Editor Area */}
            <EditorContent editor={editor} className="min-h-[250px] bg-white p-2 rounded border" />
        </div>
    );
}
