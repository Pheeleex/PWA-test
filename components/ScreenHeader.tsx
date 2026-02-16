import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenHeaderProps {
    title: string;
    onBack?: () => void;
    withSafeArea?: boolean;
}

export default function ScreenHeader({ title, onBack, withSafeArea = true }: ScreenHeaderProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View style={[styles.container, withSafeArea && { paddingTop: insets.top }]}>
            <View style={styles.content}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#0E2B63" />
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.placeholder} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
    },
    content: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    backButton: {
        padding: 8,
    },
    title: {
        color: '#0E2B63',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    placeholder: {
        width: 40, // Match back button width for centering
    },
});
