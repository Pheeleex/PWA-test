import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function OnboardingScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Onboarding Screen</Text>
            <Text>Step 1: Welcome</Text>
            <Text>Step 2: Features</Text>
            <Text>Step 3: Get Started</Text>
            <Button title="Skip" onPress={() => router.replace('/login')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
});
