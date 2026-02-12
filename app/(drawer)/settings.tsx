import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenHeader from '@/components/ScreenHeader';

export default function SettingsScreen() {
    const router = useRouter();

    const menuItems = [
        {
            id: 'password',
            title: 'Change Password',
            icon: 'lock-closed-outline',
            route: '/(drawer)/change-password',
        },
        {
            id: 'report',
            title: 'Report Incident',
            icon: 'warning-outline',
            route: '/(drawer)/report',
        },
        {
            id: 'history',
            title: 'Incident History',
            icon: 'list-outline',
            route: '/(drawer)/incidents',
        },
    ];

    const handlePress = (item: any) => {
        if (item.isLogout) {
            router.replace(item.route);
        } else {
            router.push(item.route);
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Settings" withSafeArea={false} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.listContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={() => handlePress(item)}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name={item.icon as any} size={24} color="#0E2B63" />
                            </View>
                            <Text style={styles.menuItemText}>{item.title}</Text>
                            <Ionicons name="chevron-forward" size={20} color="#666" />
                        </TouchableOpacity>
                    ))}
                </View>
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
        flexGrow: 1,
        padding: 20,
    },
    listContainer: {
        marginTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    iconContainer: {
        marginRight: 16,
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
});
