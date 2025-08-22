"use client";

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Note } from './NoteTable'; // Reuse our Note type
import { Button } from '@/components/ui/button';
import { Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react';
import { useAuth } from '@/redux/hooks/useAuth';
import { useRouter } from 'next/navigation';

// The MenuBar is a small helper component for the editor's toolbar.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }
  return (
    <div className="flex items-center gap-1 p-2 border rounded-md">
      <Button 
        type="button" 
        variant={editor.isActive('bold') ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button 
        type="button" 
        variant={editor.isActive('italic') ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button 
        type="button" 
        variant={editor.isActive('strike') ? 'secondary' : 'ghost'} 
        size="sm" 
        onClick={() => editor.chain().focus().toggleStrike().run()}
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
    // The initial content to display
    content: note.content,
    // This is the crucial fix for the SSR hydration error.
    immediatelyRender: false,
    
    // Add Tailwind classes to the editor area itself
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert min-h-[400px] max-w-none w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 p-4',
      },
    },
  });

  // This effect is necessary because we set immediatelyRender to false.
  // It ensures that when a different note is selected, the editor's
  // content is correctly updated after it has mounted on the client.
  useEffect(() => {
    if (editor && note) {
      // Check if the editor's content is already the same to prevent an infinite loop
      if (editor.getHTML() !== note.content) {
        editor.commands.setContent(note.content);
      }
    }
  }, [note, editor]);


  const handleSave = async () => {
    if (!editor || !token) return;

    const htmlContent = editor.getHTML();
    
    // To prevent saving an empty note by accident
    if (htmlContent === '<p></p>') {
        console.log("Not saving an empty note.");
        return;
    }

    try {
       await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes/${note._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        // We only need to send the content, as the title is managed elsewhere for this UI
        body: JSON.stringify({ content: htmlContent }),
      });
      // In a real app, you would show a success "toast" notification here
      router.refresh(); // Refresh the page to update the "Last Updated" timestamp
    } catch(err) {
      console.error("Failed to save note", err);
      // In a real app, you would show an error "toast" notification here
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