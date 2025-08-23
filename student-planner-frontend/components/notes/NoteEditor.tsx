/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Note } from './NoteTable';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react';
import { useAuth } from '@/redux/hooks/useAuth';
import { toast } from "sonner";

/**
 * The MenuBar is a small, self-contained component for the editor's toolbar.
 * It receives the editor instance as a prop and renders formatting buttons.
 */
const MenuBar = ({ editor }: { editor: any | null }) => {
  if (!editor) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-1 p-2 border rounded-md bg-background">
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

// Define the props that the main editor component will accept
interface NoteEditorProps {
  note: Note;
  onNoteSaved: () => void; // The callback function to refresh the parent's data
}

/**
 * The main NoteEditor component. It displays the Tiptap editor and handles saving.
 */
export function NoteEditor({ note, onNoteSaved }: NoteEditorProps) {
  const { token } = useAuth();
  
  const editor = useEditor({
    extensions: [StarterKit],
    content: note.content,
    // This is the crucial fix for the Tiptap SSR (Server-Side Rendering) error
    immediatelyRender: false,
    
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert min-h-[400px] max-w-none w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 p-4',
      },
    },
  });

  // This effect synchronizes the editor's content with the selected note.
  // It's necessary because we set `immediatelyRender: false`.
  useEffect(() => {
    if (editor && note) {
      // Check if the editor's content is different from the prop to prevent an infinite loop
      if (editor.getHTML() !== note.content) {
        editor.commands.setContent(note.content);
      }
    }
  }, [note, editor]);

  const handleSave = async () => {
    if (!editor || !token) return;

    const htmlContent = editor.getHTML();

    try {
       const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes/${note._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        // We only save the 'content' here. Title/category are edited in a separate modal.
        body: JSON.stringify({ content: htmlContent }),
      });

      if (!res.ok) throw new Error("Failed to save note");
      
      toast.success("Note saved successfully!");

      // Call the parent's refetch function to update the "Last Updated" timestamp
      onNoteSaved();
      
    } catch(err: any) {
      toast.error("Failed to save note");
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!editor || editor.isDestroyed}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}