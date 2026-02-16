import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import ScreenHeader from '@/components/ScreenHeader';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');



    const handleUpdate = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Missing Fields', 'Please fill in all fields.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }
        Alert.alert('Success', 'Password updated successfully.');
        router.back();
    };

    const handleForgotPassword = () => {
        Alert.alert('Forgot Password', 'Navigate to forgot password flow.');
    };

    return (
        <View style={styles.container}>
            <ScreenHeader
                title="Change Password"
                withSafeArea={false}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Current Password */}
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                />

                {/* New Password */}
                <Text style={styles.label}>New Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />

                {/* Confirm Password */}
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                {/* Update Button */}
                <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                    <Text style={styles.updateButtonText}>Update Password</Text>
                </TouchableOpacity>

                {/* Forgot Password Link */}
                <TouchableOpacity onPress={handleForgotPassword} style={styles.linkContainer}>
                    <Text style={styles.linkText}>Forgot Password?</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 16,
        color: '#333',
    },
    updateButton: {
        backgroundColor: '#00B1EB',
        width: 210,
        height: 43,
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 17,
        alignItems: 'center',
        marginTop: 32,
        shadowColor: '#00B1EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    linkContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    linkText: {
        color: '#00B1EB',
        fontSize: 16,
        fontWeight: '500',
    },
});
