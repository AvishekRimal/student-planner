"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

// Import all necessary components
import { Header } from "@/components/layout/Header";
import { Note } from '@/components/notes/NoteTable';
import { NoteEditor } from '@/components/notes/NoteEditor';
import { AddNoteModal } from '@/components/notes/AddNoteModal';
import { NoteActions } from '@/components/notes/NoteActions';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/redux/hooks/useAuth';
import { useMediaQuery } from '@/redux/hooks/useMediaQuery'; // Ensure this path is correct

// =================================================================================
// Main Notes Page Component
// =================================================================================
export default function NotesPage() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const noteId = searchParams.get('noteId');
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simplified and more robust data fetching logic
  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);

    // 1. Always fetch the list of all notes
    const listRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const allNotes = await listRes.json();
    setNotes(Array.isArray(allNotes) ? allNotes : []);
    
    // 2. Only fetch the active note if a noteId is present in the URL
    if (noteId) {
      const activeNoteRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes/${noteId}`, {
         headers: { 'Authorization': `Bearer ${token}` },
      });
      if (activeNoteRes.ok) {
         setActiveNote(await activeNoteRes.json());
      } else {
         // If note is not found (e.g., deleted), go back to the notes list
         setActiveNote(null);
         router.replace('/notes'); 
      }
    } else {
      // If no noteId, ensure no note is active
      setActiveNote(null);
    }
    
    setIsLoading(false);
  }, [token, noteId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Let useCallback handle dependencies

  // =================================================================================
  // RENDER LOGIC
  // =================================================================================

  if (isDesktop) {
    // --- DESKTOP VIEW: Renders the two-panel resizable layout ---
    return (
      <div className="flex flex-col h-full p-4 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <Header title="Notes" subtitle="Your digital notebook." />
          <AddNoteModal onNoteAdded={fetchData} />
        </div>
        {isLoading ? (
          <NotesPageSkeleton isDesktop={true} />
        ) : (
          <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
            <ResizablePanel defaultSize={30}>
              <NotesList notes={notes} activeNoteId={noteId} onActionComplete={fetchData} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={70}>
              <div className="p-4 h-full overflow-y-auto">
                {activeNote ? (
                  <NoteEditor note={activeNote} onNoteSaved={fetchData} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Select a note to view or edit.</p>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    );
  }

  // --- MOBILE VIEW: Renders the Master-Detail flow ---
  return (
    <div className="h-full p-4 flex flex-col">
      {isLoading ? (
        <NotesPageSkeleton isDesktop={false} />
      ) : noteId && activeNote ? (
        // DETAIL VIEW (Show the editor for the selected note)
        <>
          <Link href="/notes" className="flex items-center gap-2 text-sm text-muted-foreground mb-4 shrink-0">
            <ArrowLeft className="h-4 w-4" />
            Back to all notes
          </Link>
          <div className="flex-1 overflow-y-auto">
            <NoteEditor note={activeNote} onNoteSaved={fetchData} />
          </div>
        </>
      ) : (
        // MASTER VIEW (Show the list of notes)
        <>
          <div className="flex items-center justify-between mb-4 shrink-0">
            <Header title="Notes" subtitle="Your digital notebook." />
            <AddNoteModal onNoteAdded={fetchData} />
          </div>
          <NotesList notes={notes} activeNoteId={noteId} onActionComplete={fetchData} />
        </>
      )}
    </div>
  );
}


// =================================================================================
// Child Component: NotesList (Reusable for both desktop and mobile)
// =================================================================================
function NotesList({ notes, activeNoteId, onActionComplete }: { notes: Note[], activeNoteId: string | null, onActionComplete: () => void }) {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4 px-4 shrink-0">All Notes</h2>
      <ul className="space-y-2 overflow-y-auto px-4">
        {notes.map(note => (
          <li key={note._id}>
            <div className={`relative rounded-md group ${activeNoteId === note._id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
              <Link href={`/notes?noteId=${note._id}`} className="block p-3">
                  <p className="font-semibold truncate">{note.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
              </Link>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <NoteActions note={note} onNoteActionComplete={onActionComplete} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// =================================================================================
// Child Component: Loading Skeleton
// =================================================================================
function NotesPageSkeleton({ isDesktop }: { isDesktop: boolean }) {
  return (
     <div className="h-full">
        <div className="flex items-center justify-between mb-8">
            <div><Skeleton className="h-8 w-32 mb-2" /><Skeleton className="h-4 w-48" /></div>
            <Skeleton className="h-10 w-32" />
        </div>
        <div className={`flex rounded-lg border h-[calc(100%-100px)] ${isDesktop ? 'flex-row' : 'flex-col'}`}>
            <div className={`p-4 ${isDesktop ? 'w-[30%] border-r' : 'h-full'}`}>
                <Skeleton className="h-full w-full" />
            </div>
            {isDesktop && <div className="p-4 w-[70%]"><Skeleton className="h-full w-full" /></div>}
        </div>
     </div>
  );
}