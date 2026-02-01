
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContentProgressDetail, CourseProgressSummary } from '../../hooks/useContentProgress';

interface CourseProgressCardProps {
  resumen: CourseProgressSummary;
  detalleContenidos: ContentProgressDetail[];
  onContentPress: (contenido: ContentProgressDetail) => void;
}

export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({
  resumen,
  detalleContenidos,
  onContentPress
}) => {
  const getIconForTipo = (tipo: string, esEvaluacion: boolean) => {
    if (esEvaluacion) return 'school-outline';
    if (tipo === 'video') return 'play-circle-outline';
    if (tipo === 'leccion') return 'book-outline';
    return 'document-outline';
  };

  const getColorForEstado = (
    completado: boolean,
    esEvaluacion: boolean,
    aprobado?: boolean,
    totalIntentos?: number
  ): string => {
    if (esEvaluacion) {
      if (aprobado) return '#10b981'; 
      if (totalIntentos && totalIntentos > 0) return '#ef4444'; 
      return '#6b7280'; 
    }
    return completado ? '#10b981' : '#6b7280';
  };

  return (
    <View style={styles.container}>
      {}
      <View style={styles.resumenContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Progreso General</Text>
          <Text style={styles.progressPercentage}>{resumen.progreso_porcentaje}%</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${resumen.progreso_porcentaje}%` }
            ]}
          />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={styles.statText}>
              {resumen.contenidos_completados} / {resumen.total_contenidos_obligatorios} completados
            </Text>
          </View>

          {resumen.evaluaciones_reprobadas > 0 && (
            <View style={[styles.statItem, styles.alertItem]}>
              <Ionicons name="warning" size={20} color="#ef4444" />
              <Text style={[styles.statText, styles.alertText]}>
                {resumen.evaluaciones_reprobadas} evaluaciones reprobadas
              </Text>
            </View>
          )}

          {resumen.evaluaciones_pendientes > 0 && (
            <View style={[styles.statItem, styles.warningItem]}>
              <Ionicons name="alert-circle" size={20} color="#f59e0b" />
              <Text style={[styles.statText, styles.warningText]}>
                {resumen.evaluaciones_pendientes} evaluaciones pendientes
              </Text>
            </View>
          )}
        </View>
      </View>

      {}
      <View style={styles.contenidosContainer}>
        <Text style={styles.sectionTitle}>Contenidos del Curso</Text>

        {detalleContenidos.map((contenido) => {
          const iconColor = getColorForEstado(
            contenido.completado,
            contenido.es_evaluacion,
            contenido.aprobado,
            contenido.total_intentos
          );

          return (
            <TouchableOpacity
              key={contenido.id_contenido}
              style={styles.contenidoItem}
              onPress={() => onContentPress(contenido)}
            >
              <View style={styles.contenidoLeft}>
                <Ionicons
                  name={getIconForTipo(contenido.tipo, contenido.es_evaluacion)}
                  size={24}
                  color={iconColor}
                />
                <View style={styles.contenidoInfo}>
                  <Text style={styles.contenidoTitulo}>{contenido.titulo}</Text>
                  <Text style={[styles.contenidoEstado, { color: iconColor }]}>
                    {contenido.estado_texto}
                  </Text>

                  {}
                  {contenido.es_evaluacion && contenido.total_intentos !== undefined && (
                    <View style={styles.evaluacionInfo}>
                      {contenido.mejor_intento_porcentaje !== null && (
                        <Text style={styles.evaluacionDetalle}>
                          Mejor intento: {contenido.mejor_intento_porcentaje}%
                        </Text>
                      )}
                      {contenido.total_intentos > 0 && (
                        <Text style={styles.evaluacionDetalle}>
                          Intentos: {contenido.total_intentos}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.contenidoRight}>
                {contenido.obligatorio && (
                  <View style={styles.obligatorioBadge}>
                    <Text style={styles.obligatorioText}>Obligatorio</Text>
                  </View>
                )}

                {contenido.es_evaluacion && !contenido.aprobado && (
                  <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
                )}

                {!contenido.es_evaluacion && !contenido.completado && (
                  <Ionicons name="chevron-forward" size={20} color="#6b7280" />
                )}

                {contenido.cuenta_para_progreso && (
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  resumenContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3b82f6'
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4
  },
  statsContainer: {
    gap: 8
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statText: {
    fontSize: 14,
    color: '#6b7280'
  },
  alertItem: {
    backgroundColor: '#fef2f2',
    padding: 8,
    borderRadius: 6
  },
  alertText: {
    color: '#ef4444',
    fontWeight: '500'
  },
  warningItem: {
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 6
  },
  warningText: {
    color: '#f59e0b',
    fontWeight: '500'
  },
  contenidosContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12
  },
  contenidoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  contenidoLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12
  },
  contenidoInfo: {
    flex: 1
  },
  contenidoTitulo: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4
  },
  contenidoEstado: {
    fontSize: 13,
    fontWeight: '500'
  },
  evaluacionInfo: {
    marginTop: 4,
    gap: 2
  },
  evaluacionDetalle: {
    fontSize: 12,
    color: '#6b7280'
  },
  contenidoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  obligatorioBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  obligatorioText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3b82f6'
  }
});
