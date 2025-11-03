import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.name}>Child User</Text>
        <Text style={styles.email}>child@example.com</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  profile: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  avatar: {
    fontSize: 64,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
});
