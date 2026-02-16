import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'code'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');

    const handleSendCode = () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }
        // Mock sending code
        Alert.alert('Verification Code Sent', `A verification code has been sent to ${email}.`);
        setStep('code');
    };

    const handleVerifyCode = () => {
        if (!code) {
            Alert.alert('Error', 'Please enter the verification code.');
            return;
        }
        // Mock verification
        Alert.alert('Verified!', 'Your email has been verified.', [
            { text: 'OK', onPress: () => router.replace('/login') }
        ]);
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title={step === 'email' ? 'Forgot Password' : 'Verify Code'} withSafeArea={true} />
            <View style={styles.content}>

                {step === 'email' ? (
                    <>
                        <Text style={styles.description}>
                            Enter your email address and we'll send you a verification code.
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="name@example.com"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleSendCode}>
                            <Text style={styles.buttonText}>Send Verification Code</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.description}>
                            Please enter the verification code sent to {email}.
                        </Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Verification Code</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="123456"
                                placeholderTextColor="#999"
                                value={code}
                                onChangeText={setCode}
                                keyboardType="number-pad"
                            />
                        </View>

                        <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
                            <Text style={styles.buttonText}>Verify</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setStep('email')} style={styles.backButton}>
                            <Text style={styles.backButtonText}>Wrong email? Change it</Text>
                        </TouchableOpacity>
                    </>
                )}
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
        padding: 24,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 32,
        lineHeight: 24,
    },
    inputContainer: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    button: {
        backgroundColor: '#00B1EB',
        width: 280,
        height: 43,
        alignSelf: 'center',
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#00B1EB',
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
    backButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#00B1EB',
        fontSize: 16,
    },
});
