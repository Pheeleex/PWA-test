import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, Modal, Image, TouchableWithoutFeedback } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '@/components/ScreenHeader';
import { useRouter, useLocalSearchParams } from 'expo-router';

// Mock Data
const MOCK_INCIDENTS = [
    {
        id: '1',
        title: 'Minor Accident',
        date: '2 hours ago',
        status: 'Pending',
        description: 'Two cars collided at the intersection. No injuries reported, but traffic is blocked.',
        image: 'https://picsum.photos/300/200?random=1',
    },
    {
        id: '2',
        title: 'Road Maintenance',
        date: '5 hours ago',
        status: 'In Progress',
        description: 'Road repair work ongoing near the city center. Expect delays.',
        image: 'https://picsum.photos/300/200?random=2',
    },
    {
        id: '3',
        title: 'Security Alert',
        date: '1 day ago',
        status: 'Resolved',
        description: 'Suspicious activity reported. Police investigated and cleared the area.',
        image: 'https://picsum.photos/300/200?random=3',
    },
    {
        id: '4',
        title: 'Traffic Light Failure',
        date: '2 days ago',
        status: 'Resolved',
        description: 'Traffic lights at Main St not working. Technician repaired it.',
        image: 'https://picsum.photos/300/200?random=4',
    },
];

export default function IncidentsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const showBack = !!params.ref;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIncident, setSelectedIncident] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);



    const filteredIncidents = MOCK_INCIDENTS.filter(incident =>
        incident.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Resolved': return '#E8F5E9'; // Light Green
            case 'In Progress': return '#FFF8E1'; // Light Amber
            case 'Pending': return '#FFEBEE'; // Light Red
            default: return '#F5F5F5';
        }
    };

    const getStatusTextColor = (status: string) => {
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
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={[styles.cardStatus, { color: getStatusTextColor(item.status) }]}>{item.status}</Text>
            </View>
            <Text style={styles.cardDate}>{item.date}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScreenHeader
                title="Incident History"
                withSafeArea={false}
                showBackButton={showBack}
                onBack={showBack ? () => router.navigate('/(drawer)/settings') : undefined}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search incidents..."
                    placeholderTextColor="#999"
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
                ListEmptyComponent={<Text style={styles.emptyText}>No incidents found.</Text>}
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
                        <View style={styles.modalView}>
                            <View style={styles.modalHeader}>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>

                            {selectedIncident && (
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalIncidentTitle}>{selectedIncident.title}</Text>
                                    <View style={styles.statusRow}>
                                        <Text style={[styles.statusBadge, {
                                            backgroundColor: getStatusColor(selectedIncident.status),
                                            color: getStatusTextColor(selectedIncident.status)
                                        }]}>
                                            {selectedIncident.status}
                                        </Text>
                                        <Text style={styles.modalDate}>{selectedIncident.date}</Text>
                                    </View>

                                    <Text style={styles.modalDescription}>{selectedIncident.description}</Text>

                                    {selectedIncident.image ? (
                                        <Image source={{ uri: selectedIncident.image }} style={styles.modalImage} resizeMode="cover" />
                                    ) : (
                                        <View style={styles.noImageContainer}>
                                            <Text style={styles.noImageText}>No image available</Text>
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
        backgroundColor: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
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
        color: '#333',
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
        color: '#333',
    },
    cardStatus: {
        fontSize: 14,
        fontWeight: '600',
    },
    cardDate: {
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: '#999',
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
        backgroundColor: 'white',
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
        color: '#0E2B63',
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
        color: '#666',
    },
    modalDescription: {
        fontSize: 16,
        color: '#444',
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
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: '#999',
    },
});
