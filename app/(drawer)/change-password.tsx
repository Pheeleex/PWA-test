import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '@/components/ScreenHeader';
import CustomAlert from '@/components/CustomAlert';

import { useLocalSearchParams } from 'expo-router';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const showBack = !!params.ref;
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        if (alertConfig.type === 'success' && alertConfig.title !== 'Forgot Password') {
            router.back();
        } else if (alertConfig.title === 'Forgot Password') {
            // Navigate to forgot password flow if needed
            router.push('/forgot-password');
        }
    };



    const handleUpdate = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            showAlert('Missing Fields', 'Please fill in all fields.', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showAlert('Error', 'New passwords do not match.', 'error');
            return;
        }
        showAlert('Success', 'Password updated successfully.', 'success');
    };

    const handleForgotPassword = () => {
        router.push('/forgot-password');
    };

    return (
        <View style={styles.container}>
            <ScreenHeader
                title="Change Password"
                withSafeArea={false}
                showBackButton={showBack}
                onBack={showBack ? () => router.navigate('/(drawer)/settings') : undefined}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Current Password */}
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Enter current password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showCurrentPassword}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                        <Ionicons
                            name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>

                {/* New Password */}
                <Text style={styles.label}>New Password</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Enter new password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showNewPassword}
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                        <Ionicons
                            name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>

                {/* Confirm Password */}
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Confirm new password"
                        placeholderTextColor="#999"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity
                        style={styles.eyeIcon}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        <Ionicons
                            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>

                {/* Update Button */}
                <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                    <Text style={styles.updateButtonText}>Update Password</Text>
                </TouchableOpacity>

                {/* Forgot Password Link */}
                <TouchableOpacity onPress={handleForgotPassword} style={styles.linkContainer}>
                    <Text style={styles.linkText}>Forgot Password?</Text>
                </TouchableOpacity>

            </ScrollView>
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
        borderWidth: 1,
        borderColor: '#E0E0E0',
        fontSize: 16,
        color: '#333',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    passwordInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        height: '100%',
    },
    eyeIcon: {
        padding: 4,
    },
    updateButton: {
        backgroundColor: '#0E2B63',
        width: 210,
        height: 43,
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: 17,
        alignItems: 'center',
        marginTop: 32,
        shadowColor: '#0E2B63',
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
