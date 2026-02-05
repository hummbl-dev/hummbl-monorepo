// Bookmarks and favorites management hook

import { useState, useCallback, useEffect } from 'react';

export interface Bookmark {
  id: string;
  type: 'narrative' | 'mentalModel';
  itemId: string;
  title: string;
  addedAt: number;
  tags?: string[];
  notes?: string;
  category?: string;
}

export interface BookmarkCollection {
  id: string;
  name: string;
  description?: string;
  bookmarks: string[]; // bookmark IDs
  createdAt: number;
  updatedAt: number;
}

const BOOKMARKS_KEY = 'hummbl_bookmarks';
const COLLECTIONS_KEY = 'hummbl_bookmark_collections';

/**
 * Load bookmarks from localStorage
 */
function loadBookmarks(): Bookmark[] {
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load bookmarks:', error);
  }
  return [];
}

/**
 * Save bookmarks to localStorage
 */
function saveBookmarks(bookmarks: Bookmark[]): void {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  } catch (error) {
    console.warn('Failed to save bookmarks:', error);
  }
}

/**
 * Load collections from localStorage
 */
function loadCollections(): BookmarkCollection[] {
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load collections:', error);
  }
  return [];
}

/**
 * Save collections to localStorage
 */
function saveCollections(collections: BookmarkCollection[]): void {
  try {
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  } catch (error) {
    console.warn('Failed to save collections:', error);
  }
}

