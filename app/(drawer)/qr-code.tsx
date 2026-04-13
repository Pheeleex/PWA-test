import { StyleSheet, Text, View, BackHandler, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context';

export default function QRCodeScreen() {
    const router = useRouter();
    const { user } = useAuth();
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
    console.log(user?.promo_URL)
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
                    {user?.promo_URL ? (
                        <Image
                            source={{ uri: user.promo_URL.trim() }}
                            style={{ width: 260, height: 260 }}
                            contentFit="contain"
                            transition={200}
                        />
                    ) : (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle-outline" size={80} color="#FF3B30" />
                            <Text style={styles.errorText}>No promotional image found</Text>
                        </View>
                    )}
                </View>

                {user?.promo_code && (
                    <Text style={[styles.promoCodeText, { color: theme.text }]}>
                        Promo Code: <Text style={{ fontWeight: 'bold' }}>{user.promo_code}</Text>
                    </Text>
                )}

                <Text style={[styles.availabilityText, { color: theme.icon }]}>
                    This QR code stays available while you are inside an activation zone.
                </Text>

                <View style={[styles.disclaimerContainer, { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
                    <Ionicons name="information-circle-outline" size={20} color="#64748B" style={{ marginRight: 10 }} />
                    <Text style={[styles.disclaimerText, { color: '#64748B' }]}>
                        Nur für erwachsene Raucher/innen – wenn Du jünger als 25 Jahre aussiehst, ist die Vorlage eines Ausweises erforderlich.
                    </Text>
                </View>
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
        marginBottom: 32,
    },
    promoCodeText: {
        fontSize: 18,
        lineHeight: 24,
        textAlign: 'center',
        marginBottom: 20,
    },
    disclaimerContainer: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginHorizontal: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    disclaimerText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '500',
        textAlign: 'left',
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        height: 260,
        width: 260,
    },
    errorText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    }
});
