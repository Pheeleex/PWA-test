import { StyleSheet, Text, View, BackHandler, useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function QRCodeScreen() {
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
            <ScreenHeader
                title="Scan To Activate"
                withSafeArea={false}
                showBackButton={true}
                onBack={() => router.replace('/(drawer)/map')}
            />
            <View style={styles.content}>

                <View style={[styles.qrContainer, { backgroundColor: '#fff', borderColor: colorScheme === 'dark' ? '#333' : '#f0f0f0' }]}>
                    {/* Placeholder for QR Code - typically QR codes are black on white for readability */}
                    <Ionicons name="qr-code" size={300} color="#000" />
                </View>

                <Text style={[styles.availabilityText, { color: theme.icon }]}>
                    This QR code stays available while you are inside an activation zone.
                </Text>
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
        alignItems: 'center',
        padding: 24,
        // justifyContent: 'center',
    },
    qrContainer: {
        padding: 20,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
        marginBottom: 40,
        borderWidth: 1,
    },
    availabilityText: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
        maxWidth: 280,
    }
});
