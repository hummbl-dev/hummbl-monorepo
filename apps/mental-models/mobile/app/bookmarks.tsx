// Bookmarks screen for mobile app

import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

interface Bookmark {
  id: string;
  type: 'narrative' | 'mentalModel';
  title: string;
  addedAt: number;
}

export default function BookmarksScreen() {
  // TODO: Use shared useBookmarks hook
  const bookmarks: Bookmark[] = [];

  const renderBookmark = ({ item }: { item: Bookmark }) => (
    <TouchableOpacity style={styles.bookmarkCard}>
      <View style={styles.bookmarkHeader}>
        <Text style={styles.bookmarkType}>{item.type === 'mentalModel' ? '🧠' : '📖'}</Text>
        <Text style={styles.bookmarkDate}>{new Date(item.addedAt).toLocaleDateString()}</Text>
      </View>
      <Text style={styles.bookmarkTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {bookmarks.length > 0 ? (
        <FlatList
          data={bookmarks}
          renderItem={renderBookmark}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyText}>No bookmarks yet</Text>
          <Text style={styles.emptyHint}>Bookmark your favorite content to see it here</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  list: {
    padding: 16,
  },
  bookmarkCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bookmarkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookmarkType: {
    fontSize: 20,
  },
  bookmarkDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
