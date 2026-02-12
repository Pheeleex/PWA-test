import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import ScreenHeader from '@/components/ScreenHeader';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const [image, setImage] = useState<string | null>('https://picsum.photos/200');

    const pickImage = async () => {
        Alert.alert(
            'Profile Picture',
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

    return (
        <View style={styles.container}>
            <ScreenHeader title="Profile" withSafeArea={false} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.headerSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.profileImage, styles.placeholderImage]}>
                                <Ionicons name="person" size={60} color="#ccc" />
                            </View>
                        )}
                        <View style={styles.editIcon}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.userName}>John Doe</Text>
                </View>

                <View style={styles.detailsContainer}>
                    <DetailItem label="Email" value="johndoe@example.com" />
                    <DetailItem label="User ID" value="USER-88392" />
                    <DetailItem label="Assigned Region" value="North-East District" />
                    <DetailItem label="Location" value="New York, NY" />
                    <DetailItem label="Status" value="Active" statusColor="#4CAF50" />
                </View>

            </ScrollView>
        </View>
    );
}

const DetailItem = ({ label, value, statusColor }: { label: string, value: string, statusColor?: string }) => (
    <View style={styles.detailItem}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, statusColor ? { color: statusColor, fontWeight: 'bold' } : null]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderImage: {
        backgroundColor: '#E0E0E0',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#00B1EB',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    detailsContainer: {
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        padding: 20,
    },
    detailItem: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        paddingBottom: 10,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});
