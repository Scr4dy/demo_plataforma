
import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions 
} from 'react-native';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface DashboardTourProps {
  visible: boolean;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  steps: TourStep[];
}

const DashboardTour: React.FC<DashboardTourProps> = ({
  visible,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onClose,
  steps
}) => {
  if (!visible || currentStep >= totalSteps) return null;

  const currentStepData = steps[currentStep];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[
          styles.tooltip,
          styles[`${currentStepData.position}Tooltip`]
        ]}>
          <View style={styles.header}>
            <Text style={styles.title}>{currentStepData.title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.description}>{currentStepData.description}</Text>
          
          <View style={styles.footer}>
            <Text style={styles.stepCounter}>
              {currentStep + 1} de {totalSteps}
            </Text>
            
            <View style={styles.buttonContainer}>
              {currentStep > 0 && (
                <TouchableOpacity onPress={onPrev} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Anterior</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                onPress={currentStep === totalSteps - 1 ? onClose : onNext}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  {currentStep === totalSteps - 1 ? 'Finalizar' : 'Siguiente'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  topTooltip: {
    marginBottom: 'auto',
    marginTop: 100,
  },
  bottomTooltip: {
    marginTop: 'auto',
    marginBottom: 100,
  },
  leftTooltip: {
    marginRight: 'auto',
    marginLeft: 20,
  },
  rightTooltip: {
    marginLeft: 'auto',
    marginRight: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    color: '#718096',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#4a5568',
    lineHeight: 22,
    marginBottom: 20,
  },
  footer: {
    alignItems: 'center',
  },
  stepCounter: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#4a5568',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DashboardTour;