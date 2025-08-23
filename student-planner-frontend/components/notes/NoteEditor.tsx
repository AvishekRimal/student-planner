/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Note } from './NoteTable';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react';
import { useAuth } from '@/redux/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

// --- THIS IS THE COMPONENT TO FIX ---
// The MenuBar is a small helper component for the editor's toolbar.
const MenuBar = ({ editor }: { editor: any | null }) => {
  if (!editor) {
    return null;
  }
  
  // It MUST return JSX
  return (
    <div className="flex items-center gap-1 p-2 border rounded-md">
      <Button 
        type="button" 
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        type="button" 
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button 
        type="button" 
        variant={editor.isActive('strike') ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button 
        type="button" 
        variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
       <Button 
        type="button" 
        variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
    </div>
  );
};


// The main editor component.
export function NoteEditor({ note }: { note: Note }) {
  const router = useRouter();
  const { token } = useAuth();
  
  const editor = useEditor({
    extensions: [StarterKit],
    content: note.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert min-h-[400px] max-w-none w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 p-4',
      },
    },
  });

  useEffect(() => {
    if (editor && note) {
      if (editor.getHTML() !== note.content) {
        editor.commands.setContent(note.content);
      }
    }
  }, [note, editor]);

  const handleSave = async () => {
    if (!editor || !token) return;
    const htmlContent = editor.getHTML();
    if (htmlContent === '<p></p>') {
        toast.info("Note content is empty. Nothing to save.");
        return;
    }

    try {
       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes/${note._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: htmlContent }),
      });
      if (!res.ok) throw new Error("Failed to save note");
      toast.success("Note saved successfully!");
      router.refresh();
    } catch(err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!editor || editor.isDestroyed}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}