import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { platformShadow } from '../../utils/styleHelpers';
import { MaterialIcons } from '@expo/vector-icons';

interface ConfirmationModalProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    singleButton?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    singleButton = false
}) => {
    const { theme, colors } = useTheme();

    if (!visible) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={[
                    styles.modalContainer,
                    { backgroundColor: theme.colors.card },
                    Platform.OS === 'web' && styles.webModal
                ]}>

                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
                            <MaterialIcons name="help-outline" size={32} color={colors.primary} />
                        </View>
                    </View>

                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        {title}
                    </Text>

                    <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                        {message}
                    </Text>

                    <View style={styles.buttonContainer}>
                        {!singleButton && (
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton, { borderColor: theme.colors.border }]}
                                onPress={onCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>
                                    {cancelText}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.confirmButton,
                                { backgroundColor: colors.primary }
                            ]}
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as any,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        elevation: 99999,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 5,
    },
    webModal: {
        
        cursor: 'auto',
    } as any,
    iconContainer: {
        marginBottom: 16,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
        opacity: 0.8,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    cancelButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    confirmButton: {
        
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
