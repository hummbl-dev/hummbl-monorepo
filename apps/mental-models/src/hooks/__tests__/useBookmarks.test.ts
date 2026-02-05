// Tests for useBookmarks hook

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookmarks } from '../useBookmarks';

describe('useBookmarks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Bookmark Management', () => {
    it('adds a bookmark', () => {
      const { result } = renderHook(() => useBookmarks());

      act(() => {
        result.current.addBookmark('narrative', 'N001', 'Test Narrative');
      });

      expect(result.current.bookmarks).toHaveLength(1);
      expect(result.current.bookmarks[0].title).toBe('Test Narrative');
    });

    it('removes a bookmark', () => {
      const { result } = renderHook(() => useBookmarks());

      let bookmarkId: string;
      act(() => {
        const bookmark = result.current.addBookmark('narrative', 'N001', 'Test');
        bookmarkId = bookmark.id;
      });

      act(() => {
        result.current.removeBookmark(bookmarkId!);
      });

      expect(result.current.bookmarks).toHaveLength(0);
    });

    it('toggles a bookmark', () => {
      const { result } = renderHook(() => useBookmarks());

      act(() => {
        result.current.toggleBookmark('narrative', 'N001', 'Test');
      });

      expect(result.current.bookmarks).toHaveLength(1);

      act(() => {
        result.current.toggleBookmark('narrative', 'N001', 'Test');
      });

      expect(result.current.bookmarks).toHaveLength(0);
    });
  });

  describe('Collections', () => {
    it('creates a collection', () => {
      const { result } = renderHook(() => useBookmarks());

      act(() => {
        result.current.createCollection('My Favorites');
      });

      expect(result.current.collections).toHaveLength(1);
    });

    it('deletes a collection', () => {
      const { result } = renderHook(() => useBookmarks());

      let collectionId: string;

      act(() => {
        const collection = result.current.createCollection('Test');
        collectionId = collection.id;
      });

      act(() => {
        result.current.deleteCollection(collectionId!);
      });

      expect(result.current.collections).toHaveLength(0);
    });
  });

  describe('Statistics', () => {
    it('calculates statistics', () => {
      const { result } = renderHook(() => useBookmarks());

      act(() => {
        result.current.addBookmark('narrative', 'N001', 'Test1');
        result.current.addBookmark('mentalModel', 'M001', 'Test2');
      });

      const stats = result.current.getStatistics();
      expect(stats.total).toBe(2);
      expect(stats.byType.narrative).toBe(1);
      expect(stats.byType.mentalModel).toBe(1);
    });
  });
});
