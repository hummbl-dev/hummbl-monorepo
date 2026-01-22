// Search screen for mobile app

import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

interface SearchResult {
  id: string;
  type: 'narrative' | 'mentalModel';
  title: string;
  summary: string;
  score: number;
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = (text: string) => {
    setQuery(text);

    // TODO: Implement actual search using shared fuzzy search
    // For now, show placeholder
    if (text.length > 2) {
      setResults([
        {
          id: '1',
          type: 'mentalModel',
          title: 'First Principles Thinking',
          summary: 'Breaking down complex problems...',
          score: 0.95,
        },
      ]);
    } else {
      setResults([]);
    }
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <TouchableOpacity style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultType}>
          {item.type === 'mentalModel' ? '🧠' : '📖'} {item.type}
        </Text>
        <Text style={styles.resultScore}>{(item.score * 100).toFixed(0)}%</Text>
      </View>
      <Text style={styles.resultTitle}>{item.title}</Text>
      <Text style={styles.resultSummary} numberOfLines={2}>
        {item.summary}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search mental models and narratives..."
          value={query}
          onChangeText={handleSearch}
          autoFocus
          clearButtonMode="while-editing"
        />
      </View>

      {results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
        />
      ) : query.length > 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptyHint}>Try different keywords</Text>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>Start typing to search</Text>
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
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
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultType: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  resultScore: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  resultSummary: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
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
  },
  emptyHint: {
    fontSize: 14,
    color: '#6b7280',
  },
});
