// Notes management hook for mental models and narratives

import { useState, useCallback, useEffect } from 'react';

export interface Note {
  id: string;
  type: 'narrative' | 'mentalModel';
  itemId: string;
  itemTitle: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  isPinned?: boolean;
  color?: string;
}

const NOTES_KEY = 'hummbl_notes';

/**
 * Load notes from localStorage
 */
function loadNotes(): Note[] {
  try {
    const stored = localStorage.getItem(NOTES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load notes:', error);
  }
  return [];
}

/**
 * Save notes to localStorage
 */
function saveNotes(notes: Note[]): void {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.warn('Failed to save notes:', error);
  }
}

/**
 * Custom hook for notes management
 */
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [syncing, setSyncing] = useState(false);

  // Auto-save notes to localStorage
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  /**
   * Create a note
   */
  const createNote = useCallback(
    (
      type: 'narrative' | 'mentalModel',
      itemId: string,
      itemTitle: string,
      content: string,
      options?: { tags?: string[]; color?: string }
    ) => {
      const note: Note = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        itemId,
        itemTitle,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPinned: false,
        ...options,
      };

      setNotes((prev) => [note, ...prev]);
      return note;
    },
    []
  );

  /**
   * Update a note
   */
  const updateNote = useCallback((noteId: string, updates: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId ? { ...note, ...updates, updatedAt: Date.now() } : note
      )
    );
  }, []);

  /**
   * Delete a note
   */
  const deleteNote = useCallback((noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  }, []);

  /**
   * Get note by ID
   */
  const getNote = useCallback(
    (noteId: string): Note | undefined => {
      return notes.find((note) => note.id === noteId);
    },
    [notes]
  );

  /**
   * Get notes for specific item
   */
  const getNotesForItem = useCallback(
    (itemId: string): Note[] => {
      return notes.filter((note) => note.itemId === itemId);
    },
    [notes]
  );

  /**
   * Get notes by type
   */
  const getNotesByType = useCallback(
    (type: 'narrative' | 'mentalModel'): Note[] => {
      return notes.filter((note) => note.type === type);
    },
    [notes]
  );

  /**
   * Toggle pin status
   */
  const togglePin = useCallback((noteId: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId ? { ...note, isPinned: !note.isPinned, updatedAt: Date.now() } : note
      )
    );
  }, []);

  /**
   * Get pinned notes
   */
  const getPinnedNotes = useCallback((): Note[] => {
    return notes.filter((note) => note.isPinned);
  }, [notes]);

  /**
   * Search notes
   */
  const searchNotes = useCallback(
    (query: string): Note[] => {
      const q = query.toLowerCase();
      return notes.filter(
        (note) =>
          note.content.toLowerCase().includes(q) ||
          note.itemTitle.toLowerCase().includes(q) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    },
    [notes]
  );

  /**
   * Get notes by tags
   */
  const getNotesByTags = useCallback(
    (tags: string[]): Note[] => {
      return notes.filter((note) => note.tags?.some((tag) => tags.includes(tag)));
    },
    [notes]
  );

  /**
   * Get recent notes
   */
  const getRecentNotes = useCallback(
    (limit = 10): Note[] => {
      return [...notes].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit);
    },
    [notes]
  );

  /**
   * Get all unique tags
   */
  const getAllTags = useCallback((): string[] => {
    const tags = new Set<string>();
    notes.forEach((note) => {
      note.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [notes]);

  /**
   * Get statistics
   */
  const getStatistics = useCallback(() => {
    const byType = {
      narrative: notes.filter((n) => n.type === 'narrative').length,
      mentalModel: notes.filter((n) => n.type === 'mentalModel').length,
    };

    const pinned = notes.filter((n) => n.isPinned).length;
    const withTags = notes.filter((n) => n.tags && n.tags.length > 0).length;

    const totalWords = notes.reduce((sum, note) => {
      return sum + note.content.split(/\s+/).length;
    }, 0);

    return {
      total: notes.length,
      byType,
      pinned,
      withTags,
      totalWords,
      avgWordsPerNote: notes.length > 0 ? Math.round(totalWords / notes.length) : 0,
      uniqueTags: getAllTags().length,
    };
  }, [notes, getAllTags]);

  /**
   * Export notes as JSON
   */
  const exportNotes = useCallback(() => {
    return JSON.stringify(notes, null, 2);
  }, [notes]);

  /**
   * Import notes from JSON
   */
  const importNotes = useCallback((json: string, merge = false) => {
    try {
      const imported = JSON.parse(json);

      if (merge) {
        setNotes((prev) => [...prev, ...imported]);
      } else {
        setNotes(imported);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invalid JSON',
      };
    }
  }, []);

  /**
   * Clear all notes
   */
  const clearAllNotes = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all notes? This cannot be undone.')) {
      setNotes([]);
      return true;
    }
    return false;
  }, []);

  /**
   * Trigger sync (placeholder for backend sync)
   */
  const triggerSync = useCallback(async () => {
    setSyncing(true);
    // This will be implemented when backend is available
    // For now, just simulate sync delay
    return new Promise<{ success: boolean }>((resolve) => {
      setTimeout(() => {
        setSyncing(false);
        resolve({ success: true });
      }, 500);
    });
  }, []);

  return {
    // State
    notes,
    syncing,

    // CRUD operations
    createNote,
    updateNote,
    deleteNote,
    getNote,

    // Filtering & queries
    getNotesForItem,
    getNotesByType,
    getNotesByTags,
    getRecentNotes,
    getPinnedNotes,
    searchNotes,

    // Utilities
    togglePin,
    getAllTags,
    getStatistics,
    exportNotes,
    importNotes,
    clearAllNotes,
    triggerSync,
  };
}
