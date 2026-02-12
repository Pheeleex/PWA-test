import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomDrawerContent(props: any) {
    const insets = useSafeAreaInsets();

    return (
        <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: insets.top }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => props.navigation.closeDrawer()} style={styles.closeButton}>
                    <Ionicons name="close" size={30} color="#000" />
                </TouchableOpacity>
            </View>
            <DrawerItemList {...props} />
        </DrawerContentScrollView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-start', // Drawer is on right, so "start" is left side of drawer? 
        // Wait, if drawer is on right, content slides in from right. 
        // "Close" is requested "at the top right (since drawer is on right... or top left?)"
        // User guideline: "Add x close icon to drawer"
        // If drawer is right-side, standard close X is usually Top-Right (inside) or Top-Left (outside/edge).
        // Let's put it Top-Left of the drawer content so it's easily accessible near the screen edge.
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    closeButton: {
        padding: 5,
    },
});
