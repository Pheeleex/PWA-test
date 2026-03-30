import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Image, BackHandler, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import ScreenHeader from '@/components/ScreenHeader';
import CustomAlert from '@/components/CustomAlert';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/constants/theme';
import { useApi } from '@/context';

export default function ReportScreen() {
    const router = useRouter();
    const { submitReport } = useApi();
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const params = useLocalSearchParams();
    const showBack = !!params.ref;
    const isFromLogin = params.ref === 'login';
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
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
        if (alertConfig.type === 'success') {
            if (isFromLogin) {
                router.replace('/login');
            } else {
                router.replace('/(drawer)/map');
            }
        }
    };

    useEffect(() => {
        if (isFromLogin) {
            navigation.setOptions({
                swipeEnabled: false,
                headerShown: false,
                drawerItemStyle: { display: 'none' }
            });
        } else {
            navigation.setOptions({
                swipeEnabled: true,
                headerShown: true
            });
        }
    }, [isFromLogin, navigation]);

    useEffect(() => {
        const onBackPress = () => {
            if (isFromLogin) {
                router.replace('/login');
            } else if (params.ref === 'settings') {
                router.navigate('/(drawer)/settings');
            } else {
                router.back();
            }
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [router, isFromLogin, params.ref]);

    const handleSubmit = async () => {
        if (!description) {
            showAlert('Error', 'Please provide a description of the incident.', 'error');
            return;
        }

        try {
            await submitReport({
                title: 'User Reported Incident', // Placeholder title
                description,
                image: image || undefined,
            });
            showAlert('Report Submitted', 'Your incident report has been submitted successfully.', 'success');
        } catch (error: any) {
            showAlert('Error', error.message || 'Failed to submit report. Please try again.', 'error');
        }
    };

    const pickImage = async () => {
        Alert.alert('Upload Photo', 'Choose an option', [
            {
                text: 'Camera',
                onPress: async () => {
                    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
                    if (permissionResult.granted === false) {
                        Alert.alert('Permission to access camera is required!');
                        return;
                    }
                    const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [4, 3],
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
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [4, 3],
                        quality: 1,
                    });
                    if (!result.canceled) {
                        setImage(result.assets[0].uri);
                    }
                },
            },
            {
                text: 'Cancel',
                style: 'cancel',
            },
        ]);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader
                title="Report Incident"
                withSafeArea={isFromLogin}
                showBackButton={showBack}
                onBack={showBack ? () => {
                    if (isFromLogin) {
                        router.replace('/login');
                    } else if (params.ref === 'settings') {
                        router.navigate('/(drawer)/settings');
                    } else {
                        router.back();
                    }
                } : undefined}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Description */}
                <Text style={[styles.label, { color: theme.text }]}>Description</Text>
                <TextInput
                    style={[styles.inputContainer, styles.textArea, {
                        color: theme.text,
                        backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#fff'
                    }]}
                    placeholder="Describe the incident..."
                    placeholderTextColor={theme.icon}
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                    textAlignVertical="top"
                />

                {/* Upload Photo */}
                <Text style={[styles.label, { color: theme.text }]}>Upload Photo</Text>
                <TouchableOpacity style={[styles.uploadButton, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F0F8FF', borderColor: '#00B1EB' }]} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
                    ) : (
                        <>
                            <Ionicons name="camera-outline" size={32} color="#00B1EB" />
                            <Text style={[styles.uploadText, { color: '#00B1EB' }]}>Tap to upload photo</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit</Text>
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
    },
    scrollContent: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 16,
        color: '#0E2B63',
    },
    inputContainer: {
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#00B1EB', // Updated border color
        fontSize: 16,
    },
    textArea: {
        height: 120,
        alignItems: 'flex-start',
    },
    uploadButton: {
        height: 150,
        borderRadius: 17,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    uploadText: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#0E2B63',
        width: 210,
        height: 43,
        justifyContent: 'center',
        alignSelf: 'center', // Center the button since it has a fixed width
        borderRadius: 17,
        alignItems: 'center',
        shadowColor: '#0E2B63',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
