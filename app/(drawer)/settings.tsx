import { StyleSheet, Text, View, TouchableOpacity, ScrollView, BackHandler, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import ScreenHeader from '@/components/ScreenHeader';
import { Colors } from '@/constants/theme';

export default function SettingsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const menuItems = [
        {
            id: 'password',
            title: 'Change Password',
            icon: 'lock-closed-outline',
            route: '/(drawer)/change-password?ref=settings',
        },
        {
            id: 'report',
            title: 'Report Incident',
            icon: 'warning-outline',
            route: '/(drawer)/report?ref=settings',
        },
        {
            id: 'history',
            title: 'Incident History',
            icon: 'list-outline',
            route: '/(drawer)/incidents?ref=settings',
        },
    ];

    useEffect(() => {
        const onBackPress = () => {
            router.back();
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [router]);

    const handlePress = (item: any) => {
        if (item.isLogout) {
            router.replace(item.route);
        } else {
            router.push(item.route);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader title="Settings" withSafeArea={false} showBackButton={true} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.listContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F5F5F5' }]}
                            onPress={() => handlePress(item)}
                        >
                            <View style={styles.iconContainer}>
                                <Ionicons name={item.icon as any} size={24} color={theme.icon2} />
                            </View>
                            <Text style={[styles.menuItemText, { color: theme.text }]}>{item.title}</Text>
                            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
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
        fontWeight: '500',
    },
});
