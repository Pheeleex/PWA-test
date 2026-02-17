import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    // Status can be 'active', 'transit', or 'nogo'
    const [status, setStatus] = useState<'active' | 'transit' | 'nogo'>('active');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#50AF47'; // Green
            case 'transit': return '#FFBF00'; // Amber
            case 'nogo': return '#FF3B30'; // Red
            default: return '#50AF47';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active': return 'Activation Zone';
            case 'transit': return 'Transit Zone';
            case 'nogo': return 'No Go Zone';
            default: return 'Activation Zone';
        }
    };

    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
            {/* Status Bar */}
            <View style={[styles.statusBar, { backgroundColor: getStatusColor(status) }]}>
                <Image
                    source={require('@/assets/images/home_target.png')}
                    style={styles.targetImage}
                />
                <View>
                    <Text style={styles.statusText}>
                        You are in an {getStatusText(status)}
                    </Text>
                    <Text style={styles.subStatusText}>
                        Current Status: Compliant
                    </Text>
                </View>
            </View>

            <View style={styles.content}>

                {/* Cards */}
                <View style={styles.cardsContainer}>
                    <View style={[styles.card, { backgroundColor: '#EEEBF3' }]}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="globe-outline" size={32} color="#0E2B63" />
                        </View>
                        <Text style={styles.cardTitle}>City/Region</Text>
                        <Text style={[styles.cardValue, { color: theme.text }]}>North-West</Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: '#E8F3E7' }]}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="location-outline" size={32} color="#0E2B63" />
                        </View>
                        <Text style={styles.cardTitle}>Location</Text>
                        <Text style={[styles.cardValue, { color: theme.text }]}>Lagos, NG</Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: '#FDF4E2' }]}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="person-outline" size={32} color="#0E2B63" />
                        </View>
                        <Text style={styles.cardTitle}>Role</Text>
                        <Text style={[styles.cardValue, { color: theme.text }]}>Field Agent</Text>
                    </View>
                </View>

                {/* Proceed Button */}
                <TouchableOpacity
                    style={styles.proceedButton}
                    onPress={() => router.push('/(drawer)/map')}
                >
                    <Text style={styles.proceedButtonText}>Proceed to Map</Text>
                    {/* <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} /> */}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    statusBar: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginVertical: 30,
        marginHorizontal: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16
    },
    targetImage: {
        width: 40,
        height: 40,
        marginRight: 10,
        resizeMode: 'contain',
    },
    statusText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    subStatusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'left',
    },
    content: {
        padding: 20,
        paddingBottom: 40, // Ensure content is above Android bottom navigation
        alignItems: 'center',
    },

    cardsContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: 40,
        gap: 16,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        width: '45%',
        alignItems: 'center',
        shadowColor: '#D1D1D1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 10,
    },
    iconContainer: {
        // backgroundColor: '#E6F0FF',
        padding: 10,
        borderRadius: 50,
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 14,
        color: '#00B1EB',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    proceedButton: {
        flexDirection: 'row',
        width: 210,
        height: 43,
        justifyContent: 'center',
        backgroundColor: '#0E2B63',
        borderRadius: 17,
        alignItems: 'center',
        shadowColor: '#0E2B63',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        marginTop: 'auto', // Pushes to bottom if space allows
    },
    proceedButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
