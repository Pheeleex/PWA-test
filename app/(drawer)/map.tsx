import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '@/components/ScreenHeader';

export default function MapScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <ScreenHeader title="Map View" withSafeArea={false} showBackButton={true} />
            <View style={styles.content}>
                {/* Map Placeholder */}
                <View style={styles.mapPlaceholder}>
                    <View style={styles.mapBackground}>
                        <View style={styles.gridLineVertical} />
                        <View style={styles.gridLineHorizontal} />
                        <Ionicons name="location" size={48} color="#FF3B30" />
                        <View style={styles.pulseRing} />
                    </View>
                    <Text style={styles.placeholderText}>Map Loaded</Text>
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
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        position: 'relative',
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#E5E3DF', // Common map background color
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
        backgroundColor: 'rgba(0,0,0,0.05)',
        left: '50%',
    },
    gridLineHorizontal: {
        position: 'absolute',
        width: '100%',
        height: 2,
        backgroundColor: 'rgba(0,0,0,0.05)',
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
        color: '#666',
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
