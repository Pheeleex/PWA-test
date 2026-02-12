import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function DrawerLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer>
                <Drawer.Screen
                    name="home"
                    options={{
                        drawerLabel: 'Home',
                        title: 'Promolocation',
                    }}
                />
                <Drawer.Screen
                    name="map"
                    options={{
                        drawerLabel: 'Map View',
                        title: 'Map',
                    }}
                />
                <Drawer.Screen
                    name="report"
                    options={{
                        drawerLabel: 'Report Incident',
                        title: 'Report Incident',
                    }}
                />
                <Drawer.Screen
                    name="incidents"
                    options={{
                        drawerLabel: 'View Incidents',
                        title: 'Incidents',
                    }}
                />
                <Drawer.Screen
                    name="profile"
                    options={{
                        drawerLabel: 'Profile',
                        title: 'Profile',
                    }}
                />
                <Drawer.Screen
                    name="settings"
                    options={{
                        drawerLabel: 'Settings',
                        title: 'Settings',
                    }}
                />
            </Drawer>
        </GestureHandlerRootView>
    );
}
