import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

interface ScreenHeaderProps {
    title: string;
    onBack?: () => void;
    withSafeArea?: boolean;
    showBackButton?: boolean;
}

export default function ScreenHeader({ title, onBack, withSafeArea = true, showBackButton = false }: ScreenHeaderProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View style={[
            styles.container,
            { backgroundColor: theme.background },
            withSafeArea && { paddingTop: insets.top }
        ]}>
            <View style={styles.content}>
                {showBackButton ? (
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.placeholder} />
                )}
                <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
                <View style={styles.placeholder} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // backgroundColor is set dynamically
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
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    placeholder: {
        width: 40, // Match back button width for centering
    },
});
