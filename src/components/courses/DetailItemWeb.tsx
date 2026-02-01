
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface DetailItemWebProps {
  icon: string;
  label: string;
  value: string | number;
  highlight?: boolean;
  warning?: boolean;
}

export const DetailItemWeb: React.FC<DetailItemWebProps> = ({
  icon,
  label,
  value
}) => {
  return (
    <View style={styles.detailItemWeb}>
      <Ionicons name={icon as any} size={20} color="#718096" />
      <View style={styles.detailContentWeb}>
        <Text style={styles.detailLabelWeb}>{label}</Text>
        <Text style={styles.detailValueWeb}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  detailItemWeb: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: (width - 80) / 3,
    minWidth: 250,
  },
  detailContentWeb: {
    marginLeft: 12,
  },
  detailLabelWeb: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValueWeb: {
    fontSize: 14,
    color: '#2d3748',
    fontWeight: '600',
  },
});