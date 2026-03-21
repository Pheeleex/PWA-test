import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
    initialRouteName: 'map',
};

export default function DrawerLayout() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="light" />
            <Drawer
                initialRouteName="map"
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={({ navigation }) => ({
                    drawerType: 'front', // Make drawer act like a modal
                    drawerPosition: 'right', // Open from right
                    headerStyle: {
                        backgroundColor: '#0E2B63',
                        height: 110, // Increased height for padding
                    },
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.navigate('map')} style={{ marginBottom: 10 }}>
                            <Image
                                source={require('@/assets/images/Logo.png')}
                                style={{ width: 30, height: 30, marginLeft: 16, resizeMode: 'contain' }}
                            />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.toggleDrawer()}
                            style={{ marginRight: 16, marginBottom: 10 }}
                        >
                            <Ionicons name="menu" size={28} color="#fff" />
                        </TouchableOpacity>
                    ),
                    headerTitle: '',
                    drawerStyle: { width: '75%', backgroundColor: theme.background },
                    drawerActiveTintColor: theme.tint,
                    drawerInactiveTintColor: theme.text,
                    drawerItemStyle: {
                        backgroundColor: colorScheme === 'dark' ? '#333' : '#D9D9D9A1',
                        borderRadius: 25,
                        marginBottom: 8,
                        marginHorizontal: 12,
                        paddingVertical: 0,
                        paddingHorizontal: 10,
                        justifyContent: 'center'
                    },
                    drawerLabelStyle: {
                        marginLeft: 0,
                        fontSize: 14,
                        fontWeight: '500',
                    }
                })}
            >
                <Drawer.Screen
                    name="map"
                    options={{
                        drawerLabel: 'Map View',
                        title: 'Promolocation',
                        drawerItemStyle: { display: 'none' }
                    }}
                />
                <Drawer.Screen
                    name="report"
                    options={{
                        drawerLabel: 'Report Incident',
                        title: 'Report Incident',
                        drawerItemStyle: { display: 'none' }
                    }}
                />
                <Drawer.Screen
                    name="incidents"
                    options={{
                        drawerLabel: 'View Incidents',
                        title: 'Incidents',
                        drawerItemStyle: { display: 'none' }
                    }}
                />
                <Drawer.Screen
                    name="profile"
                    options={{
                        drawerLabel: 'Profile',
                        title: 'Profile',
                        drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={'#747474'} />,
                        drawerLabelStyle: { color: theme.icon2, marginLeft: 0, fontSize: 14, fontWeight: '500' }
                    }}
                />
                <Drawer.Screen
                    name="settings"
                    options={{
                        drawerLabel: 'Settings',
                        title: 'Settings',
                        drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={'#747474'} />,
                        drawerLabelStyle: { color: theme.icon2, marginLeft: 0, fontSize: 14, fontWeight: '500' }
                    }}
                />
                <Drawer.Screen
                    name="change-password"
                    options={{
                        drawerLabel: 'Change Password',
                        title: 'Change Password',
                        drawerItemStyle: { display: 'none' }, // Hidden from menu
                    }}
                />
                <Drawer.Screen
                    name="qr-code"
                    options={{
                        drawerLabel: 'Scan QR',
                        title: 'Scan QR',
                        drawerItemStyle: { display: 'none' }
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
