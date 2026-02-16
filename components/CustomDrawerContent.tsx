import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, TouchableOpacity, StyleSheet, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import CustomAlert from '@/components/CustomAlert';

export default function CustomDrawerContent(props: any) {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [alertVisible, setAlertVisible] = useState(false);

    const handleLogout = () => {
        setAlertVisible(true);
    };

    const confirmLogout = () => {
        setAlertVisible(false);
        router.replace('/login');
    };

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: insets.top }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => props.navigation.closeDrawer()} style={styles.closeButton}>
                    <Ionicons name="close" size={30} color="#000" />
                </TouchableOpacity>
            </View>
            <DrawerItemList {...props} />
            <View style={styles.footer}>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <CustomAlert
                visible={alertVisible}
                title="Confirm Logout"
                message="Are you sure you want to log out?"
                type="warning"
                onClose={() => setAlertVisible(false)}
                showCancel={true}
                confirmText="Yes"
                cancelText="Cancel"
                onConfirm={confirmLogout}
            />
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Close button on the right
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    closeButton: {
        padding: 5,
    },
    footer: {
        marginTop: 'auto',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#f4f4f4',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutText: {
        marginLeft: 16,
        fontSize: 16,
        fontWeight: '500',
        color: '#FF3B30',
    },
});
