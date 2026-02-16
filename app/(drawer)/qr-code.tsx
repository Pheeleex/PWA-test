import { StyleSheet, Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter } from 'expo-router';
import CustomAlert from '@/components/CustomAlert';

export default function QRCodeScreen() {
    const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
    const [alertVisible, setAlertVisible] = useState(false);
    const router = useRouter();

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
        <View style={styles.container}>
            <ScreenHeader
                title="Scan To Activate"
                withSafeArea={false}
                showBackButton={true}
                onBack={() => router.replace('/(drawer)/map')}
            />
            <View style={styles.content}>

                <View style={styles.qrContainer}>
                    {/* Placeholder for QR Code */}
                    <Ionicons name="qr-code" size={300} color="#000" />
                </View>

                <View style={styles.timerContainer}>
                    <Text style={styles.timerLabel}>Code expires in:</Text>
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
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        padding: 24,
        // justifyContent: 'center',
    },
    instruction: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    qrContainer: {
        padding: 20,
        backgroundColor: '#fff',
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
        borderColor: '#f0f0f0',
    },
    timerContainer: {
        alignItems: 'center',
    },
    timerLabel: {
        fontSize: 14,
        color: '#666',
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
