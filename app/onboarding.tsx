import { ThemedText } from '@/components/themed-text';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    View,
    useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --------------------------------------------------------
// DATA
// --------------------------------------------------------
const slides = [
    {
        id: '1',
        title: 'Welcome to Promolocation',
        subtitle: 'Your Intelligent Field Companion',
        description: 'Helping you connect with customer, optimize routes, and ensure compliance, effortleslly.',
        image: require('@/assets/images/onboarding-1.png'),
        backgroundColor: '#0E2B63',
    },
    {
        id: '2',
        title: 'Navigate with Confidence ',
        subtitle: 'Activation Zones',
        description: 'We’ll guide you to designated with “Activation Zones” and keep you informed of your real-time compliance status.',
        image: require('@/assets/images/onboarding-2.png'),
        backgroundColor: '#0E2B63',
    },
    {
        id: '3',
        title: 'Smart Route, Better Result',
        subtitle: 'Plan Your Perfect Day ',
        description: 'Access real-time maps, and efficiently plan your visits for maximum impact.',
        image: require('@/assets/images/onboarding-3.png'),
        backgroundColor: '#0E2B63',
    },
];

// --------------------------------------------------------
// COMPONENTS
// --------------------------------------------------------

function OnboardingItem({ item }: { item: typeof slides[0] }) {
    const { width } = useWindowDimensions();

    return (
        <View style={[styles.itemContainer, { width, backgroundColor: item.backgroundColor }]}>
            <Image
                source={item.image}
                style={[styles.image, { width: width - 80, resizeMode: 'contain' }]}
            />
            <View style={styles.textContainer}>
                <ThemedText type="title" style={styles.title}>
                    {item.title}
                </ThemedText>

                {/* Modified Subtitle for checking id '2' */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>

                    <ThemedText style={[styles.subtitle, { marginBottom: 0 }]}>
                        {item.subtitle}
                    </ThemedText>
                    {item.id === '2' && (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#50AF47', marginLeft: 6 }} />
                    )}
                </View>

                <ThemedText style={styles.description}>{item.description}</ThemedText>
            </View>
        </View>
    );
}

function Paginator({ data, scrollX }: { data: typeof slides; scrollX: Animated.Value }) {
    const { width } = useWindowDimensions();

    return (
        <View style={styles.paginatorContainer}>
            {data.map((_, i) => {
                const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

                // Active dot should not be wider (kept constant 10)
                const dotWidth = scrollX.interpolate({
                    inputRange,
                    outputRange: [10, 10, 10],
                    extrapolate: 'clamp',
                });

                const opacity = scrollX.interpolate({
                    inputRange,
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                });

                // Active color #00B1EB, inactive white
                const backgroundColor = scrollX.interpolate({
                    inputRange,
                    outputRange: ['#FFFFFF', '#00B1EB', '#FFFFFF'],
                    extrapolate: 'clamp'
                });

                return (
                    <Animated.View
                        style={[
                            styles.dot,
                            { width: dotWidth, opacity, backgroundColor }
                        ]}
                        key={i.toString()}
                    />
                );
            })}
        </View>
    );
}

// --------------------------------------------------------
// MAIN SCREEN
// --------------------------------------------------------

export default function OnboardingScreen() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef<FlatList>(null);

    const viewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const scrollToNext = () => {
        if (currentIndex < slides.length - 1) {
            slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
        } else {
            router.replace('/login');
        }
    };

    const handleSkip = () => {
        router.replace('/login');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.header}>
                {/* Skip Button (only if not on last slide) */}
                {currentIndex < slides.length - 1 ? (
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <ThemedText style={styles.skipText}>Skip</ThemedText>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.skipSpace} />
                )}
            </View>

            <View style={styles.slidesListContainer}>
                <FlatList
                    data={slides}
                    renderItem={({ item }) => <OnboardingItem item={item} />}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                        useNativeDriver: false,
                    })}
                    scrollEventThrottle={32}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>

            <Paginator data={slides} scrollX={scrollX} />

            <View style={styles.footer}>
                {/*  Get Started Button */}
                <TouchableOpacity onPress={handleSkip} style={styles.nextButton}>
                    <ThemedText style={styles.nextButtonText}>
                        Get Started
                    </ThemedText>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0E2B63',
    },
    header: {
        width: '100%',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        height: 50,
        justifyContent: 'center',
    },
    slidesListContainer: {
        flex: 3,
    },
    itemContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    image: {
        flex: 0.7,
        justifyContent: 'center',
        marginBottom: 40,
    },
    textContainer: {
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 10,
        color: '#00B1EB',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8,
        color: '#FFFFFF',
    },
    description: {
        textAlign: 'center',
        color: '#FFFFFF',
        paddingHorizontal: 10,
    },
    paginatorContainer: {
        flexDirection: 'row',
        height: 64,
    },
    dot: {
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fff',
        marginHorizontal: 8,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 30,
        paddingBottom: 40,
        height: 80,
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        color: '#00B1EB',
        fontSize: 16,
    },
    skipSpace: {
        width: 60,
    },
    nextButton: {
        backgroundColor: '#fff',
        width: 210,
        height: 43,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 17,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        alignSelf: 'center',
    },
    nextButtonText: {
        color: '#0E2B63',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
