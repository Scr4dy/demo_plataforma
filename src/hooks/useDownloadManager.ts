
import { useState, useCallback } from 'react';

export const useDownloadManager = () => {
  const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  const downloadResource = useCallback(async (resourceId: string, resourceUrl: string) => {
    setDownloadProgress(prev => ({ ...prev, [resourceId]: 0 }));
    
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setDownloadProgress(prev => ({ ...prev, [resourceId]: i }));
    }
    
    setTimeout(() => {
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[resourceId];
        return newProgress;
      });
    }, 1000);
  }, []);

  const downloadAllResources = useCallback(async (resources: Array<{ id: string; url: string }>) => {
    setIsDownloadingAll(true);
    
    try {
      await Promise.all(
        resources.map(resource => downloadResource(resource.id, resource.url))
      );
    } finally {
      setIsDownloadingAll(false);
    }
  }, [downloadResource]);

  return {
    downloadResource,
    downloadAllResources,
    downloadProgress,
    isDownloadingAll
  };
};