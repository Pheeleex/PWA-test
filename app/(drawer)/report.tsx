import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import ScreenHeader from '@/components/ScreenHeader';
import CustomAlert from '@/components/CustomAlert';
import { useRouter, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';

const incidentCategories = [
    { label: 'Accident', value: 'accident' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Security', value: 'security' },
    { label: 'Other', value: 'other' },
];

import { useLocalSearchParams } from 'expo-router';

export default function ReportScreen() {
    const router = useRouter();
    const navigation = useNavigation<DrawerNavigationProp<any>>();
    const params = useLocalSearchParams();
    const showBack = !!params.ref;
    const isFromLogin = params.ref === 'login';
    const [category, setCategory] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isFocus, setIsFocus] = useState(false);
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
                router.push('/(drawer)/home');
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



    const handleSubmit = () => {
        if (!category) {
            showAlert('Missing Information', 'Please select an issue category.', 'error');
            return;
        }
        showAlert('Report Submitted', 'Your incident report has been submitted successfully.', 'success');
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
        <View style={styles.container}>
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

                {/* Issue Category */}
                <Text style={styles.label}>Issue Category</Text>
                <Dropdown
                    style={[styles.dropdown, isFocus && { borderColor: '#00B1EB' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={incidentCategories}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Select Category' : '...'}
                    searchPlaceholder="Search..."
                    value={category}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                        setCategory(item.value);
                        setIsFocus(false);
                    }}
                />

                {/* Description */}
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.inputContainer, styles.textArea]}
                    placeholder="Describe the incident..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={4}
                    value={description}
                    onChangeText={setDescription}
                    textAlignVertical="top"
                />

                {/* Upload Photo */}
                <Text style={styles.label}>Upload Photo</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 12 }} resizeMode="cover" />
                    ) : (
                        <>
                            <Ionicons name="camera-outline" size={32} color="#0E2B63" />
                            <Text style={styles.uploadText}>Tap to upload photo</Text>
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    dropdown: {
        height: 50,
        borderRadius: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    placeholderStyle: {
        fontSize: 16,
        color: '#999',
    },
    selectedTextStyle: {
        fontSize: 16,
        color: '#333',
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    inputText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        color: '#999',
    },
    textArea: {
        height: 120,
        alignItems: 'flex-start',
    },
    uploadButton: {
        height: 150,
        backgroundColor: '#F0F8FF',
        borderRadius: 17,
        borderWidth: 2,
        borderColor: '#0E2B63',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    uploadText: {
        marginTop: 8,
        fontSize: 16,
        color: '#0E2B63',
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
