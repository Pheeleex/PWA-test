import { StyleSheet, Text, View, BackHandler, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import CustomAlert from '@/components/CustomAlert';
import { Colors } from '@/constants/theme';

export default function QRCodeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
    const [alertVisible, setAlertVisible] = useState(false);

    useEffect(() => {
        if (timeLeft === 0) {
            setAlertVisible(true);
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(intervalId);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft]);

    useEffect(() => {
        const onBackPress = () => {
            router.back();
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [router]);


    const handleTimeout = () => {
        setAlertVisible(false);
        router.replace('/(drawer)/map');
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

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

                <View style={styles.timerContainer}>
                    <Text style={[styles.timerLabel, { color: theme.icon }]}>Code expires in:</Text>
                    <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
                </View>

                {timeLeft === 0 && (
                    <Text style={styles.expiredText}>Code Expired.</Text>
                )}
            </View>

            <CustomAlert
                visible={alertVisible}
                title="Time Expired"
                message="Your activation code has expired."
                type="warning"
                onClose={handleTimeout}
                showCancel={false}
                confirmText="OK"
            />
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
    timerContainer: {
        alignItems: 'center',
    },
    timerLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    timerValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FF3B30', // Red for urgency
        fontVariant: ['tabular-nums'], // Ensures fixed width for numbers prevents jumping
    },
    expiredText: {
        marginTop: 16,
        color: '#FF3B30',
        fontWeight: '600',
    }
});
