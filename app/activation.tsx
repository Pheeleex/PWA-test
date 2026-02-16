import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import ScreenHeader from '@/components/ScreenHeader';
import CustomAlert from '@/components/CustomAlert';

export default function ActivationScreen() {
    const router = useRouter();
    const [activationCode, setActivationCode] = useState(['', '', '', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type: 'success' | 'error' }>({
        title: '',
        message: '',
        type: 'success'
    });

    const showAlert = (title: string, message: string, type: 'success' | 'error') => {
        setAlertConfig({ title, message, type });
        setAlertVisible(true);
    };

    const handleCloseAlert = () => {
        setAlertVisible(false);
        if (alertConfig.title === 'Success') {
            router.replace('/login');
        }
    };

    const handleActivation = () => {
        const code = activationCode.join('');
        if (code.length < 6) {
            showAlert('Error', 'Please enter the full 6-digit activation code.', 'error');
            return;
        }
        // Mock activation logic
        showAlert('Success', 'Account activated successfully!', 'success');
    };

    const handleResendCode = () => {
        showAlert('Code Sent', 'A new activation code has been sent to your email.', 'success');
    };

    const handleChange = (text: string, index: number) => {
        const newCode = [...activationCode];
        newCode[index] = text;
        setActivationCode(newCode);

        // Auto-focus next input
        if (text && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !activationCode[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader
                title="Activate Account"
                withSafeArea={true}
                showBackButton={true}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.content}
            >
                <View style={styles.header}>
                    <Text style={styles.subtitle}>Enter the 6-digit code sent to your email.</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.codeContainer}>
                        {activationCode.map((digit: string, index: number) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputs.current[index] = ref; }}
                                style={[
                                    styles.codeInput,
                                    digit ? styles.codeInputFilled : null
                                ]}
                                value={digit}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                            />
                        ))}
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity onPress={handleResendCode} style={styles.resendButton}>
                            <Text style={styles.resendButtonText}>Resend Code</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleActivation} style={styles.activateButton}>
                            <Text style={styles.activateButtonText}>Verify</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
            <CustomAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={handleCloseAlert}
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 40, // Add padding bottom for better spacing
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        marginBottom: 20,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40, // Increased specific margin
    },
    codeInput: {
        width: 45,
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 20,
        textAlign: 'center',
        color: '#333',
        backgroundColor: '#F9F9F9',
    },
    codeInputFilled: {
        borderColor: '#00B1EB',
        backgroundColor: '#fff',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    activateButton: {
        width: 150, // Slightly reduced width to ensure fit
        height: 43,
        backgroundColor: '#0E2B63',
        borderRadius: 17,
        justifyContent: 'center',
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
    activateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    resendButton: {
        padding: 10,
    },
    resendButtonText: {
        color: '#00B1EB',
        fontSize: 16,
        fontWeight: '500',
    },
});
