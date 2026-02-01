import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import InlineHeader from '../../components/common/InlineHeader';
import { useHeader } from '../../context/HeaderContext';
import { EvaluationScreenProps } from '../../types/navigation.types';

export default function EvaluationScreen() {
  const route = useRoute();
  const params = route.params as any;
  const { setHeader, header } = useHeader();

  useEffect(() => {
    
    const shouldSet = !(header?.title === 'Evaluación' && header?.owner === 'Evaluation' && header?.manual === true && header?.showBack === true);
    if (shouldSet) {
      setHeader && setHeader({
        title: 'Evaluación',
        subtitle: '',
        showBack: true,
        manual: true,
        owner: 'Evaluation',
        alignLeftOnMobile: true 
      });
    }

    return () => {
      
      if (header && (header.owner === 'Evaluation' || (header.manual && header.title === 'Evaluación'))) {
        setHeader && setHeader(null);
      }
    };
  }, [setHeader]);

  return (
    <View style={styles.container}>
      <InlineHeader title="Evaluación" forceBackOnMobile={true} backTo="Dashboard" />
      <Text style={styles.title}>Pantalla de Evaluación</Text>
      <Text style={styles.info}>Aquí se gestionan las evaluaciones.</Text>
      <Text style={{ marginTop: 8 }}>Params: {JSON.stringify(params)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: '700' },
  info: { marginTop: 10, color: '#666' }
});
