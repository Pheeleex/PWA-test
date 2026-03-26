import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, BackHandler, useColorScheme, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import ScreenHeader from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

export default function ProfileScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const userId = 'USER-88392';

    const [image, setImage] = useState<string | null>('https://picsum.photos/200');
    const [modalVisible, setModalVisible] = useState(false);

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
                            setImage(result.assets[0].uri);
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
                            setImage(result.assets[0].uri);
                        }
                    },
                },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const deleteImage = () => {
        Alert.alert(
            'Delete Profile Picture',
            'Are you sure you want to remove your profile picture?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => setImage(null),
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader title="Profile" withSafeArea={false} showBackButton={true} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.headerSection}>
                    <View style={styles.imageContainer}>
                        <TouchableOpacity onPress={() => image && setModalVisible(true)} disabled={!image}>
                            {image ? (
                                <Image source={{ uri: image }} style={styles.profileImage} />
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
                            {image && (
                                <TouchableOpacity onPress={deleteImage} style={[styles.actionButton, styles.deleteButton]}>
                                    <Ionicons name="trash" size={18} color="#fff" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <Text style={[styles.userIdText, { color: theme.text }]}>{userId}</Text>
                </View>

                <View style={[styles.detailsContainer, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F9F9F9' }]}>
                    <DetailItem label="User ID" value={userId} theme={theme} />
                </View>

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

const DetailItem = ({ label, value, statusColor, theme }: { label: string, value: string, statusColor?: string, theme: any }) => (
    <View style={[styles.detailItem, { borderBottomColor: theme.background === '#151718' ? '#333' : '#EEE' }]}>
        <Text style={[styles.label, { color: theme.icon }]}>{label}</Text>
        <Text style={[styles.value, { color: statusColor || theme.text }, statusColor ? { fontWeight: 'bold' } : null]}>{value}</Text>
    </View>
);

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
    deleteButton: {
        backgroundColor: '#FF3B30',
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
});
