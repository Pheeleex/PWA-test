import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Modal, Image, TouchableWithoutFeedback, BackHandler, useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useApi } from '@/context';

export default function IncidentsScreen() {
    const router = useRouter();
    const { incidents } = useApi();
    const params = useLocalSearchParams();
    const showBack = !!params.ref;
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIncident, setSelectedIncident] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const onBackPress = () => {
            if (showBack) {
                router.navigate('/(drawer)/settings');
            } else {
                router.back();
            }
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [router, showBack]);

    const filteredIncidents = incidents.filter(incident =>
        incident.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resolved': return colorScheme === 'dark' ? '#1B5E20' : '#E8F5E9'; // Green shade
            case 'In Progress': return colorScheme === 'dark' ? '#E65100' : '#FFF8E1'; // Amber shade
            case 'Pending': return colorScheme === 'dark' ? '#B71C1C' : '#FFEBEE'; // Red shade
            default: return colorScheme === 'dark' ? '#424242' : '#F5F5F5';
        }
    };

    const getStatusTextColor = (status: string) => {
        if (colorScheme === 'dark') return '#FFF';
        switch (status) {
            case 'Resolved': return '#2E7D32'; // Green
            case 'In Progress': return '#F57F17'; // Amber
            case 'Pending': return '#C62828'; // Red
            default: return '#757575';
        }
    };

    const handlePressItem = (item: any) => {
        setSelectedIncident(item);
        setModalVisible(true);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: getStatusColor(item.status) }]}
            onPress={() => handlePressItem(item)}
        >
            <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colorScheme === 'dark' ? '#FFF' : '#333' }]}>{item.title}</Text>
                <Text style={[styles.cardStatus, { color: getStatusTextColor(item.status) }]}>{item.status}</Text>
            </View>
            <Text style={[styles.cardDate, { color: colorScheme === 'dark' ? '#BBB' : '#666' }]}>{item.date}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader
                title="Incident History"
                withSafeArea={false}
                showBackButton={showBack}
                onBack={showBack ? () => router.navigate('/(drawer)/settings') : undefined}
            />

            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F5F5F5' }]}>
                <Ionicons name="search" size={20} color={theme.icon} style={styles.searchIcon} />
                <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search incidents..."
                    placeholderTextColor={theme.icon}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* List */}
            <FlatList
                data={filteredIncidents}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={[styles.emptyText, { color: theme.icon }]}>No incidents found.</Text>}
            />

            {/* Detail Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.centeredView}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <TouchableWithoutFeedback>
                        <View style={[styles.modalView, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : 'white' }]}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            {selectedIncident && (
                                <View style={styles.modalContent}>
                                    <Text style={[styles.modalIncidentTitle, { color: theme.text }]}>{selectedIncident.title}</Text>
                                    <View style={styles.statusRow}>
                                        <Text style={[styles.statusBadge, {
                                            backgroundColor: getStatusColor(selectedIncident.status),
                                            color: getStatusTextColor(selectedIncident.status)
                                        }]}>
                                            {selectedIncident.status}
                                        </Text>
                                        <Text style={[styles.modalDate, { color: theme.icon }]}>{selectedIncident.date}</Text>
                                    </View>

                                    <Text style={[styles.modalDescription, { color: theme.text }]}>{selectedIncident.description}</Text>

                                    {selectedIncident.image ? (
                                        <Image source={{ uri: selectedIncident.image }} style={styles.modalImage} resizeMode="cover" />
                                    ) : (
                                        <View style={[styles.noImageContainer, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F0F0F0' }]}>
                                            <Text style={[styles.noImageText, { color: theme.icon }]}>No image available</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 20,
        paddingHorizontal: 12,
        borderRadius: 8,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    card: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        // Shadow for depth
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2.22,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardStatus: {
        fontSize: 14,
        fontWeight: '600',
    },
    cardDate: {
        fontSize: 14,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
    // Modal Styles
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '90%',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'flex-end', // Align close button to the right
        alignItems: 'center',
        marginBottom: 10,
    },

    modalContent: {
        alignItems: 'flex-start',
    },
    modalIncidentTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        width: '100%',
        justifyContent: 'space-between',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        fontSize: 14,
        fontWeight: 'bold',
        overflow: 'hidden',
    },
    modalDate: {
        fontSize: 14,
    },
    modalDescription: {
        fontSize: 16,
        marginBottom: 20,
        lineHeight: 24,
    },
    modalImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    noImageContainer: {
        width: '100%',
        height: 150,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
    },
});