/**
 * Custom hook for bookmarks management
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(loadBookmarks);
  const [collections, setCollections] = useState<BookmarkCollection[]>(loadCollections);

  // Auto-save bookmarks
  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  // Auto-save collections
  useEffect(() => {
    saveCollections(collections);
  }, [collections]);

  /**
   * Add a bookmark
   */
  const addBookmark = useCallback(
    (
      type: 'narrative' | 'mentalModel',
      itemId: string,
      title: string,
      options?: { tags?: string[]; notes?: string; category?: string }
    ) => {
      const bookmark: Bookmark = {
        id: `bookmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        itemId,
        title,
        addedAt: Date.now(),
        ...options,
      };

      setBookmarks((prev) => [bookmark, ...prev]);
      return bookmark;
    },
    []
  );

  /**
   * Remove a bookmark
   */
  const removeBookmark = useCallback((bookmarkId: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));

    // Remove from collections
    setCollections((prev) =>
      prev.map((col) => ({
        ...col,
        bookmarks: col.bookmarks.filter((id) => id !== bookmarkId),
        updatedAt: Date.now(),
      }))
    );
  }, []);

  /**
   * Check if item is bookmarked
   */
  const isBookmarked = useCallback(
    (itemId: string): boolean => {
      return bookmarks.some((b) => b.itemId === itemId);
    },
    [bookmarks]
  );

  /**
   * Get bookmark by item ID
   */
  const getBookmark = useCallback(
    (itemId: string): Bookmark | undefined => {
      return bookmarks.find((b) => b.itemId === itemId);
    },
    [bookmarks]
  );

  /**
   * Update bookmark
   */
  const updateBookmark = useCallback((bookmarkId: string, updates: Partial<Bookmark>) => {
    setBookmarks((prev) => prev.map((b) => (b.id === bookmarkId ? { ...b, ...updates } : b)));
  }, []);

  /**
   * Toggle bookmark
   */
  const toggleBookmark = useCallback(
    (type: 'narrative' | 'mentalModel', itemId: string, title: string) => {
      const existing = bookmarks.find((b) => b.itemId === itemId);

      if (existing) {
        removeBookmark(existing.id);
        return false;
      } else {
        addBookmark(type, itemId, title);
        return true;
      }
    },
    [bookmarks, addBookmark, removeBookmark]
  );

  /**
   * Get bookmarks by type
   */
  const getBookmarksByType = useCallback(
    (type: 'narrative' | 'mentalModel'): Bookmark[] => {
      return bookmarks.filter((b) => b.type === type);
    },
    [bookmarks]
  );

  /**
   * Get bookmarks by tags
   */
  const getBookmarksByTags = useCallback(
    (tags: string[]): Bookmark[] => {
      return bookmarks.filter((b) => b.tags?.some((tag) => tags.includes(tag)));
    },
    [bookmarks]
  );

  /**
   * Search bookmarks
   */
  const searchBookmarks = useCallback(
    (query: string): Bookmark[] => {
      const q = query.toLowerCase();
      return bookmarks.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.notes?.toLowerCase().includes(q) ||
          b.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    },
    [bookmarks]
  );

  /**
   * Create a collection
   */
  const createCollection = useCallback((name: string, description?: string) => {
    const collection: BookmarkCollection = {
      id: `collection_${Date.now()}`,
      name,
      description,
      bookmarks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setCollections((prev) => [collection, ...prev]);
    return collection;
  }, []);

  /**
   * Delete a collection
   */
  const deleteCollection = useCallback((collectionId: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== collectionId));
  }, []);

  /**
   * Add bookmark to collection
   */
  const addToCollection = useCallback((collectionId: string, bookmarkId: string) => {
    setCollections((prev) =>
      prev.map((col) =>
        col.id === collectionId && !col.bookmarks.includes(bookmarkId)
          ? {
              ...col,
              bookmarks: [...col.bookmarks, bookmarkId],
              updatedAt: Date.now(),
            }
          : col
      )
    );
  }, []);

  /**
   * Remove bookmark from collection
   */
  const removeFromCollection = useCallback((collectionId: string, bookmarkId: string) => {
    setCollections((prev) =>
      prev.map((col) =>
        col.id === collectionId
          ? {
              ...col,
              bookmarks: col.bookmarks.filter((id) => id !== bookmarkId),
              updatedAt: Date.now(),
            }
          : col
      )
    );
  }, []);

  /**
   * Get bookmarks in collection
   */
  const getCollectionBookmarks = useCallback(
    (collectionId: string): Bookmark[] => {
      const collection = collections.find((c) => c.id === collectionId);
      if (!collection) return [];

      return bookmarks.filter((b) => collection.bookmarks.includes(b.id));
    },
    [bookmarks, collections]
  );

  /**
   * Update collection
   */
  const updateCollection = useCallback(
    (collectionId: string, updates: Partial<BookmarkCollection>) => {
      setCollections((prev) =>
        prev.map((col) =>
          col.id === collectionId ? { ...col, ...updates, updatedAt: Date.now() } : col
        )
      );
    },
    []
  );

  /**
   * Get statistics
   */
  const getStatistics = useCallback(() => {
    const byType = {
      narrative: bookmarks.filter((b) => b.type === 'narrative').length,
      mentalModel: bookmarks.filter((b) => b.type === 'mentalModel').length,
    };

    const withNotes = bookmarks.filter((b) => b.notes && b.notes.length > 0).length;
    const withTags = bookmarks.filter((b) => b.tags && b.tags.length > 0).length;

    const allTags = new Set<string>();
    bookmarks.forEach((b) => {
      b.tags?.forEach((tag) => allTags.add(tag));
    });

    return {
      total: bookmarks.length,
      byType,
      withNotes,
      withTags,
      uniqueTags: allTags.size,
      collections: collections.length,
    };
  }, [bookmarks, collections]);

  /**
   * Export bookmarks as JSON
   */
  const exportBookmarks = useCallback(() => {
    return JSON.stringify({ bookmarks, collections }, null, 2);
  }, [bookmarks, collections]);

  /**
   * Import bookmarks from JSON
   */
  const importBookmarks = useCallback((json: string, merge = false) => {
    try {
      const imported = JSON.parse(json);

      if (merge) {
        setBookmarks((prev) => [...prev, ...imported.bookmarks]);
        setCollections((prev) => [...prev, ...imported.collections]);
      } else {
        setBookmarks(imported.bookmarks || []);
        setCollections(imported.collections || []);
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
   * Clear all bookmarks
   */
  const clearAllBookmarks = useCallback(() => {
    setBookmarks([]);
    setCollections([]);
  }, []);

  return {
    // State
    bookmarks,
    collections,

    // Bookmark management
    addBookmark,
    removeBookmark,
    updateBookmark,
    toggleBookmark,
    isBookmarked,
    getBookmark,

    // Filtering & search
    getBookmarksByType,
    getBookmarksByTags,
    searchBookmarks,

    // Collections
    createCollection,
    deleteCollection,
    updateCollection,
    addToCollection,
    removeFromCollection,
    getCollectionBookmarks,

    // Utilities
    getStatistics,
    exportBookmarks,
    importBookmarks,
    clearAllBookmarks,
  };
}
