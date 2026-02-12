import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image, TouchableOpacity } from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CustomDrawerContent from '@/components/CustomDrawerContent';

export default function DrawerLayout() {
    const navigation = useNavigation();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={({ navigation }) => ({
                    drawerPosition: 'right',
                    headerStyle: { backgroundColor: '#0E2B63' },
                    headerTintColor: '#fff',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.navigate('home')}>
                            <Image
                                source={require('@/assets/images/Logo.png')}
                                style={{ width: 30, height: 30, marginLeft: 16, resizeMode: 'contain' }}
                            />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => navigation.toggleDrawer()}
                            style={{ marginRight: 16 }}
                        >
                            <Ionicons name="menu" size={28} color="#fff" />
                        </TouchableOpacity>
                    ),
                    headerTitle: '',
                    drawerStyle: { width: '50%' }, // Set drawer width to half screen
                })}
            >
                <Drawer.Screen
                    name="home"
                    options={{
                        drawerLabel: 'Home',
                        title: 'Promolocation',
                        drawerItemStyle: { display: 'none' }
                    }}
                />
                <Drawer.Screen
                    name="map"
                    options={{
                        drawerLabel: 'Map View',
                        title: 'Map',
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
                        drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
                    }}
                />
                <Drawer.Screen
                    name="settings"
                    options={{
                        drawerLabel: 'Settings',
                        title: 'Settings',
                        drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
