import { StyleSheet, Text, View, TextInput, TouchableOpacity, BackHandler, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';
import CustomAlert from '@/components/CustomAlert';
import { Colors } from '@/constants/theme';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const [userId, setUserId] = useState('');
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
        if (alertConfig.type === 'success') {
            router.push('/activation');
        }
    };

    const handleSendCode = () => {
        if (!userId) {
            showAlert('Error', 'Please enter your User ID.', 'error');
            return;
        }
        // Mock sending code
        showAlert('Verification Code Sent', `A verification code has been sent for User ID ${userId}.`, 'success');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader title="Forgot Password" withSafeArea={true} showBackButton={true} />
            <View style={styles.content}>
                <Text style={[styles.description, { color: theme.icon }]}>
                    Enter your User ID to receive a verification code.
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: theme.text }]}>User ID</Text>
                    <TextInput
                        style={[
                            styles.input,
                            {
                                color: theme.text,
                                backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#fff'
                            }
                        ]}
                        placeholder="Enter your User ID"
                        placeholderTextColor={theme.icon}
                        value={userId}
                        onChangeText={setUserId}
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSendCode}>
                    <Text style={styles.buttonText}>Send</Text>
                </TouchableOpacity>
            </View>
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
        padding: 24,
    },
    description: {
        fontSize: 16,
        marginBottom: 32,
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#00B1EB', // Updated border color
    },
    button: {
        backgroundColor: '#0E2B63',
        width: 210,
        height: 43,
        alignSelf: 'center',
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#0E2B63',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
