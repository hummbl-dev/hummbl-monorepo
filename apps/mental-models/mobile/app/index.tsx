// Home screen for mobile app

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const features = [
    {
      title: 'Mental Models',
      description: 'Explore 200+ mental models',
      route: '/mental-models',
      icon: '🧠',
    },
    {
      title: 'Narratives',
      description: 'Read curated narratives',
      route: '/narratives',
      icon: '📖',
    },
    {
      title: 'Search',
      description: 'Find content quickly',
      route: '/search',
      icon: '🔍',
    },
    {
      title: 'Bookmarks',
      description: 'Your saved content',
      route: '/bookmarks',
      icon: '⭐',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HUMMBL</Text>
        <Text style={styles.subtitle}>Human Mental Models & Behavioral Logic</Text>
      </View>

      <View style={styles.grid}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.route}
            style={styles.card}
            onPress={() => router.push(feature.route as any)}
          >
            <Text style={styles.icon}>{feature.icon}</Text>
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardDescription}>{feature.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>200+</Text>
          <Text style={styles.statLabel}>Mental Models</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>20+</Text>
          <Text style={styles.statLabel}>Narratives</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e7ff',
    textAlign: 'center',
  },
  grid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 24,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
});
