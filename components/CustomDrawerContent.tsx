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
        justifyContent: 'flex-end', // Close button on the right
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    closeButton: {
        padding: 5,
    },
});
