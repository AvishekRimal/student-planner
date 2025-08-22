import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Header } from "@/components/layout/Header";
import { Note } from '@/components/notes/NoteTable'; // Reuse the interface
import { NoteEditor } from '@/components/notes/NoteEditor';
import { AddNoteModal } from '@/components/notes/AddNoteModal';
import { notFound } from 'next/navigation';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";


// Server-side fetch function for ALL notes
async function getNotes(token: string): Promise<Note[]> {
  if (!token) return [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data || [];
  } catch (error) { return []; }
}

// Server-side fetch function for a SINGLE note
async function getNoteById(token: string, id: string): Promise<Note | null> {
    if (!token) return null;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) { return null; }
}


// This page now accepts search parameters to know which note is selected
export default async function NotesPage({ searchParams }: { searchParams: { noteId?: string } }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) {
    redirect('/login');
  }

  // Fetch all notes for the list, and fetch the selected note for the editor
  const allNotes = await getNotes(token);
  
  // Determine which note is currently "active" or selected.
  // If a noteId is in the URL, fetch that one.
  // Otherwise, default to the most recently updated note.
  const activeNoteId = searchParams.noteId || (allNotes[0]?._id);
  const activeNote = activeNoteId ? await getNoteById(token, activeNoteId) : null;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Header 
          title="Notes"
          subtitle="Your digital notebook."
        />
        <AddNoteModal />
      </div>
      
      {/* Resizable Panel Layout for a professional feel */}
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
        {/* Panel 1: Notes List */}
        <ResizablePanel defaultSize={30}>
          <div className="p-4 h-full overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">All Notes</h2>
            <ul className="space-y-2">
              {allNotes.map(note => (
                <li key={note._id}>
                  <Link href={`/notes?noteId=${note._id}`}>
                    <div className={`p-2 rounded-md ${activeNoteId === note._id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                      <p className="font-semibold truncate">{note.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Updated: {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Panel 2: Note Editor */}
        <ResizablePanel defaultSize={70}>
          <div className="p-4 h-full overflow-y-auto">
            {activeNote ? (
              <NoteEditor note={activeNote} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Select a note to view or create a new one.</p>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}