import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');

    const handleSendCode = () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }
        // Mock sending code
        Alert.alert(
            'Verification Code Sent',
            `A verification code has been sent to ${email}.`,
            [
                {
                    text: 'OK',
                    onPress: () => router.push('/activation')
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Forgot Password" withSafeArea={true} />
            <View style={styles.content}>
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
                    <Text style={styles.buttonText}>Send</Text>
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
