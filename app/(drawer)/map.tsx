import { StyleSheet, Text, View, TouchableOpacity, Image, BackHandler, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '@/components/ScreenHeader';
import { useEffect } from 'react';
import { Colors } from '@/constants/theme';

export default function MapScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    useEffect(() => {
        const onBackPress = () => {
            router.back();
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [router]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader title="Map View" withSafeArea={false} showBackButton={true} />
            <View style={styles.content}>
                {/* Map Placeholder */}
                <View style={[styles.mapPlaceholder, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#E5E3DF' }]}>
                    <View style={styles.mapBackground}>
                        <View style={[styles.gridLineVertical, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
                        <View style={[styles.gridLineHorizontal, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
                        <Ionicons name="location" size={48} color="#FF3B30" />
                        <View style={styles.pulseRing} />
                    </View>
                    <Text style={[styles.placeholderText, { color: '#666' }]}>Map Loaded</Text>
                </View>

                {/* Activation QR Code Button */}
                <TouchableOpacity
                    style={styles.qrButton}
                    onPress={() => router.push('/(drawer)/qr-code')}
                >
                    <Ionicons name="qr-code-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.qrButtonText}>Activation QR code</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        position: 'relative',
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    gridLineVertical: {
        position: 'absolute',
        width: 2,
        height: '100%',
        left: '50%',
    },
    gridLineHorizontal: {
        position: 'absolute',
        width: '100%',
        height: 2,
        top: '50%',
    },
    pulseRing: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 59, 48, 0.2)',
        zIndex: -1,
    },
    placeholderText: {
        position: 'absolute',
        bottom: 100,
        backgroundColor: 'rgba(255,255,255,0.8)',
        padding: 8,
        borderRadius: 4,
        fontSize: 12,
    },
    qrButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        flexDirection: 'row',
        backgroundColor: '#0E2B63',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 17,
        alignItems: 'center',
        shadowColor: "#0E2B63",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    qrButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
