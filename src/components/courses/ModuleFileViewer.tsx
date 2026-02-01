import React, { useEffect, useState, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, Platform, StyleSheet, Image, ActivityIndicator, Alert, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import ThemedButton from '../common/ThemedButton';
import { storageService } from '../../services/storageService';
import { supabase } from '../../config/supabase';

interface Props {
  visible: boolean;
  onClose: () => void;
  url: string | null;
  mime?: string;
  filename?: string;
  originalPath?: string | null; 
}

export default function ModuleFileViewer({ visible, onClose, url, mime, filename, originalPath }: Props): React.ReactElement {
  const { theme, colors } = useTheme();
  const isWeb = Platform.OS === 'web';
  const type = (mime || '').toLowerCase();

  const [allowRender, setAllowRender] = useState<boolean>(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loadingBlob, setLoadingBlob] = useState<boolean>(false);
  const [conversionLoading, setConversionLoading] = useState<boolean>(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [embeddedViewerUrl, setEmbeddedViewerUrl] = useState<string | null>(null);
  const [embeddedViewerLoading, setEmbeddedViewerLoading] = useState<boolean>(false);
  const [pdfRenderFailed, setPdfRenderFailed] = useState<boolean>(false);

  
  const soundRef = useRef<any>(null);
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [textLoading, setTextLoading] = useState<boolean>(false);
  const [textError, setTextError] = useState<string | null>(null);

  
  useEffect(() => {
    const filenameLower = String(filename || '').toLowerCase();
    const isImage = type.startsWith('image/') || !!filenameLower.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i);
    const isVideo = type.startsWith('video/');
    const isPdf = type === 'application/pdf' || filenameLower.endsWith('.pdf');
    const isOffice = type.includes('officedocument') || !!filenameLower.match(/\.(ppt|pptx|doc|docx|xls|xlsx)$/i);

    
    setAllowRender(isImage || isVideo || isPdf || isOffice);
  }, [url, mime, filename]);

  
  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    async function fetchBlob() {
      if (!url || !allowRender || Platform.OS !== 'web') return;
      setLoadingBlob(true);
      try {
        const res = await fetch(url, { method: 'GET' });
        if (!active) return;
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (active) setBlobUrl(objectUrl);
      } catch (err) {
        
        
        setBlobUrl(null);
      } finally {
        if (active) setLoadingBlob(false);
      }
    }

    fetchBlob();

    return () => {
      active = false;
      if (objectUrl) {
        try { URL.revokeObjectURL(objectUrl); } catch (e) {  }
      }
      setBlobUrl(null);
    };
  }, [url, allowRender]);

  
  useEffect(() => {
    let mounted = true;
    async function fetchText() {
      if (!url || !allowRender) return;
      const isText = type === 'application/json' || (type && type.startsWith('text/')) || String(filename || '').match(/\.(json|txt|md)$/i);
      if (!isText) { setTextContent(null); setTextError(null); return; }
      setTextLoading(true);
      setTextError(null);
      try {
        const r = await fetch(url);
        if (!mounted) return;
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const txt = await r.text();
        if (mounted) setTextContent(txt);
      } catch (e) {
        
        if (mounted) setTextError('No fue posible obtener el contenido de texto');
      } finally {
        if (mounted) setTextLoading(false);
      }
    }

    fetchText();

    return () => { mounted = false; };
  }, [url, allowRender, type, filename]);

  
  useEffect(() => {
    let active = true;
    async function fetchEmbeddedForPPT() {
      if (!allowRender || !isWeb) return;
      const ext = String(filename || '').split('.').pop()?.toLowerCase() || '';
      if (ext !== 'ppt' && ext !== 'pptx') return;
      if (!originalPath) return;
      if (embeddedViewerUrl) return;
      setEmbeddedViewerLoading(true);
      try {
        
        const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
        const proxyPathRelative = `/api/fileProxy?bucket=course-content&path=${encodeURIComponent(originalPath || '')}`;
        const proxyPath = origin ? `${origin}${proxyPathRelative}` : proxyPathRelative;
        const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(proxyPath)}`;
        setEmbeddedViewerUrl(officeUrl);
      } catch (err) {
        
      } finally {
        if (active) setEmbeddedViewerLoading(false);
      }
    }
    fetchEmbeddedForPPT();
    return () => { active = false; };
  }, [allowRender, isWeb, filename, originalPath, embeddedViewerUrl]);

  
  useEffect(() => {
    return () => {
      (async () => {
        try {
          if (soundRef.current) {
            await soundRef.current.unloadAsync?.();
            soundRef.current = null;
            setIsAudioPlaying(false);
          }
        } catch (e) {  }
      })();
    };
  }, [visible]);

  const renderContent = () => {
    
    if (type.startsWith('image/') || String(filename || '').match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
      if (isWeb) {
        
        const src = blobUrl || url;
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loadingBlob ? (
              <div style={{ color: colors.text }}>Cargando vista previa...</div>
            ) : (
              
              
              <img src={src} alt={filename || 'image'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            )}
          </div>
        );
      }
      
      if (!url) return null;
      return (<Image source={{ uri: url }} style={styles.media} resizeMode="contain" />);
    }

    
    if (type.startsWith('audio/') || String(filename || '').match(/\.(mp3|wav|ogg)$/i)) {
      const audioSrc = blobUrl || url;
      if (isWeb) {
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {textLoading ? (
              <div style={{ color: colors.text }}>Cargando audio...</div>
            ) : (
              
              
              <audio src={audioSrc} controls style={{ maxWidth: '100%' }} />
            )}
          </div>
        );
      }

      
      try {
        
        const { Audio } = require('expo-av');

        const toggleAudio = async () => {
          try {
            if (!soundRef.current) {
              setAudioLoading(true);
              const s = new Audio.Sound();
              await s.loadAsync({ uri: audioSrc });
              soundRef.current = s;
              await s.playAsync();
              setIsAudioPlaying(true);
            } else {
              const status = await soundRef.current.getStatusAsync();
              if (status.isPlaying) {
                await soundRef.current.pauseAsync();
                setIsAudioPlaying(false);
              } else {
                await soundRef.current.playAsync();
                setIsAudioPlaying(true);
              }
            }
          } catch (err) {
            
            try {
              const { WebView } = require('react-native-webview');
              return <WebView source={{ uri: audioSrc }} style={{ flex: 1 }} />;
            } catch (e) {
              return <Text style={{ color: colors.text }}>No se puede reproducir el audio en este dispositivo.</Text>;
            }
          } finally {
            setAudioLoading(false);
          }
        };

        return (
          <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <TouchableOpacity onPress={toggleAudio} style={{ padding: 12, borderRadius: 8, backgroundColor: colors.primary }}>
              {audioLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff' }}>{isAudioPlaying ? 'Pausar' : 'Reproducir'}</Text>}
            </TouchableOpacity>
          </View>
        );
      } catch (err) {
        try {
          const { WebView } = require('react-native-webview');
          return <WebView source={{ uri: audioSrc }} style={{ flex: 1 }} />;
        } catch (e) {
          return <Text style={{ color: colors.text }}>No se puede reproducir el audio en este dispositivo.</Text>;
        }
      }
    }

    
    if (type.startsWith('video/')) {
      const videoSrc = blobUrl || url;
      if (isWeb) {
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loadingBlob ? (
              <div style={{ color: colors.text }}>Cargando vista previa...</div>
            ) : (
              
              
              <video src={videoSrc} controls style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            )}
          </div>
        );
      }

      
      try {
        
        const { Video: ExpoVideo } = require('expo-av');
        return (
          <View style={{ height: '100%', width: '100%', maxHeight: 400 }}>
            <ExpoVideo
              source={{ uri: videoSrc }}
              useNativeControls
              style={{ width: '100%', height: 300, backgroundColor: '#000' }}
              resizeMode="contain"
            />
          </View>
        );
      } catch (err) {
        try {
          const { WebView } = require('react-native-webview');
          return <WebView source={{ uri: videoSrc }} style={{ flex: 1 }} />;
        } catch (e) {
          return <Text style={{ color: colors.text }}>No se puede reproducir el video en este dispositivo.</Text>;
        }
      }
    
    
    if (type === 'application/pdf' || String(filename || '').toLowerCase().endsWith('.pdf')) {
      if (isWeb) {
        const src = blobUrl || url;
        return (
          <div style={{ width: '100%', height: '100%' }}>
            {loadingBlob ? (
              <div style={{ color: colors.text }}>Cargando vista previa...</div>
            ) : (
              
              
              <iframe src={src} title={filename || 'PDF'} style={{ width: '100%', height: '100%', border: 'none' }} />
            )}
          </div>
        );
      }
      try {
        const { WebView } = require('react-native-webview');
        const getPdfWebViewHtml = (zoom = 1) => `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=${zoom}"></head><body style="margin:0;height:100%"><iframe src="${url}" style="border:none;width:100%;height:100%"></iframe></body></html>`;
        return <WebView originWhitelist={["*"]} source={{ html: getPdfWebViewHtml() }} style={{ flex: 1 }} />;
      } catch (e) {
        return <Text style={{ color: colors.text }}>No se puede mostrar el PDF en este dispositivo.</Text>;
      }
    }

    
    if (type.includes('officedocument') || String(filename || '').match(/\.(ppt|pptx|doc|docx|xls|xlsx)$/i)) {
      const ext = String(filename || '').split('.').pop()?.toLowerCase() || '';
      
      if (isWeb && (ext === 'ppt' || ext === 'pptx')) {
        if (!originalPath && !url) {
          return (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ color: colors.text }}>No se pudo cargar la presentación.</div>
            </div>
          );
        }
        
        
        const fileUrl = url || '';
        const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
        
        return (
          <div style={{ width: '100%', height: '100%' }}>
            <iframe 
              src={officeViewerUrl} 
              title={filename || 'Presentación'} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
            />
          </div>
        );
      }

      
      if (isWeb) {
        const fileUrl = url || '';
        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
        
        return (
          <div style={{ width: '100%', height: '100%' }}>
            <iframe 
              src={viewerUrl} 
              title={filename || 'Documento'} 
              style={{ width: '100%', height: '100%', border: 'none' }} 
            />
          </div>
        );
      }

      
      if (!allowRender) {
        return (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.text, marginBottom: 12, textAlign: 'center' }}>
              Este archivo no se mostrará automáticamente para evitar descargas no deseadas.
            </Text>
            <TouchableOpacity onPress={() => setAllowRender(true)} style={{ padding: 12, backgroundColor: colors.primary, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Abrir en visor interno</Text>
            </TouchableOpacity>
          </View>
        );
      }

      
      if (blobUrl && Platform.OS !== 'web') {

        try {
          const { WebView } = require('react-native-webview');
          const getPdfWebViewHtml = (urlToRender: string) => `<!doctype html><html><head><meta name="viewport" content="initial-scale=1, maximum-scale=3" /><style>html,body{height:100%;margin:0;background:#fff}#viewer{width:100%;height:100%;overflow:auto}canvas{display:block;margin:0 auto}</style></head><body><div id="viewer"></div><script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script><script>pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';(async()=>{try{const url=${JSON.stringify(urlToRender)};const pdf=await pdfjsLib.getDocument(url).promise;const page=await pdf.getPage(1);const scale=(window.devicePixelRatio||1);const viewport=page.getViewport({scale});const canvas=document.createElement('canvas');canvas.width=Math.floor(viewport.width);canvas.height=Math.floor(viewport.height);canvas.style.width=(canvas.width/(window.devicePixelRatio||1))+'px';canvas.style.height=(canvas.height/(window.devicePixelRatio||1))+'px';document.getElementById('viewer').appendChild(canvas);const ctx=canvas.getContext('2d');await page.render({canvasContext:ctx,viewport}).promise;}catch(e){document.body.innerHTML='<div style="padding:16px;color:#333">No fue posible renderizar el PDF. Intenta abrirlo externamente.</div>';try{window.ReactNativeWebView&&window.ReactNativeWebView.postMessage&&window.ReactNativeWebView.postMessage(JSON.stringify({type:'pdfRenderFailed',message:String(e&&e.message)}));}catch(pmErr){}} })();</script></body></html>`;
          if (pdfRenderFailed) {
            return (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ color: theme.colors.text, marginBottom: 12, textAlign: 'center' }}>No fue posible renderizar el documento. Puedes abrirlo en el visor integrado sin descargar o intentar abrirlo externamente.</Text>
                <TouchableOpacity onPress={async () => {
                  if (!originalPath) { Alert.alert('Error', 'Ruta original desconocida.'); return; }
                  try {
                    const ext = String(filename || '').split('.').pop()?.toLowerCase() || '';
                      const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
                      const proxyPathRelative = `/api/fileProxy?bucket=course-content&path=${encodeURIComponent(originalPath || '')}`;
                      const proxyPath = origin ? `${origin}${proxyPathRelative}` : proxyPathRelative;
                    if (ext === 'ppt' || ext === 'pptx') {
                      const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(proxyPath)}`;
                      setEmbeddedViewerUrl(officeUrl);
                      return;
                    } else {
                      const docUrl = `https://docs.google.com/gview?url=${encodeURIComponent(proxyPath)}&embedded=true`;
                      setEmbeddedViewerUrl(docUrl);
                      return;
                    }
                  } catch (err) {
                    
                    setConversionError('No fue posible abrir el visor integrado');
                  }
                }} style={{ padding: 14, backgroundColor: colors.primary, borderRadius: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: '600' }}>Abrir en visor integrado (sin descargar)</Text>
                </TouchableOpacity>

                <View style={{ height: 10 }} />

                <TouchableOpacity onPress={() => { setPdfRenderFailed(false); }} style={{ padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.primary }}>
                  <Text style={{ color: colors.primary }}>Reintentar</Text>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <WebView
              originWhitelist={["*"]}
              source={{ html: getPdfWebViewHtml(blobUrl ?? '') }}
              style={{ flex: 1 }}
              onMessage={(e: any) => {
                try {
                  const d = JSON.parse(e.nativeEvent.data);
                  if (d?.type === 'pdfRenderFailed') setPdfRenderFailed(true);
                } catch (err) {  }
              }}
            />
          );
        } catch (e) {
          
        }
      }

      
      return (
        <View style={{ padding: 24, alignItems: 'center' }}>
          {conversionLoading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <Text style={{ color: theme.colors.text, marginBottom: 12, textAlign: 'center' }}>
                Este archivo no puede previsualizarse directamente en este dispositivo. Puedes intentar convertirlo a PDF o abrirlo en un visor integrado.
              </Text>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <ThemedButton
                  variant="primary"
                  style={{ marginRight: 8 }}
                  onPress={async () => {
                    if (!originalPath) { Alert.alert('Error', 'Ruta original desconocida. No se puede convertir.'); return; }
                    setConversionError(null);
                    setConversionLoading(true);
                    try {
                      const signedUrl = await storageService.getCourseContentUrl(originalPath, 3600);
                      const { data: { session } } = await supabase.auth.getSession();
                      const token = session?.access_token || null;
                      const resp = await fetch('/api/convert', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                        body: JSON.stringify({ signedUrl, path: originalPath })
                      });

                      if (!resp.ok) {
                        const txt = await resp.text();
                        setConversionError(txt || 'Error en conversión (posible que el servicio no esté habilitado)');

                        
                        try {
                          const ext = String(filename || '').split('.').pop()?.toLowerCase() || '';
                          if (ext === 'ppt' || ext === 'pptx') {
                            const proxyPath = `/api/fileProxy?bucket=course-content&path=${encodeURIComponent(originalPath || '')}`;
                            const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(proxyPath)}`;
                            
                            setEmbeddedViewerUrl(officeUrl);
                            return;
                          }
                        } catch (_) {}

                        return;
                      }

                      const json = await resp.json();
                      if (json?.pdfSignedUrl) {
                        
                        try {
                          const r = await fetch(json.pdfSignedUrl);
                          if (!r.ok) throw new Error('No se pudo descargar PDF convertido');
                          const b = await r.blob();
                          const obj = URL.createObjectURL(b);
                          setBlobUrl(obj);
                        } catch (e) {
                          
                          setConversionError('Error descargando PDF convertido');
                        }
                      }
                    } catch (err) {
                      
                      setConversionError('Error durante la conversión');
                    } finally {
                      setConversionLoading(false);
                    }
                  }}
                >
                  Solicitar conversión a PDF
                </ThemedButton>

                <ThemedButton
                  variant="ghost"
                  onPress={async () => {
                    if (!originalPath) { Alert.alert('Error', 'Ruta original desconocida.'); return; }
                    try {
                      const ext = String(filename || '').split('.').pop()?.toLowerCase() || '';
                      const proxyPath = `/api/fileProxy?bucket=course-content&path=${encodeURIComponent(originalPath || '')}`;
                      if (ext === 'ppt' || ext === 'pptx') {
                        
                        const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(proxyPath)}`;
                        setEmbeddedViewerUrl(officeUrl);
                        return;
                      } else {
                        
                        const docUrl = `https://docs.google.com/gview?url=${encodeURIComponent(proxyPath)}&embedded=true`;
                        setEmbeddedViewerUrl(docUrl);
                        return;
                      }
                    } catch (err) {
                      
                      setConversionError('No fue posible abrir el visor integrado');
                    }
                  }}
                >
                  Ver (sin descargar)
                </ThemedButton>

                <Text style={{ color: colors.text, marginTop: 8, fontSize: 12 }}>Se abrirá en el visor integrado en la app sin descargar el archivo.</Text>

                {}

              </View>

              {conversionError && <Text style={{ color: '#F44336', marginTop: 8 }}>{conversionError}</Text>}
            </>
          )}
        </View>
      );
      }

      const src = blobUrl || url;
      
      if (textContent !== null || textLoading || textError) {
        return (
          <View style={{ flex: 1, padding: 12 }}>
            {textLoading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : textError ? (
              <Text style={{ color: '#F44336' }}>{textError}</Text>
            ) : (
              
              
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
                <Text style={{ fontFamily: 'monospace' }}>{textContent}</Text>
              </ScrollView>
            )}
          </View>
        );
      }

      return (
        <div style={{ width: '100%', height: '100%' }}>
          {loadingBlob ? (
            <div style={{ color: colors.text }}>Cargando vista previa...</div>
          ) : (
            
            
            <iframe src={src} title={filename || 'file'} style={{ width: '100%', height: '100%', border: 'none' }} />
          )}
        </div>
      );
    }

    if (isWeb) {
      const src = blobUrl || url;
      return (
        <div style={{ width: '100%', height: '100%' }}>
          {loadingBlob ? (
            <div style={{ color: colors.text }}>Cargando vista previa...</div>
          ) : (
            
            
            <iframe src={src as string} title={filename || 'file'} style={{ width: '100%', height: '100%', border: 'none' }} />
          )}
        </div>
      );
    }
    
    
    if (Platform.OS === 'web') {
      const src = blobUrl || url;
      return (
        <div style={{ width: '100%', height: '100%' }}>
          {loadingBlob ? (
            <div style={{ color: colors.text }}>Cargando vista previa...</div>
          ) : (
            
            
            <iframe src={src as string} title={filename || 'file'} style={{ width: '100%', height: '100%', border: 'none' }} />
          )}
        </div>
      );
    }
    
    
    try {
      const { WebView } = require('react-native-webview');
      return <WebView source={{ uri: url }} style={{ flex: 1 }} />;
    } catch (e) {
      return <Text style={{ color: colors.text }}>No se puede mostrar este archivo. Puedes descargarlo para verlo localmente.</Text>;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}> 
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Cerrar">
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.filename, { color: theme.colors.text }]} numberOfLines={1}>{filename}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.content}>
          {renderContent()}
        </View>
        <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Puedes descargar el archivo desde las opciones del módulo.</Text>
        </View>

        {}
        {embeddedViewerUrl && (
          <Modal visible={!!embeddedViewerUrl} animationType="slide" onRequestClose={() => setEmbeddedViewerUrl(null)}>
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
              <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}> 
                <TouchableOpacity onPress={() => setEmbeddedViewerUrl(null)} style={styles.closeBtn} accessibilityLabel="Cerrar">
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={[styles.filename, { color: theme.colors.text }]} numberOfLines={1}>Visor integrado</Text>
                <View style={{ width: 40 }} />
              </View>

              <View style={{ flex: 1 }}>
                {Platform.OS === 'web' ? (
                  
                  
                  <iframe src={embeddedViewerUrl || ''} title="Visor integrado" style={{ width: '100%', height: '100%', border: 'none' }} />
                ) : (
                  (() => {
                    try {
                      
                      const { WebView } = require('react-native-webview');
                      return (
                        <WebView
                          originWhitelist={["*"]}
                          source={{ uri: embeddedViewerUrl as string }}
                          startInLoadingState
                          javaScriptEnabled
                          domStorageEnabled
                          mixedContentMode="always"
                          onHttpError={(ev: any) => {
                            
                            Alert.alert('Error', 'El visor integrado devolvió un error al cargar el archivo. Puedes solicitar conversión o descargar el archivo.', [
                              { text: 'Cerrar', style: 'cancel', onPress: () => setEmbeddedViewerUrl(null) },
                              { text: 'Solicitar conversión', onPress: async () => {
                                  setEmbeddedViewerUrl(null);
                                  setConversionError(null);
                                  setConversionLoading(true);
                                  try {
                                    const signed = await storageService.getCourseContentUrl(originalPath || '', 3600);
                                    const { data } = await supabase.auth.getSession();
                                    const session = (data as any)?.session;
                                    const token = session?.access_token || null;
                                    const resp = await fetch('/api/convert', {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                      },
                                      body: JSON.stringify({ signedUrl: signed, path: originalPath || '' }),
                                    });

                                    if (!resp.ok) {
                                      Alert.alert('Conversión', 'No fue posible convertir el archivo');
                                      return;
                                    }

                                    const json = await resp.json();
                                    if (json?.pdfSignedUrl) {
                                      const r = await fetch(json.pdfSignedUrl);
                                      if (r.ok) {
                                        const b = await r.blob();
                                        const obj = URL.createObjectURL(b);
                                        setBlobUrl(obj);
                                      }
                                    }
                                  } catch (err) {
                                    ', err);
                                    Alert.alert('Conversión', 'Error durante la conversión');
                                  } finally {
                                    setConversionLoading(false);
                                  }
                                } },
                            ]);
                          }}
                          onError={(e: any) => {
                            
                            Alert.alert('Error', 'No fue posible cargar el visor integrado. Puedes descargar el archivo o solicitar conversión.');
                          }}
                          style={{ flex: 1 }}
                        />
                      );
                    } catch (e) {
                      return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>No fue posible abrir el visor integrado en este dispositivo.</Text></View>;
                    }
                  })()
                )}
              </View>
            </View>
          </Modal>
        )}

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderBottomWidth: 1 },
  filename: { flex: 1, fontWeight: '700', marginLeft: 8 },
  closeBtn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  footer: { padding: 10, borderTopWidth: 1 },
  media: { width: '100%', height: '100%' }
});