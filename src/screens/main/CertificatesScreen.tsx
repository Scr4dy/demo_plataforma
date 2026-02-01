
import React, { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  
  ActivityIndicator,
  Platform,
  Share,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useHeader } from '../../context/HeaderContext';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { safeOpenUrl } from '../../utils/safeOpenUrl';
import { certificateService } from '../../services/certificateService';
import { getLoadingMessage, getEmptyStateMessage } from '../../utils/personalizedMessages';
import { platformShadow } from '../../utils/styleHelpers';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../services/categoryService';
import { supabase } from '../../config/supabase';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';

const isWeb = Platform.OS === 'web';

interface Certificate {
  id: number;  
  titulo: string;
  cursoId: number;
  cursoNombre: string;
  fechaEmision: string;
  fechaExpiracion?: string;
  codigoVerificacion: string;
  estado: 'VIGENTE' | 'EXPIRADO' | 'PENDIENTE' | 'REVOCADO';
  urlDescarga?: string;
  instructor: string;
  duracionHoras?: number;
  calificacion?: number;
  fisicoEnviado?: boolean;
}

export default function CertificatesScreen() {
  const { theme, colors, getFontSize } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [sharingId, setSharingId] = useState<number | null>(null);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [eligibleCourses, setEligibleCourses] = useState<any[]>([]); 
  const [shippedCoursesCount, setShippedCoursesCount] = useState<number>(0); 
  const [requestingCertificates, setRequestingCertificates] = useState(false);
  const [requestsLeft, setRequestsLeft] = useState<number>(2); 
  const [waitMinutes, setWaitMinutes] = useState<number>(0); 
  const { state } = useAuth();

  const navigation = useNavigation<any>();
  const { setHeader } = useHeader(); 
  const insets = useSafeAreaInsets();

  
  const [alertModal, setAlertModal] = useState({
    visible: false,
    title: '',
    message: '',
    singleButton: true,
    confirmText: 'Entendido',
    cancelText: 'Cancelar',
    onConfirm: () => { },
    onCancel: () => { },
  });

  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    setAlertModal({
      visible: true,
      title,
      message,
      singleButton: true,
      confirmText: 'Entendido',
      cancelText: '',
      onConfirm: () => {
        setAlertModal(prev => ({ ...prev, visible: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => setAlertModal(prev => ({ ...prev, visible: false })),
    });
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText = 'Aceptar', cancelText = 'Cancelar', onCancel?: () => void) => {
    setAlertModal({
      visible: true,
      title,
      message,
      singleButton: false,
      confirmText,
      cancelText,
      onConfirm: () => {
        setAlertModal(prev => ({ ...prev, visible: false }));
        onConfirm();
      },
      onCancel: () => {
        setAlertModal(prev => ({ ...prev, visible: false }));
        if (onCancel) onCancel();
      },
    });
  };

  
  useFocusEffect(
    React.useCallback(() => {
      loadCertificates();
    }, [state.user?.id_usuario])
  );

  
  useEffect(() => {
    
    if (Platform.OS === 'web') {
      setHeader({ hidden: true, manual: true, owner: 'Certificates' });
    } else {
      
      setHeader({
        title: 'Mis Certificados',
        owner: 'Certificates',
        manual: true,
        showBack: false, 
      });
    }

    return () => {
      try {
        setHeader(null);
      } catch (e) {  }
    };
  }, [navigation]);

  
  useEffect(() => {
    let timer: any;
    if (waitMinutes > 0) {
      timer = setInterval(() => {
        setWaitMinutes(prev => Math.max(0, prev - 1));
      }, 60000); 
    }
    return () => { if (timer) clearInterval(timer); };
  }, [waitMinutes]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const userId = state.user?.id_usuario;
      const userIdNum = Number(userId);

      
      const tasks: Promise<any>[] = [
        
        certificateService.getMyCertificates(undefined, userId)
      ];

      
      const canCheckLimits = userId && !isNaN(userIdNum) && userIdNum > 0;
      if (canCheckLimits) {
        tasks.push(supabase.rpc('obtener_cursos_elegibles_notificacion', { p_id_usuario: userIdNum }) as any);
        tasks.push(supabase.rpc('verificar_limite_solicitudes_diarias', { p_id_usuario: userIdNum, p_limite: 2 }) as any);
      }

      
      
      const results = await Promise.all(tasks);

      
      const certs = results[0];
      setCertificates(certs || []);

      if (canCheckLimits && results.length >= 3) {
        const elegiblesRes = results[1];
        const limiteRes = results[2];

        
        if (elegiblesRes?.error) {
          
        } else {
          const elegiblesData = elegiblesRes?.data || [];
          const elegibles = elegiblesData.filter((c: any) => c.puede_notificar === true);
          const enviados = elegiblesData.filter((c: any) => c.certificado_fisico_enviado === true);
          setEligibleCourses(elegibles);
          setShippedCoursesCount(enviados.length);
          
        }

        
        if (limiteRes?.data && limiteRes.data[0]) {
          const d = limiteRes.data[0];
          setRequestsLeft(d.solicitudes_restantes);
          setWaitMinutes(d.minutos_restantes || 0);
          
        }
      }

    } catch (error) {
      
      showAlert('Error', 'No se pudieron cargar los certificados');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCertificates();
  };

  const handleShareCertificate = async (certificate: Certificate) => {
    setSharingId(certificate.id);
    try {
      const message = `🎓 ${certificate.titulo}\n` +
        `Curso: ${certificate.cursoNombre}\n` +
        `Emitido: ${formatDate(certificate.fechaEmision)}\n` +
        `Código: ${certificate.codigoVerificacion}\n` +
        `Instructor: ${certificate.instructor}\n` +
        `Calificación: ${certificate.calificacion || 'N/A'}/100\n\n` +
        `ManufacturaPro - Sistema de Capacitación`;

      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(message);
        showAlert('Copiado', 'Certificado copiado al portapapeles');
      } else if (Platform.OS === 'web') {
        
        showAlert('Info', 'Tu navegador no permite copiar automáticamente. Usa Ctrl+C para copiar.');
      } else {
        await Share.share({
          message,
          title: certificate.titulo,
        });
      }
    } catch (error) {
      
      showAlert('Error', 'No se pudo compartir el certificado');
    } finally {
      setSharingId(null);
    }
  };

  const handleDownloadCertificate = async (certificate: Certificate) => {
    
    if (Platform.OS === 'web' && certificate.urlDescarga) {
      safeOpenUrl(certificate.urlDescarga);
      return;
    }

    try {
      showConfirm(
        'Descargar Certificado',
        `¿Descargar "${certificate.titulo}" en formato PDF?`,
        async () => {
          setDownloadingId(certificate.id);
          try {
            const res = await certificateService.downloadCertificate(certificate.id);
            const url = res?.url;
            if (!url) throw new Error('URL de certificado no disponible');
            
            const getContentType = async (testUrl: string): Promise<string | null> => {
              try {
                const head = await fetch(testUrl, { method: 'HEAD' });
                const ct = head.headers.get('content-type');
                if (ct) return ct;
              } catch (_) {
                
              }
              try {
                const r = await fetch(testUrl, { method: 'GET', headers: { Range: 'bytes=0-0' } });
                const ct2 = r.headers.get('content-type');
                if (ct2) return ct2;
              } catch (_) {
                
              }
              return null;
            };

            
            if (!(typeof window !== 'undefined' && url.startsWith('http')) && Platform.OS === 'web') {
              showConfirm(
                'Demo',
                `En modo demo no hay un PDF accesible. URL: ${url}. ¿Copiar URL?`,
                () => {
                  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                    navigator.clipboard.writeText(url).then(() => showAlert('Copiado', 'URL copiada al portapapeles'));
                  } else {
                    showAlert('Info', 'Tu navegador no permite copiar automáticamente. Selecciona y copia la URL manualmente.');
                  }
                },
                'Copiar URL',
                'Cerrar'
              );

              setDownloadingId(null);
              return;
            }

            
            let contentType: string | null = null;
            try {
              contentType = await getContentType(url);
            } catch (e) {
              
            }

            const isPdf = contentType ? contentType.toLowerCase().includes('application/pdf') : false;

            if (!isPdf) {
              const label = contentType || 'desconocido';
              
              if (!isPdf) {
                const label = contentType || 'desconocido';
                
                showConfirm(
                  'Archivo no es PDF',
                  `El recurso parece ser de tipo: ${label}. ¿Deseas abrirlo de todos modos?`,
                  async () => {
                    try {
                      if (Platform.OS === 'web') {
                        safeOpenUrl(url);
                      } else {
                        const canOpen = await Linking.canOpenURL(url);
                        if (canOpen) await Linking.openURL(url);
                        else Share.share({ message: url });
                      }
                    } catch (openErr) {
                      :', openErr);
                      showAlert('Error', 'No se pudo abrir el enlace');
                    } finally {
                      setDownloadingId(null);
                    }
                  },
                  'Abrir',
                  'Cancelar',
                  () => setDownloadingId(null)
                );

                return;
              }

              return;
            }

            
            
            if (Platform.OS === 'web') {
              if (typeof window !== 'undefined') safeOpenUrl(url);
            } else {
              try {
                const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9]/g, '_');
                const fileName = `certificado_${sanitize(certificate.titulo || 'doc')}_${certificate.id}.pdf`;
                const localUri = `${FileSystem.documentDirectory}${fileName}`;

                
                const downloadRes = await FileSystem.downloadAsync(url, localUri);

                if (downloadRes.status === 200) {
                  const canShare = await Sharing.isAvailableAsync();
                  if (canShare) {
                    await Sharing.shareAsync(localUri, {
                      mimeType: 'application/pdf',
                      dialogTitle: `Descargar ${certificate.titulo}`
                    });
                  } else {
                    showAlert('Descarga completada', `Archivo guardado en: ${localUri}`);
                  }
                } else {
                  throw new Error(`Download failed with status ${downloadRes.status}`);
                }
              } catch (downloadErr) {
                
                
                try {
                  const supported = await Linking.canOpenURL(url);
                  if (supported) {
                    await Linking.openURL(url);
                  } else {
                    showAlert('Error', 'No se pudo descargar ni abrir el archivo.');
                  }
                } catch (e) {
                  showAlert('Error', 'Error al intentar descargar el certificado.');
                }
              }
            }

          } catch (error) {
            
            showAlert('Error', 'No se pudo abrir el certificado');
          } finally {
            setDownloadingId(null);
          }
        },
        'Ver / Descargar'
      );
    } catch (error) {
      
      showAlert('Demo', 'En modo demo, la descarga se simula');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'VIGENTE': return '#4CAF50';
      case 'EXPIRADO': return '#FF6B6B';
      case 'PENDIENTE': return '#FF9800';
      case 'REVOCADO': return '#D32F2F';
      default: return '#666';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'VIGENTE': return 'checkmark-circle';
      case 'EXPIRADO': return 'alert-circle';
      case 'PENDIENTE': return 'time';
      case 'REVOCADO': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getDaysUntilExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;
    try {
      const diffTime = new Date(expiryDate).getTime() - new Date().getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return null;
    }
  };

  const getProgressForPending = (certificate: Certificate) => {
    
    if (certificate.estado === 'PENDIENTE') {
      return certificate.calificacion || 0;
    }
    return 100;
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text, fontSize: getFontSize(16) }]}>{getLoadingMessage('certificates')}</Text>
      </View>
    );
  }

  const stats = {
    total: certificates.length,
    active: certificates.filter(c => c.estado === 'VIGENTE').length,
    expired: certificates.filter(c => c.estado === 'EXPIRADO').length,
    pending: certificates.filter(c => (c.estado === 'PENDIENTE' || (c.estado as any) === 'POR_GENERAR')).length,
  };

  const handleRequestSingleCertificate = async (item: any) => {
    try {
      setRequestingCertificates(true);
      const courseId = item.cursoId || Number(item.id_curso);
      const courseTitle = item.cursoNombre || item.titulo;

      const userId = state.user?.id_usuario;
      const userEmail = state.user?.email;
      const userName = state.user?.nombre
        ? `${state.user.nombre} ${state.user.apellidoPaterno || ''} ${state.user.apellidoMaterno || ''}`.trim()
        : userEmail || 'Usuario';

      

      const result = await certificateService.requestCertificatesForCompleted([courseId], userId, userEmail, userName);
      if (result.success) {
        showAlert('Solicitud enviada', `Se ha notificado a la administración para procesar tu certificado de "${courseTitle}".`, async () => {
          
        });
        setWaitMinutes(60); 
        await loadCertificates(); 
      } else {
        const isLimit = result.message.includes('límite') || result.message.includes('Intenta mañana');
        const isShipped = result.message.includes('ya tiene') || result.message.includes('enviado');

        showAlert(isLimit ? 'Límite alcanzado' : 'Aviso', result.message);

        if (isLimit) {
          setRequestsLeft(0);
        } else if (isShipped) {
          
          await loadCertificates();
        }
      }
    } catch (err) {
      
      showAlert('Error', 'No se pudo procesar la solicitud');
    } finally {
      setRequestingCertificates(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>

      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {isWeb && certificates.length > 0 && (
          <View style={[styles.statsContainerWeb, { backgroundColor: theme.colors.card }]}>
            <View style={styles.statItemWeb}>
              <Text style={[styles.statValueWeb, { color: colors.primary, fontSize: getFontSize(28) }]}>{stats.total}</Text>
              <Text style={[styles.statLabelWeb, { color: theme.dark ? '#999' : '#666', fontSize: getFontSize(12) }]}>Total</Text>
            </View>
            <View style={styles.statItemWeb}>
              <Text style={[styles.statValueWeb, { color: '#4CAF50', fontSize: getFontSize(28) }]}>
                {stats.active}
              </Text>
              <Text style={[styles.statLabelWeb, { color: theme.dark ? '#999' : '#666', fontSize: getFontSize(12) }]}>Vigentes</Text>
            </View>
            <View style={styles.statItemWeb}>
              <Text style={[styles.statValueWeb, { color: '#FF6B6B', fontSize: getFontSize(28) }]}>
                {stats.expired}
              </Text>
              <Text style={[styles.statLabelWeb, { color: theme.dark ? '#999' : '#666', fontSize: getFontSize(12) }]}>Expirados</Text>
            </View>
          </View>
        )}

        {}
        {!isWeb && certificates.length > 0 && (
          <View style={[styles.statsContainer, { marginTop: 4, marginHorizontal: 20, backgroundColor: theme.colors.card }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stats.total}</Text>
              <Text style={[styles.statLabel, { color: theme.dark ? '#999' : '#666' }]}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                {stats.active}
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? '#999' : '#666' }]}>Vigentes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#FF6B6B' }]}>
                {stats.expired}
              </Text>
              <Text style={[styles.statLabel, { color: theme.dark ? '#999' : '#666' }]}>Expirados</Text>
            </View>
          </View>
        )}

        {}
        <View style={styles.certificatesList}>
          {(() => {
            
            const realCertCourseIds = new Set(certificates.map(c => c.cursoId));
            const virtualCerts = eligibleCourses
              .filter(ec => !realCertCourseIds.has(Number(ec.id_curso)))
              .map(ec => ({
                id: -(Number(ec.id_curso)), 
                titulo: ec.curso_nombre,
                cursoId: Number(ec.id_curso),
                cursoNombre: ec.curso_nombre,
                fechaEmision: new Date().toISOString(),
                codigoVerificacion: 'PENDIENTE',
                estado: 'POR_GENERAR' as any,
                instructor: 'Por asignar',
                urlDescarga: undefined,
                fechaExpiracion: undefined,
                fisicoEnviado: false
              }));

            const allItems = [...certificates, ...virtualCerts];

            if (allItems.length === 0) {
              return (
                <View style={styles.emptyState}>
                  <Ionicons name="ribbon-outline" size={64} color={theme.dark ? '#555' : '#ccc'} />
                  <Text style={[styles.emptyTitle, { color: theme.colors.text, fontSize: getFontSize(20) }]}>Sin certificados</Text>
                  <Text style={[styles.emptyDescription, { color: theme.dark ? '#999' : '#666' }]}>
                    {getEmptyStateMessage('certificates')}
                  </Text>
                  <TouchableOpacity
                    style={[styles.exploreButton, { backgroundColor: colors.primary, marginBottom: 20 }]}
                    onPress={() => navigation.navigate('Courses')}
                  >
                    <Text style={[styles.exploreButtonText, { color: theme.colors.card }]}>Explorar Cursos</Text>
                  </TouchableOpacity>

                  {shippedCoursesCount > 0 && (
                    <View style={{ marginTop: 16, alignItems: 'center', paddingHorizontal: 20 }}>
                      <Ionicons name="checkmark-circle" size={48} color={theme.dark ? '#4ade80' : '#16a34a'} style={{ marginBottom: 8 }} />
                      <Text style={{ color: theme.dark ? '#4ade80' : '#16a34a', fontSize: 16, fontWeight: '600', textAlign: 'center', marginBottom: 4 }}>
                        Certificados Enviados
                      </Text>
                      <Text style={{ color: theme.colors.text, fontSize: 14, textAlign: 'center' }}>
                        Todos tus certificados ({shippedCoursesCount}) ya fueron enviados por correo postal.
                      </Text>
                    </View>
                  )}
                </View>
              );
            }

            return (
              <>
                {allItems.map((item) => {
                  const isVirtual = (item.estado as any) === 'POR_GENERAR';
                  const daysUntilExpiry = getDaysUntilExpiry(item.fechaExpiracion);
                  const statusColor = getStatusColor(item.estado);

                  return (
                    <View key={item.id} style={[styles.certificateCard, { backgroundColor: theme.colors.card }]}>
                      <View style={styles.certificateHeader}>
                        <View style={styles.certificateInfo}>
                          <View style={[
                            styles.statusBadge,
                            { backgroundColor: isVirtual ? `${colors.primary}20` : `${statusColor}20` }
                          ]}>
                            <Ionicons
                              name={isVirtual ? 'time-outline' : getStatusIcon(item.estado) as any}
                              size={14}
                              color={isVirtual ? colors.primary : statusColor}
                              style={{ marginRight: 8 }}
                            />
                            <Text style={[
                              styles.statusText,
                              { color: isVirtual ? colors.primary : statusColor }
                            ]}>
                              {isVirtual ? 'COMPLETADO' : item.estado}
                            </Text>
                          </View>
                          {daysUntilExpiry !== null && daysUntilExpiry <= 30 && item.estado === 'VIGENTE' && (
                            <Text style={[styles.expiryWarning, { color: '#FF9800' }]}>
                              Expira en {daysUntilExpiry} días
                            </Text>
                          )}
                        </View>

                        <View style={styles.certificateActions}>
                          {!isVirtual && (
                            <TouchableOpacity
                              style={[styles.actionButton, { marginLeft: 0 }]}
                              onPress={() => handleShareCertificate(item as any)}
                              disabled={sharingId === item.id}
                            >
                              {sharingId === item.id ? (
                                <ActivityIndicator size="small" color={theme.dark ? '#999' : '#666'} />
                              ) : (
                                <Ionicons name="share-outline" size={18} color={theme.dark ? '#999' : '#666'} />
                              )}
                            </TouchableOpacity>
                          )}

                          {item.urlDescarga ? (
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => handleDownloadCertificate(item as any)}
                              disabled={downloadingId === item.id}
                            >
                              {downloadingId === item.id ? (
                                <ActivityIndicator size="small" color={theme.dark ? '#999' : '#666'} />
                              ) : (
                                <Ionicons name="download-outline" size={18} color={theme.dark ? '#999' : '#666'} />
                              )}
                            </TouchableOpacity>
                          ) : (
                            (() => {
                              const isShipped = Boolean(item.fisicoEnviado);
                              return (
                                <TouchableOpacity
                                  style={[
                                    styles.requestButtonSmall,
                                    { backgroundColor: isShipped ? (theme.dark ? '#333' : '#eee') : (requestsLeft > 0 && waitMinutes === 0 ? colors.primary : (theme.dark ? '#333' : '#e0e0e0')) }
                                  ]}
                                  onPress={() => !isShipped && waitMinutes === 0 && handleRequestSingleCertificate(item)}
                                  disabled={requestingCertificates || requestsLeft === 0 || isShipped || waitMinutes > 0}
                                >
                                  <Text style={[
                                    styles.requestButtonTextSmall,
                                    { color: (requestsLeft > 0 && !isShipped && waitMinutes === 0) ? '#fff' : (theme.dark ? '#666' : '#999') }
                                  ]}>
                                    {isShipped ? 'Enviado' : (waitMinutes > 0 ? `Espera ${waitMinutes}m` : (requestsLeft > 0 ? 'Solicitar' : 'Límite'))}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })()
                          )}
                        </View>
                      </View>

                      <Text style={[styles.courseTitle, { color: theme.colors.text }]}>{item.titulo}</Text>
                      <Text style={[styles.courseSubtitle, { color: theme.dark ? '#999' : '#666' }]}>
                        {item.cursoNombre}
                      </Text>

                      {!isVirtual && (
                        <View style={styles.certificateDetails}>
                          <View style={styles.detailItem}>
                            <Ionicons name="calendar-outline" size={14} color={theme.dark ? '#aaa' : '#666'} />
                            <Text style={[styles.detailText, { color: theme.dark ? '#ccc' : '#666' }]}>
                              Emitido: {formatDate(item.fechaEmision)}
                            </Text>
                          </View>
                          {item.fechaExpiracion && (
                            <View style={styles.detailItem}>
                              <Ionicons name="time-outline" size={14} color={theme.dark ? '#aaa' : '#666'} />
                              <Text style={[styles.detailText, { color: theme.dark ? '#ccc' : '#666' }]}>
                                Expira: {formatDate(item.fechaExpiracion)}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      {isVirtual && (
                        <View style={{ marginTop: 12 }}>
                          <Text style={{ color: theme.dark ? '#aaa' : '#666', fontSize: 13 }}>
                            Curso completado. Solicita tu certificado para que la administración lo genere.
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}

                {shippedCoursesCount > 0 && eligibleCourses.length === 0 && (
                  <View style={{ marginTop: 10, alignItems: 'center', padding: 15 }}>
                    <Text style={{ color: theme.dark ? '#4ade80' : '#16a34a', fontSize: 13, textAlign: 'center' }}>
                      ✓ Ya has solicitado todos tus certificados disponibles.
                    </Text>
                  </View>
                )}

                {requestsLeft < 2 && requestsLeft > 0 && (
                  <View style={{ marginTop: 10, alignItems: 'center', padding: 10 }}>
                    <Text style={{ color: theme.dark ? '#999' : '#666', fontSize: 12 }}>
                      Te queda {requestsLeft} {requestsLeft === 1 ? 'solicitud disponible' : 'solicitudes disponibles'} para hoy.
                    </Text>
                  </View>
                )}

                {requestsLeft === 0 && (
                  <View style={{ marginTop: 10, alignItems: 'center', padding: 10, backgroundColor: theme.dark ? '#331111' : '#fff5f5', borderRadius: 8 }}>
                    <Text style={{ color: '#ff6b6b', fontSize: 13, fontWeight: '600' }}>
                      Has alcanzado el límite de 2 solicitudes por día.
                    </Text>
                    <Text style={{ color: theme.dark ? '#999' : '#666', fontSize: 11, marginTop: 2 }}>
                      Podrás realizar más solicitudes mañana.
                    </Text>
                  </View>
                )}

                {waitMinutes > 0 && requestsLeft > 0 && (
                  <View style={{ marginTop: 10, alignItems: 'center', padding: 10, backgroundColor: theme.dark ? '#1a1a2e' : '#f0f4ff', borderRadius: 8 }}>
                    <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>
                      Solicitud en proceso
                    </Text>
                    <Text style={{ color: theme.dark ? '#999' : '#666', fontSize: 11, marginTop: 2 }}>
                      Por seguridad, debes esperar {waitMinutes} minutos para tu siguiente solicitud.
                    </Text>
                  </View>
                )}
              </>
            );
          })()}
        </View>

      </ScrollView>
      <ConfirmationModal
        visible={alertModal.visible}
        title={alertModal.title}
        message={alertModal.message}
        onConfirm={alertModal.onConfirm}
        onCancel={alertModal.onCancel}
        confirmText={alertModal.confirmText}
        cancelText={alertModal.cancelText}
        singleButton={alertModal.singleButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
  },
  statsContainerWeb: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  statItemWeb: {
    alignItems: 'center',
  },
  statValueWeb: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabelWeb: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  certificatesList: {
    padding: 20,
  },
  certificateCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    ...platformShadow({ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }),
  },
  requestButtonSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  requestButtonTextSmall: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  certificateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  certificateInfo: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expiryWarning: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '500',
  },
  certificateActions: {
    flexDirection: 'row',
    
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    lineHeight: 24,
  },
  courseSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  certificateDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  progressSection: {
    paddingTop: 16,
    borderTopWidth: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});