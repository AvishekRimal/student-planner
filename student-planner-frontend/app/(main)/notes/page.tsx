"use client"; // This is now a Client Component

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
import { useAuth } from '@/redux/hooks/useAuth';

export default function NotesPage() {
  const { token } = useAuth(); // Get the token for API calls
  const searchParams = useSearchParams();
  const router = useRouter();
  const noteId = searchParams.get('noteId');

  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This single fetchData function is the source of truth for all data on this page.
  const fetchData = useCallback(async () => {
    if (!token) return; // Don't fetch if there's no token
    
    // Set loading state only on the initial fetch
    if(isLoading) setIsLoading(true);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const allNotesData = await res.json();
    const allNotes = Array.isArray(allNotesData) ? allNotesData : [];
    setNotes(allNotes);
    
    let currentNoteId = searchParams.get('noteId');
    if (currentNoteId && !allNotes.some(note => note._id === currentNoteId)) {
      router.replace('/notes');
      currentNoteId = allNotes.length > 0 ? allNotes[0]._id : null;
    } else if (!currentNoteId && allNotes.length > 0) {
      currentNoteId = allNotes[0]._id;
    }

    if (currentNoteId) {
      const activeNoteRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/notes/${currentNoteId}`, {
         headers: { 'Authorization': `Bearer ${token}` },
      });
      if(activeNoteRes.ok) {
         const activeNoteData = await activeNoteRes.json();
         setActiveNote(activeNoteData);
      } else {
         setActiveNote(null);
      }
    } else {
      setActiveNote(null);
    }
    
    setIsLoading(false);
  }, [token, noteId, router, searchParams, isLoading]); // note: isLoading is not needed here strictly, but good practice

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <NotesPageSkeleton />;
  }

  return (
    <div className="flex flex-col h-full"> 
      <div className="flex items-center justify-between mb-8">
        <Header title="Notes" subtitle="Your digital notebook." />
        <AddNoteModal onNoteAdded={fetchData} />
      </div>
      
      <ResizablePanelGroup direction="horizontal" className="rounded-lg border flex-1">
        <ResizablePanel defaultSize={30}>
          <div className="p-4 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4 shrink-0">All Notes</h2>
            <ul className="space-y-2 overflow-y-auto">
              {notes.map(note => (
                <li key={note._id}>
                  <div className={`relative rounded-md group ${activeNote?._id === note._id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
                    <Link href={`/notes?noteId=${note._id}`} className="block p-3">
                        <p className="font-semibold truncate">{note.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Updated: {new Date(note.updatedAt).toLocaleDateString()}
                        </p>
                    </Link>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <NoteActions note={note} onNoteActionComplete={fetchData} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={70}>
          <div className="p-4 h-full overflow-y-auto">
            {activeNote ? (
              <NoteEditor note={activeNote} onNoteSaved={fetchData} />
            ) : (
              <div className="flex items-center justify-center h-full">
                 <p className="text-muted-foreground">Select a note or create a new one.</p>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

// Loading Skeleton Component
function NotesPageSkeleton() {
  return (
     <div>
        <div className="flex items-center justify-between mb-8">
            <div><Skeleton className="h-8 w-32 mb-2" /><Skeleton className="h-4 w-48" /></div>
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex rounded-lg border h-[60vh]">
            <div className="p-4 w-[30%] border-r"><Skeleton className="h-full w-full" /></div>
            <div className="p-4 w-[70%]"><Skeleton className="h-full w-full" /></div>
        </div>
     </div>
  );
}