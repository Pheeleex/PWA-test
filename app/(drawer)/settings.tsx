import { StyleSheet, Text, View, TouchableOpacity, ScrollView, BackHandler, useColorScheme, Image, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import ScreenHeader from '@/components/ScreenHeader';
import { Colors } from '@/constants/theme';
import { useAuth, useApi } from '@/context';


export default function SettingsScreen() {
    const router = useRouter();
    const { pushEnabled, toggleNotifications } = useAuth();
    const { savePushToken } = useApi();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const menuItems = [
        {
            id: 'password',
            title: 'Change Password',
            image: require('@/assets/images/changepassword.png'),
            route: '/(drawer)/change-password?ref=settings',
        },
        // {
        //     id: 'report',
        //     title: 'Report Incident',
        //     image: require('@/assets/images/reportincident.png'),
        //     route: '/(drawer)/report?ref=settings',
        // },
        // {
        //     id: 'history',
        //     title: 'Incident History',
        //     image: require('@/assets/images/incidenthistory.png'),
        //     route: '/(drawer)/incidents?ref=settings',
        // },
    ];

    useEffect(() => {
        const onBackPress = () => {
            router.navigate('/(drawer)/map');
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [router]);

    const handlePress = (item: any) => {
        router.push(item.route as any);
    };

    const handleToggle = async (enabled: boolean) => {
        // toggleNotifications now owns the OS permission request:
        //   - turning ON  → requests OS permission; opens Settings if denied, bails out
        //   - turning OFF → saves preference, no redirect
        await toggleNotifications(enabled);

        // After the context updates pushEnabled, register and send the push
        // token to the server only if notifications ended up enabled.
        if (enabled) {
            try {
                const projectId =
                    Constants?.expoConfig?.extra?.eas?.projectId ??
                    Constants?.easConfig?.projectId;
                const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
                if (expoPushToken) {
                    await savePushToken(expoPushToken);
                }
            } catch (e) {
                console.warn("[Settings] Could not register push token:", e);
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader title="Settings" withSafeArea={false} showBackButton={true} onBack={() => router.navigate('/(drawer)/map')} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.listContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F5F5F5' }]}
                            onPress={() => handlePress(item)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#fff' }]}>
                                <Image source={item.image} style={styles.iconImage} resizeMode="cover" />
                            </View>
                            <Text style={[styles.menuItemText, { color: theme.text }]}>{item.title}</Text>
                            <Ionicons name="chevron-forward" size={20} color={theme.icon} />
                        </TouchableOpacity>
                    ))}

                    {/* Notifications Toggle */}
                    <View style={[styles.menuItem, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#F5F5F5', justifyContent: 'space-between' }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={[styles.iconContainer, { backgroundColor: '#fff' }]}>
                                <Ionicons name="notifications-outline" size={20} color="#0E2B63" />
                            </View>
                            <Text style={[styles.menuItemText, { color: theme.text }]}>Enable Notifications</Text>
                        </View>
                        <Switch
                            value={pushEnabled}
                            onValueChange={handleToggle}
                            trackColor={{ false: "#767577", true: "#81b0ff" }}
                            thumbColor={pushEnabled ? "#0E2B63" : "#f4f3f4"}
                        />
                    </View>
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
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 1.65,
        elevation: 3,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        overflow: 'hidden',
    },
    iconImage: {
        width: '50%',
        height: '50%',
    },
    menuItemText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
    },
});
