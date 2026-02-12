import { useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login Screen</Text>
            <Button title="Login" onPress={() => router.replace('/(drawer)/home')} />
            <Button title="Forgot Password" onPress={() => router.push('/forgot-password')} />
            <Button title="Activate Account" onPress={() => router.push('/activation')} />
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
