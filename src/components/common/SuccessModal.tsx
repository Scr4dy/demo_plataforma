import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { platformShadow } from '../../utils/styleHelpers';
import { MaterialIcons } from '@expo/vector-icons';

interface SuccessModalProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    buttonText?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    visible,
    title,
    message,
    onClose,
    buttonText = 'Continuar'
}) => {
    const { theme, colors } = useTheme();

    if (!visible) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[
                    styles.modalContainer,
                    { backgroundColor: theme.colors.card },
                    Platform.OS === 'web' && styles.webModal
                ]}>
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: (colors.success || '#10b981') + '15' }]}>
                            <MaterialIcons name="check-circle" size={48} color={colors.success || '#10b981'} />
                        </View>
                    </View>

                    <Text style={[styles.title, { color: theme.colors.text }]}>
                        {title}
                    </Text>

                    <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
                        {message}
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: colors.success || '#10b981' }
                        ]}
                        onPress={onClose}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                            {buttonText}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        ...platformShadow({
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 5,
        }),
    },
    webModal: {
        cursor: 'auto',
    } as any,
    iconContainer: {
        marginBottom: 20,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
        opacity: 0.8,
    },
    button: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
