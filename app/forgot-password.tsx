import { StyleSheet, Text, View } from 'react-native';

export default function ForgotPasswordScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Forgot Password Screen</Text>
            <Text>Enter your email to reset password.</Text>
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
