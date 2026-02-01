import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  Alert,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Audio } from "expo-av";

import YoutubePlayer from "react-native-youtube-iframe";
import { useTheme } from "../../context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { QuizComponent } from "./QuizComponent";
import { ResultadoQuiz } from "../../types/quiz.types";
import { quizService } from "../../services/quizService";

interface ContentViewerProps {
  url: string | null;
  proxyUrl?: string | null;
  tipo: string;
  titulo: string;
  metadata?: any;
  idContenido?: number;
  onQuizComplete?: (resultado: ResultadoQuiz) => void;
}

export const ContentViewer: React.FC<ContentViewerProps> = ({
  url,
  proxyUrl = null,
  tipo,
  titulo,
  metadata = {},
  idContenido,
  onQuizComplete,
}) => {
  const { theme, colors } = useTheme();
  const { width } = Dimensions.get("window");
  const [error, setError] = useState<string | null>(null);
  const [videoFallbackToWeb, setVideoFallbackToWeb] = useState<boolean>(false);

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfFallbackViewerUrl, setPdfFallbackViewerUrl] = useState<
    string | null
  >(null);

  const [hasQuiz, setHasQuiz] = useState<boolean>(false);
  const [checkingQuiz, setCheckingQuiz] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      if (!idContenido) {
        setHasQuiz(false);
        setCheckingQuiz(false);
        return;
      }
      setCheckingQuiz(true);
      try {
        const preguntas = await quizService.getPreguntasQuiz(idContenido);
        if (!mounted) return;
        setHasQuiz(Array.isArray(preguntas) && preguntas.length > 0);
      } catch (e) {
        if (!mounted) return;
        setHasQuiz(false);
      } finally {
        if (mounted) setCheckingQuiz(false);
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [idContenido]);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    async function fetchPdfBlob() {
      if (Platform.OS !== "web") return;
      if (!url) return;
      const isPdf = String(url || "")
        .toLowerCase()
        .includes(".pdf");
      if (!isPdf) return;
      setPdfLoading(true);
      setPdfFallbackViewerUrl(null);
      const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
      try {
        const res = await fetch(url, { method: "GET" });
        if (!active) return;
        if (!res.ok) {
          setPdfFallbackViewerUrl(viewerUrl);
          return;
        }

        const contentDisp = res.headers.get("content-disposition") || "";
        if (contentDisp.toLowerCase().includes("attachment")) {
          setPdfFallbackViewerUrl(viewerUrl);
          return;
        }

        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (active) setPdfBlobUrl(objectUrl);
      } catch (err) {
        if (active) setPdfFallbackViewerUrl(viewerUrl);
        if (active) setPdfBlobUrl(null);
      } finally {
        if (active) setPdfLoading(false);
      }
    }
    fetchPdfBlob();
    return () => {
      active = false;
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch (e) {}
      }
      setPdfBlobUrl(null);
    };
  }, [url]);

  if (!url && !hasQuiz && !checkingQuiz && tipo !== "evaluacion") {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
        <MaterialIcons name="error-outline" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>
          No hay URL disponible para este contenido
        </Text>
      </View>
    );
  }

  const safeUrl = url ?? "";

  const renderVideoPlayer = () => {
    const safeUrl = url ?? "";
    const isYoutube =
      safeUrl.includes("youtube.com") || safeUrl.includes("youtu.be");
    const isVimeo = safeUrl.includes("vimeo.com");

    const directExtMatch = safeUrl.split("?")[0].match(/\.([a-z0-9]+)$/i);
    const ext = directExtMatch ? (directExtMatch[1] || "").toLowerCase() : "";
    const directVideoExts = ["mp4", "mov", "webm", "m3u8", "mkv", "avi"];
    const isDirectVideo =
      directVideoExts.includes(ext) ||
      /\.(mp4|webm|mov|m3u8|mkv|avi)($|\?)/i.test(safeUrl);
    if (isYoutube) {
      const videoId = extractYoutubeId(safeUrl);
      return (
        <View style={styles.videoContainer}>
          <YoutubePlayer
            height={(width * 9) / 16}
            videoId={videoId}
            onError={(error: any) => {
              setError("Error al cargar el video de YouTube");
            }}
          />
        </View>
      );
    }

    if (isVimeo || tipo === "url_video") {
      let embedUrl = url;

      if (isVimeo) {
        const videoId = extractVimeoId(safeUrl);
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }

      if (Platform.OS === "web") {
        return (
          <div style={{ width: "100%", height: "100%" }}>
            <iframe
              src={embedUrl ?? ""}
              title={titulo}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>
        );
      }

      try {
        const { WebView } = require("react-native-webview");
        return (
          <View style={styles.videoContainer}>
            <WebView
              source={{ uri: embedUrl ?? "" }}
              style={styles.webView}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              onError={(syntheticEvent: any) => {
                const { nativeEvent } = syntheticEvent;

                setError("Error al cargar el video");
              }}
            />
          </View>
        );
      } catch (err: any) {
        setError("No fue posible cargar el visor de video nativo");
        return null;
      }
    }

    if (!isDirectVideo || videoFallbackToWeb) {
      if (Platform.OS === "web") {
        return (
          <div style={{ width: "100%", height: "100%" }}>
            <iframe
              src={safeUrl ?? ""}
              title={titulo}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>
        );
      }

      try {
        const { WebView } = require("react-native-webview");
        const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#000"><video controls style="width:100%;height:100%" src="${safeUrl}">Your device does not support HTML5 video.</video></body></html>`;
        return (
          <View style={styles.videoContainer}>
            <WebView
              originWhitelist={["*"]}
              source={{ html }}
              style={styles.webView}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              onError={(syntheticEvent: any) => {
                // Log removed
                setError("Error al cargar el video en WebView");
              }}
            />
          </View>
        );
      } catch (err: any) {
        setError("No fue posible cargar el visor de video");
        return null;
      }
    }

    return (
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: safeUrl }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
          onError={(error: any) => {
            if (!videoFallbackToWeb) {
              setVideoFallbackToWeb(true);
            } else {
              setError("Error al cargar el video");
            }
          }}
        />
      </View>
    );
  };

  const renderAudioPlayer = () => {
    return (
      <View style={[styles.audioContainer, { backgroundColor: colors.card }]}>
        <MaterialIcons name="music-note" size={64} color={colors.primary} />
        <Text style={[styles.audioTitle, { color: colors.text }]}>
          {titulo}
        </Text>
        <Video
          source={{ uri: safeUrl }}
          style={styles.audioPlayer}
          useNativeControls
          shouldPlay={false}
          onError={(error) => {
            setError("Error al cargar el audio");
          }}
        />
      </View>
    );
  };

  const renderPdfViewer = () => {
    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url || "")}&embedded=true`;

    if (Platform.OS === "web") {
      if (pdfLoading) {
        return (
          <div
            style={{
              width: "100%",
              height: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ color: colors.text }}>Cargando PDF...</div>
          </div>
        );
      }

      if (pdfFallbackViewerUrl) {
        return (
          <div style={{ width: "100%", height: 600 }}>
            <iframe
              src={pdfFallbackViewerUrl}
              title={titulo}
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          </div>
        );
      }

      const src = pdfBlobUrl || proxyUrl || url || "";

      return (
        <div style={{ width: "100%", height: 600 }}>
          <iframe
            src={src}
            title={titulo}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>
      );
    }

    try {
      const { WebView } = require("react-native-webview");
      return (
        <View style={styles.documentContainer}>
          <WebView
            source={{ uri: viewerUrl }}
            style={styles.webView}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <Text style={{ color: colors.text }}>Cargando PDF...</Text>
              </View>
            )}
            onError={(syntheticEvent: any) => {
              const { nativeEvent } = syntheticEvent;

              setError("Error al cargar el PDF");
            }}
          />
        </View>
      );
    } catch (err) {
      setError("No fue posible cargar el visor de PDF nativo");
      return null;
    }
  };

  const renderDocumentViewer = () => {
    const docSource = Platform.OS === "web" ? proxyUrl || url : url;
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(docSource || "")}`;
    if (Platform.OS === "web") {
      return (
        <div style={{ width: "100%", height: 600 }}>
          <iframe
            src={viewerUrl}
            title={titulo}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>
      );
    }

    try {
      const { WebView } = require("react-native-webview");
      return (
        <View style={styles.documentContainer}>
          <WebView
            source={{ uri: viewerUrl }}
            style={styles.webView}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <Text style={{ color: colors.text }}>
                  Cargando documento...
                </Text>
              </View>
            )}
            onError={(syntheticEvent: any) => {
              const { nativeEvent } = syntheticEvent;

              setError("Error al cargar el documento");
            }}
            javaScriptEnabled
            domStorageEnabled
          />
        </View>
      );
    } catch (err) {
      setError("No fue posible cargar el visor de documentos nativo");
      return null;
    }
  };

  const renderPresentationViewer = () => {
    const presSource = Platform.OS === "web" ? proxyUrl || url : url;
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(presSource || "")}`;
    if (Platform.OS === "web") {
      return (
        <div style={{ width: "100%", height: 600 }}>
          <iframe
            src={viewerUrl}
            title={titulo}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>
      );
    }

    try {
      const { WebView } = require("react-native-webview");
      return (
        <View style={styles.documentContainer}>
          <WebView
            source={{ uri: viewerUrl }}
            style={styles.webView}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <Text style={{ color: colors.text }}>
                  Cargando presentación...
                </Text>
              </View>
            )}
            onError={(syntheticEvent: any) => {
              const { nativeEvent } = syntheticEvent;

              setError("Error al cargar la presentación");
            }}
            javaScriptEnabled
            domStorageEnabled
          />
        </View>
      );
    } catch (err) {
      setError("No fue posible cargar el visor de presentaciones nativo");
      return null;
    }
  };

  const renderImageViewer = () => {
    if (Platform.OS === "web") {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "#000",
            padding: 12,
          }}
        >
          <img
            src={url ?? ""}
            alt={titulo}
            style={{
              maxWidth: "100%",
              maxHeight: "80vh",
              objectFit: "contain",
            }}
          />
        </div>
      );
    }

    try {
      const { WebView } = require("react-native-webview");
      return (
        <View style={styles.imageContainer}>
          <WebView
            source={{
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
                    <style>
                      body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: #000; min-height: 100vh; }
                      img { max-width: 100%; max-height: 100vh; object-fit: contain; }
                    </style>
                  </head>
                  <body>
                    <img src="${url}" alt="${titulo}" />
                  </body>
                </html>
              `,
            }}
            style={styles.webView}
            scalesPageToFit
            onError={() => setError("Error al cargar la imagen")}
          />
        </View>
      );
    } catch (err) {
      setError("No fue posible cargar la imagen en el visor nativo");
      return null;
    }
  };

  const renderWebViewer = () => {
    if (Platform.OS === "web") {
      return (
        <div style={{ width: "100%", height: 600 }}>
          <iframe
            src={url as string}
            title={titulo}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>
      );
    }

    try {
      const { WebView } = require("react-native-webview");
      return (
        <View style={styles.documentContainer}>
          <WebView
            source={{ uri: url }}
            style={styles.webView}
            startInLoadingState
            onError={() => setError("Error al cargar el contenido")}
          />
        </View>
      );
    } catch (err) {
      setError("No fue posible cargar el contenido en el visor nativo");
      return null;
    }
  };

  const renderEvaluacion = () => {
    if (!idContenido) {
      return (
        <View
          style={[styles.evaluacionContainer, { backgroundColor: colors.card }]}
        >
          <MaterialIcons name="assignment" size={64} color={colors.error} />
          <Text style={[styles.evaluacionTitle, { color: colors.text }]}>
            Error
          </Text>
          <Text
            style={[styles.evaluacionText, { color: colors.textSecondary }]}
          >
            No se pudo cargar el quiz
          </Text>
        </View>
      );
    }

    return (
      <QuizComponent
        idContenido={idContenido}
        onComplete={(resultado) => {
          if (onQuizComplete) {
            onQuizComplete(resultado);
          }
        }}
      />
    );
  };

  const renderUnsupportedType = () => {
    return (
      <View
        style={[styles.unsupportedContainer, { backgroundColor: colors.card }]}
      >
        <MaterialIcons
          name="help-outline"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={[styles.unsupportedTitle, { color: colors.text }]}>
          Tipo de contenido no soportado
        </Text>
        <Text style={[styles.unsupportedText, { color: colors.textSecondary }]}>
          Tipo: {tipo}
        </Text>
      </View>
    );
  };

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
        <MaterialIcons name="error-outline" size={64} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      </View>
    );
  }

  if (hasQuiz) {
    return renderEvaluacion();
  }

  switch (tipo) {
    case "video":
    case "url_video":
      return renderVideoPlayer();

    case "audio":
      return renderAudioPlayer();

    case "documento":
      if ((url ?? "").includes(".pdf")) {
        return renderPdfViewer();
      }
      return renderDocumentViewer();

    case "presentacion":
      return renderPresentationViewer();

    case "imagen":
      return renderImageViewer();

    case "enlace":
    case "url_enlace":
    case "url_documento":
      return renderWebViewer();

    case "evaluacion":
      return renderEvaluacion();

    default:
      return renderUnsupportedType();
  }
};

const extractYoutubeId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : "";
};

const extractVimeoId = (url: string): string => {
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : "";
};

const styles = StyleSheet.create({
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  audioContainer: {
    width: "100%",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    gap: 16,
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  audioPlayer: {
    width: "100%",
    height: 60,
  },
  documentContainer: {
    width: "100%",
    height: 600,
    borderRadius: 12,
    overflow: "hidden",
  },
  documentPreview: {
    width: "100%",
    minHeight: 400,
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    gap: 12,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  documentHint: {
    fontSize: 14,
    textAlign: "center",
  },
  imageContainer: {
    width: "100%",
    minHeight: 400,
    borderRadius: 12,
    overflow: "hidden",
  },
  webView: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  evaluacionContainer: {
    width: "100%",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    gap: 16,
  },
  evaluacionTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  evaluacionText: {
    fontSize: 14,
    textAlign: "center",
  },
  unsupportedContainer: {
    width: "100%",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    gap: 16,
  },
  unsupportedTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  unsupportedText: {
    fontSize: 14,
    textAlign: "center",
  },
  errorContainer: {
    width: "100%",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
