import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, BackHandler, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useRef, useState, useEffect } from 'react';
import ScreenHeader from '@/components/ScreenHeader';
import CustomAlert from '@/components/CustomAlert';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

export default function ActivationScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const [activationCode, setActivationCode] = useState(['', '', '', '', '', '']);
    const inputs = useRef<Array<TextInput | null>>([]);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type: 'success' | 'error' }>({
        title: '',
        message: '',
        type: 'success'
    });

    useEffect(() => {
        const onBackPress = () => {
            router.back();
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [router]);

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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader
                title="Activate Account"
                withSafeArea={true}
                showBackButton={true}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={[styles.content, { paddingBottom: 40 + insets.bottom }]}
            >
                <View style={styles.header}>
                    <Text style={[styles.subtitle, { color: theme.text }]}>Enter the 6-digit code sent to your email.</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.codeContainer}>
                        {activationCode.map((digit: string, index: number) => (
                            <TextInput
                                key={index}
                                ref={(ref) => { inputs.current[index] = ref; }}
                                style={[
                                    styles.codeInput,
                                    {
                                        color: theme.text,
                                        backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F9F9F9',
                                        borderColor: '#00B1EB'
                                    },
                                    digit ? { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#fff' } : null
                                ]}
                                value={digit}
                                onChangeText={(text) => handleChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="number-pad"
                                maxLength={1}
                                selectTextOnFocus
                                placeholderTextColor={theme.icon}
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
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 40,
        alignItems: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    form: {
        marginBottom: 20,
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
    },
    codeInput: {
        width: 45,
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 20,
        textAlign: 'center',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    activateButton: {
        width: 150,
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
        color: '#0E2B63',
        fontSize: 16,
        fontWeight: '500',
    },
});
