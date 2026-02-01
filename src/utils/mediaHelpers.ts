
export const getYouTubeId = (url?: string | null): string | null => {
  if (!url) return null;
  try {
    const u = String(url).trim();
    
    const m = u.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{11})/);
    if (m && m[1]) return m[1];
    
    const q = u.match(/[?&]v=([A-Za-z0-9_-]{11})/);
    if (q && q[1]) return q[1];
    
    const s = u.match(/shorts\/([A-Za-z0-9_-]{11})/);
    if (s && s[1]) return s[1];
    return null;
  } catch (err) {
    return null;
  }
};

export const buildYouTubeEmbedUrl = (videoId: string) => `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
export const buildYouTubeThumbnail = (videoId: string) => `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

export default { getYouTubeId, buildYouTubeEmbedUrl, buildYouTubeThumbnail };