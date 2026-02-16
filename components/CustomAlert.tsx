import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
    showCancel?: boolean;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
}

const { width } = Dimensions.get('window');

export default function CustomAlert({
    visible,
    title,
    message,
    type,
    onClose,
    showCancel = false,
    confirmText = 'Yes',
    cancelText = 'Cancel',
    onConfirm
}: CustomAlertProps) {
    const scaleValue = useRef(new Animated.Value(0)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    useNativeDriver: true,
                    speed: 20,
                    bounciness: 10,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.timing(opacityValue, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }).start();
            scaleValue.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    const isSuccess = type === 'success';
    const isError = type === 'error';
    const isWarning = type === 'warning';

    let iconName: any = 'checkmark-circle';
    let iconColor = '#4CAF50';
    let buttonColor = '#4CAF50';

    if (isError) {
        iconName = 'alert-circle';
        iconColor = '#FF3B30';
        buttonColor = '#FF3B30';
    } else if (isWarning) {
        iconName = 'warning';
        iconColor = '#FF9500';
        buttonColor = '#FF9500';
    } else if (type === 'info') {
        iconName = 'information-circle';
        iconColor = '#00B1EB';
        buttonColor = '#00B1EB';
    }

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.alertContainer,
                        {
                            opacity: opacityValue,
                            transform: [{ scale: scaleValue }],
                        },
                    ]}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons name={iconName} size={50} color={iconColor} />
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    {showCancel ? (
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={onClose}
                            >
                                <Text style={styles.cancelButtonText}>{cancelText}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: buttonColor, flex: 1, marginLeft: 8 }]}
                                onPress={() => {
                                    if (onConfirm) onConfirm();
                                    else onClose();
                                }}
                            >
                                <Text style={styles.buttonText}>{confirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: buttonColor }]}
                            onPress={onClose}
                        >
                            <Text style={styles.buttonText}>OK</Text>
                        </TouchableOpacity>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: width * 0.85,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    iconContainer: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    button: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        flex: 1,
        marginRight: 8,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
        fontWeight: '600',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
