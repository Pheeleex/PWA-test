import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, BackHandler, useColorScheme, Modal, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import ScreenHeader from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

import { useAuth } from '@/context';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, updateProfile } = useAuth();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const [fullname, setFullname] = useState(user?.fullname || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [image, setImage] = useState<string | null>(user?.avatar || null);
    const [pendingImage, setPendingImage] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    useEffect(() => {
        if (user) {
            setFullname(user.fullname);
            setPhone(user.phone);
            if (user.avatar) setImage(user.avatar);
        }
    }, [user]);

    useEffect(() => {
        const onBackPress = () => {
            if (modalVisible) {
                setModalVisible(false);
                return true;
            }
            router.back();
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [router, modalVisible]);

    const handleSave = async () => {
        if (!fullname || !phone) {
            Alert.alert('Error', 'Full Name and Phone Number are required.');
            return;
        }

        try {
            // Pass the pending image as well
            await updateProfile({ fullname, phone }, pendingImage);
            setPendingImage(null); // Clear pending state after success
            Alert.alert('Success', 'Profile updated successfully.');
        } catch (error: any) {
            Alert.alert('Error', error.msg || error.message || 'Failed to update profile.');
        }
    };

    const pickImage = async () => {
        Alert.alert(
            'Change Profile Picture',
            'Choose an option',
            [
                {
                    text: 'Camera',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestCameraPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permission denied', 'Camera permission is required.');
                            return;
                        }
                        const result = await ImagePicker.launchCameraAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 1,
                        });
                        if (!result.canceled) {
                            setPendingImage(result.assets[0].uri);
                        }
                    },
                },
                {
                    text: 'Gallery',
                    onPress: async () => {
                        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                        if (status !== 'granted') {
                            Alert.alert('Permission denied', 'Gallery permission is required.');
                            return;
                        }
                        const result = await ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 1,
                        });
                        if (!result.canceled) {
                            setPendingImage(result.assets[0].uri);
                        }
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };


    const currentDisplayImage = pendingImage && pendingImage !== 'delete' ? pendingImage : (pendingImage === 'delete' ? null : image);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader title="Profile" withSafeArea={false} showBackButton={true} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.headerSection}>
                    <View style={styles.imageContainer}>
                        <TouchableOpacity onPress={() => currentDisplayImage && setModalVisible(true)} disabled={!currentDisplayImage}>
                            {currentDisplayImage ? (
                                <Image source={{ uri: currentDisplayImage }} style={styles.profileImage} />
                            ) : (
                                <View style={[styles.profileImage, styles.placeholderImage, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#E0E0E0' }]}>
                                    <Ionicons name="person" size={60} color={theme.icon} />
                                </View>
                            )}
                        </TouchableOpacity>

                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity onPress={pickImage} style={[styles.actionButton, styles.editButton]}>
                                <Ionicons name="camera" size={18} color="#fff" />
                            </TouchableOpacity>

                        </View>
                    </View>
                    <Text style={[styles.userIdText, { color: theme.text }]}>{user?.fullname || 'Promoter'}</Text>
                    {/*<Text style={[styles.roleText, { color: theme.icon }]}>{user?.user_role?.toUpperCase()}</Text>*/}
                    {pendingImage && (
                        <View style={styles.pendingBadge}>
                            <Text style={styles.pendingText}>Unsaved Changes</Text>
                        </View>
                    )}
                </View>

                <View style={[styles.detailsContainer, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F9F9F9' }]}>
                    {/* Read-only field Example */}
                    <View style={[styles.detailItem, styles.readOnlyItem, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#EAEAEA' }]}>
                        <View style={styles.labelRow}>
                            <Text style={[styles.label, { color: theme.icon }]}>Promoter ID</Text>
                            <Ionicons name="lock-closed" size={14} color={theme.icon} style={{ marginLeft: 4 }} />
                        </View>
                        <Text style={[styles.value, { color: theme.icon }]}>{user?.promoter_id || ''}</Text>
                    </View>

                    {user?.promo_code && (
                        <View style={[styles.detailItem, styles.readOnlyItem, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#EAEAEA' }]}>
                            <View style={styles.labelRow}>
                                <Text style={[styles.label, { color: theme.icon }]}>Promo Code</Text>
                                <Ionicons name="pricetag" size={14} color={theme.icon} style={{ marginLeft: 4 }} />
                            </View>
                            <Text style={[styles.value, { color: theme.icon }]}>{user.promo_code}</Text>
                        </View>
                    )}

                    <View style={styles.editItem}>
                        <Text style={[styles.label, { color: theme.icon }]}>Full Name</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderBottomColor: '#00B1EB' }]}
                            value={fullname}
                            onChangeText={setFullname}
                            placeholder="Enter your full name"
                            placeholderTextColor={theme.icon}
                        />
                    </View>

                    <View style={styles.editItem}>
                        <Text style={[styles.label, { color: theme.icon }]}>Phone Number</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderBottomColor: '#00B1EB' }]}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Enter your phone number"
                            placeholderTextColor={theme.icon}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={[styles.detailItem, styles.readOnlyItem, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#EAEAEA' }]}>
                        <View style={styles.labelRow}>
                            <Text style={[styles.label, { color: theme.icon }]}>Status</Text>
                            <Ionicons name="lock-closed" size={14} color={theme.icon} style={{ marginLeft: 4 }} />
                        </View>
                        <Text style={[styles.value, { color: user?.active ? '#4CAF50' : '#F44336' }]}>{user?.active ? 'Active' : 'Inactive'}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.updateButton} onPress={handleSave}>
                    <Text style={styles.updateButtonText}>Update Profile</Text>
                </TouchableOpacity>

            </ScrollView>

            <Modal
                visible={modalVisible}
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
                animationType="fade"
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Ionicons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                    {image && (
                        <Image
                            source={{ uri: image }}
                            style={styles.fullImage}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 16,
        alignItems: 'center',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderImage: {
        // backgroundColor handled inline
    },
    actionButtonsContainer: {
        position: 'absolute',
        bottom: 0,
        right: -10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    editButton: {
        backgroundColor: '#00B1EB',
    },
    userIdText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    detailsContainer: {
        borderRadius: 12,
        padding: 20,
    },
    detailItem: {
        marginBottom: 20,
        borderBottomWidth: 1,
        paddingBottom: 10,
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '100%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1,
        padding: 10,
    },
    pendingBadge: {
        backgroundColor: '#FF9500',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    pendingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    editItem: {
        marginBottom: 20,
    },
    readOnlyItem: {
        backgroundColor: '#F0F0F0',
        padding: 12,
        borderRadius: 8,
        borderBottomWidth: 0,
        opacity: 0.8,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    input: {
        fontSize: 16,
        fontWeight: '500',
        borderBottomWidth: 1,
        height: 40,
        paddingVertical: 5,
    },
    updateButton: {
        backgroundColor: '#0E2B63',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
