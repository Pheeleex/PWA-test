import { StyleSheet, Text, View } from 'react-native';

export default function ActivationScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Activation Page</Text>
            <Text>Enter activation code.</Text>
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
