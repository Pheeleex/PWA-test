import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, BackHandler, useColorScheme } from 'react-native';
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

    const [image, setImage] = useState<string | null>('https://picsum.photos/200');

    useEffect(() => {
        const onBackPress = () => {
            router.back();
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [router]);

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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader title="Profile" withSafeArea={false} showBackButton={true} />
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.headerSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.profileImage} />
                        ) : (
                            <View style={[styles.profileImage, styles.placeholderImage, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#E0E0E0' }]}>
                                <Ionicons name="person" size={60} color={theme.icon} />
                            </View>
                        )}
                        <View style={styles.editIcon}>
                            <Ionicons name="camera" size={20} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.userName, { color: theme.text }]}>John Doe</Text>
                </View>

                <View style={[styles.detailsContainer, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F9F9F9' }]}>
                    <DetailItem label="Email" value="johndoe@example.com" theme={theme} />
                    <DetailItem label="User ID" value="USER-88392" theme={theme} />
                    <DetailItem label="Assigned Region" value="North-East District" theme={theme} />
                    <DetailItem label="Location" value="New York, NY" theme={theme} />
                    <DetailItem label="Status" value="Active" statusColor="#4CAF50" theme={theme} />
                </View>

            </ScrollView>
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
});
