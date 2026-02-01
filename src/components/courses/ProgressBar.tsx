import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  height = 8 
}) => {
  return (
    <View style={[styles.progressBar, { height }]}>
      <View style={[styles.progressFill, { width: `${progress}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    width: '100%',
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2b6cb0',
    borderRadius: 4,
  },
});

export default ProgressBar;