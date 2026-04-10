import React from 'react';
import { View, Text, Modal, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useNetwork } from '@/context/NetworkContext';

const NoInternetModal: React.FC = () => {
  const { isConnected, isInternetReachable } = useNetwork();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const showModal = isConnected === false || isInternetReachable === false;

  if (!showModal) return null;

  return (
    <Modal
      transparent={true}
      visible={showModal}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="wifi-outline" size={60} color="#EF4444" />
            <View style={styles.errorBadge}>
              <Ionicons name="close" size={20} color="#FFF" />
            </View>
          </View>
          
          <Text style={[styles.title, { color: theme.text }]}>No Internet Connection</Text>
          <Text style={[styles.description, { color: '#64748B' }]}>
            It looks like you're offline. Please check your internet connection and try again.
          </Text>
          
          <View style={styles.statusBox}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Searching for connection...</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  iconContainer: {
    marginBottom: 24,
    position: 'relative',
  },
  errorBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 177, 235, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00B1EB',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#00B1EB',
    fontWeight: '600',
  },
});

export default NoInternetModal;
