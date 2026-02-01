
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useReportes } from '../../hooks/useReportes';
import { Ionicons } from '@expo/vector-icons';
import type { DBReporte } from '../../types/database.types';
import { useNavigation } from '@react-navigation/native';
import { useHeader } from '../../context/HeaderContext';

export const AdminReportsScreen: React.FC = () => {
  const { theme, themeType, setThemeType, colors } = useTheme();
  const navigation = useNavigation<any>();

  const devToggleTheme = async () => {
    const next = themeType === 'light' ? 'dark' : themeType === 'dark' ? 'auto' : 'light';
    await setThemeType(next as any);
  };

  const { reportes, estadisticas, loading, cargarReportes, cargarEstadisticas, obtenerMetricas, obtenerCursosBajoRendimiento } = useReportes();
  const { header, setHeader } = useHeader();

  const [metricas, setMetricas] = useState<any>(null);
  const [cursosBajos, setCursosBajos] = useState<DBReporte[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [vistaActual, setVistaActual] = useState<'metricas' | 'reportes' | 'estadisticas'>('metricas');

  useEffect(() => {
    
    setHeader({ title: 'Reportes', subtitle: 'Métricas y reportes', manual: true, owner: 'AdminReports', showBack: true });
    cargarDatos();
    return () => {
      try {
        if (header && (header.owner === 'AdminReports' || (header.manual && header.title === 'Reportes'))) {
          setHeader(null);
        }
      } catch (e) {  }
    };
  }, [header]);

  const cargarDatos = async () => {
    try {
      const [metricasData, cursosData] = await Promise.all([
        obtenerMetricas(),
        obtenerCursosBajoRendimiento(),
      ]);

      setMetricas(metricasData);
      setCursosBajos(cursosData);

      if (vistaActual === 'reportes') {
        await cargarReportes();
      } else if (vistaActual === 'estadisticas') {
        await cargarEstadisticas();
      }
    } catch (error) {
      
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
  };

  const hexToRgba = (hex: string, alpha: number) => {
    
    const hexClean = hex.replace('#', '');
    const bigint = parseInt(hexClean.length === 3 ? hexClean.split('').map(c => c + c).join('') : hexClean, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const renderMetricCard = (icon: string, label: string, value: string | number, color: string) => {
    const iconBg = theme.dark ? hexToRgba('#ffffff', 0.06) : hexToRgba(color, 0.12);
    const iconColor = color; 
    return (
      <View style={[styles.metricCard, { backgroundColor: theme.colors.card }]}>
        <View style={[styles.metricIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={24} color={iconColor} />
        </View>
        <Text style={[styles.metricLabel, { color: theme.colors.text }]}>{label}</Text>
        <Text style={[styles.metricValue, { color: theme.colors.text }]}>{value}</Text>
      </View>
    );
  };

  const renderMetricasView = () => (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {}
      <View style={styles.sectionTitleContainer}>
        <Ionicons name="stats-chart" size={24} color={theme.colors.primary} />
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Métricas Generales
        </Text>
      </View>

      {metricas ? (
        <View style={styles.metricsGrid}>
          {renderMetricCard('book', 'Total Cursos', metricas.totalCursos, theme.colors.primary)}
          {renderMetricCard('people', 'Total Inscritos', metricas.totalInscritos, '#2196F3')}
          {renderMetricCard('checkmark-circle', 'Completados', metricas.totalCompletados, '#4CAF50')}
          {renderMetricCard('trending-up', 'Tasa Completado', `${metricas.tasaCompletadoGeneral}%`, '#FF9800')}
        </View>
      ) : (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
      )}

      {}
      {cursosBajos.length > 0 && (
        <>
          <View style={[styles.sectionTitleContainer, { marginTop: 24, flexDirection: 'column', alignItems: 'flex-start' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="warning" size={24} color="#FF5252" />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Cursos con Bajo Rendimiento
              </Text>
            </View>
            <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary, marginLeft: 32 }]}>
              Cursos con tasa de completado inferior al 50% que requieren atención
            </Text>
          </View>

          {cursosBajos.map((reporte: any, index) => (
            <View key={index} style={[styles.cursoCard, { backgroundColor: theme.colors.card }]}>
              {}
              <View style={styles.cursoHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cursoTitle, { color: theme.colors.text }]} numberOfLines={2}>
                    {reporte.curso_titulo || `Curso #${reporte.id_curso}`}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 }}>
                    <Ionicons name="alert-circle" size={14} color="#FF5252" />
                    <Text style={[styles.cursoSubtitle, { color: theme.colors.textSecondary }]}>
                      Requiere revisión
                    </Text>
                  </View>
                </View>
                <View style={[styles.progressBadge, { backgroundColor: theme.dark ? '#3a1a1a' : '#fff5f5' }]}>
                  <Text style={[styles.progressBadgeValue, { color: '#FF5252' }]}>
                    {reporte.tasa_completado?.toFixed(0)}%
                  </Text>
                  <Text style={[styles.progressBadgeLabel, { color: '#FF5252' }]}>
                    completado
                  </Text>
                </View>
              </View>

              {}
              <View style={styles.cursoStats}>
                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: theme.dark ? hexToRgba('#2196F3', 0.15) : hexToRgba('#2196F3', 0.1) }]}>
                    <Ionicons name="people" size={18} color="#2196F3" />
                  </View>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {reporte.total_inscritos}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Inscritos</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: theme.dark ? hexToRgba('#4CAF50', 0.15) : hexToRgba('#4CAF50', 0.1) }]}>
                    <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                  </View>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {reporte.total_completados}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Completados</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: theme.dark ? hexToRgba('#FF9800', 0.15) : hexToRgba('#FF9800', 0.1) }]}>
                    <Ionicons name="exit" size={18} color="#FF9800" />
                  </View>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {reporte.tasa_abandono?.toFixed(0) || 0}%
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Abandono</Text>
                </View>
              </View>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderReportesView = () => (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.sectionTitleContainer}>
        <Ionicons name="document-text" size={24} color={theme.colors.primary} />
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Reportes por Curso
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
      ) : reportes.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={theme.colors.border} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            No hay reportes disponibles
          </Text>
        </View>
      ) : (
        reportes.map((reporte: any, index) => (
          <View key={index} style={[styles.reportCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.reportTitle, { color: theme.colors.text }]}>
              {reporte.curso_titulo || `Curso #${reporte.id_curso}`}
            </Text>

            <View style={styles.reportGrid}>
              <View style={styles.reportItem}>
                <Text style={[styles.reportLabel, { color: theme.colors.textSecondary }]}>Inscritos</Text>
                <Text style={[styles.reportValue, { color: theme.colors.text }]}>
                  {reporte.total_inscritos}
                </Text>
              </View>
              <View style={styles.reportItem}>
                <Text style={[styles.reportLabel, { color: theme.colors.textSecondary }]}>Completados</Text>
                <Text style={[styles.reportValue, { color: theme.colors.text }]}>
                  {reporte.total_completados}
                </Text>
              </View>
              <View style={styles.reportItem}>
                <Text style={[styles.reportLabel, { color: theme.colors.textSecondary }]}>Tasa Completado</Text>
                <Text style={[styles.reportValue, { color: theme.colors.primary }]}>
                  {reporte.tasa_completado?.toFixed(1) || 0}%
                </Text>
              </View>
              <View style={styles.reportItem}>
                <Text style={[styles.reportLabel, { color: theme.colors.textSecondary }]}>Promedio Instructor</Text>
                <Text style={[styles.reportValue, { color: theme.colors.text }]}>
                  {reporte.promedio_instructor?.toFixed(1) || 'N/A'} ⭐
                </Text>
              </View>
              <View style={styles.reportItem}>
                <Text style={[styles.reportLabel, { color: theme.colors.textSecondary }]}>Promedio Contenido</Text>
                <Text style={[styles.reportValue, { color: theme.colors.text }]}>
                  {reporte.promedio_contenido?.toFixed(1) || 'N/A'} ⭐
                </Text>
              </View>
              <View style={styles.reportItem}>
                <Text style={[styles.reportLabel, { color: theme.colors.textSecondary }]}>Tiempo Promedio</Text>
                <Text style={[styles.reportValue, { color: theme.colors.text }]}>
                  {reporte.tiempo_promedio_completado ? `${Math.round(reporte.tiempo_promedio_completado / 60)}h` : 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  const renderEstadisticasView = () => (
    <ScrollView
      style={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.sectionTitleContainer}>
        <Ionicons name="trending-up" size={24} color={theme.colors.primary} />
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Estadísticas Consolidadas
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
      ) : estadisticas.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="stats-chart-outline" size={64} color={theme.colors.border} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            No hay estadísticas disponibles
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>

            Las estadísticas se generan automáticamente desde los cursos activos
          </Text>
        </View>
      ) : (
        estadisticas.map((stat, index) => (
          <View key={index} style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.statCardTitle, { color: theme.colors.text }]}>
              {stat.titulo}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 }}>
              <Ionicons name="person" size={14} color={theme.colors.border} />
              <Text style={[styles.statCardInstructor, { color: theme.colors.textSecondary }]}>
                {stat.instructor}
              </Text>
            </View>

            <View style={styles.statCardGrid}>
              <View style={styles.statCardItem}>
                <Text style={[styles.statCardValue, { color: theme.colors.primary }]}>
                  {stat.progreso_promedio}%
                </Text>
                <Text style={[styles.statCardLabel, { color: theme.colors.textSecondary }]}>
                  Progreso Promedio
                </Text>
              </View>
              <View style={styles.statCardItem}>
                <Text style={[styles.statCardValue, { color: '#4CAF50' }]}>
                  {stat.total_completados}/{stat.total_inscritos}
                </Text>
                <Text style={[styles.statCardLabel, { color: theme.colors.textSecondary }]}>
                  Completados
                </Text>
              </View>
              <View style={styles.statCardItem}>
                <Text style={[styles.statCardValue, { color: '#FF9800' }]}>
                  {stat.calificacion_instructor_promedio} ⭐
                </Text>
                <Text style={[styles.statCardLabel, { color: theme.colors.textSecondary }]}>
                  Instructor
                </Text>
              </View>
              <View style={styles.statCardItem}>
                <Text style={[styles.statCardValue, { color: '#2196F3' }]}>
                  {stat.calificacion_contenido_promedio} ⭐
                </Text>
                <Text style={[styles.statCardLabel, { color: theme.colors.textSecondary }]}>
                  Contenido
                </Text>
              </View>
            </View>

            <Text style={[styles.statCardFooter, { color: theme.colors.textSecondary }]}>
              {stat.total_contenidos} contenidos • {stat.total_abandonados} abandonos
            </Text>
          </View>
        ))
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {}

      {}
      <View style={[styles.tabs, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.tab, vistaActual === 'metricas' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => setVistaActual('metricas')}
        >
          <Ionicons
            name="stats-chart"
            size={20}
            color={vistaActual === 'metricas' ? theme.colors.primary : theme.colors.border}
          />
          <Text style={[
            styles.tabText,
            { color: vistaActual === 'metricas' ? theme.colors.primary : theme.colors.text }
          ]}>
            Métricas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, vistaActual === 'reportes' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => {
            setVistaActual('reportes');
            if (reportes.length === 0) cargarReportes();
          }}
        >
          <Ionicons
            name="document-text"
            size={20}
            color={vistaActual === 'reportes' ? theme.colors.primary : theme.colors.border}
          />
          <Text style={[
            styles.tabText,
            { color: vistaActual === 'reportes' ? theme.colors.primary : theme.colors.text }
          ]}>
            Reportes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, vistaActual === 'estadisticas' && { borderBottomColor: theme.colors.primary }]}
          onPress={() => {
            setVistaActual('estadisticas');
            if (estadisticas.length === 0) cargarEstadisticas();
          }}
        >
          <Ionicons
            name="trending-up"
            size={20}
            color={vistaActual === 'estadisticas' ? theme.colors.primary : theme.colors.border}
          />
          <Text style={[
            styles.tabText,
            { color: vistaActual === 'estadisticas' ? theme.colors.primary : theme.colors.text }
          ]}>
            Estadísticas
          </Text>
        </TouchableOpacity>
      </View>

      {}
      {vistaActual === 'metricas' && renderMetricasView()}
      {vistaActual === 'reportes' && renderReportesView()}
      {vistaActual === 'estadisticas' && renderEstadisticasView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cursoCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cursoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  cursoTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  cursoSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 85,
    borderWidth: 1,
    borderColor: '#FF525220',
  },
  progressBadgeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  progressBadgeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cursoStats: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  reportCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reportItem: {
    flex: 1,
    minWidth: 100,
  },
  reportLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  reportValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statCardInstructor: {
    fontSize: 14,
  },
  statCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  statCardItem: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  statCardFooter: {
    fontSize: 12,
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default AdminReportsScreen;