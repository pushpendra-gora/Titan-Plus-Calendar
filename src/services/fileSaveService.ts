import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export interface SaveFileResult {
  success: boolean;
  message: string;
  uri?: string;
}

export async function saveAndShareFile(
  fileName: string,
  base64Data: string,
  mimeType: string
): Promise<SaveFileResult> {
  const cleanBase64 = base64Data.includes('base64,')
    ? base64Data.split('base64,')[1]
    : base64Data;

  // 1. Native Mobile (Capacitor Android / iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      // Write file directly to user device's Documents directory
      const fileResult = await Filesystem.writeFile({
        path: fileName,
        data: cleanBase64,
        directory: Directory.Documents,
        recursive: true,
      });

      // Trigger native Android Share/Save sheet so user can view/save/open with PDF reader
      try {
        await Share.share({
          title: fileName,
          text: `${fileName} - Titan Plus Calendar`,
          url: fileResult.uri,
          dialogTitle: `Open or Save ${fileName}`,
        });
      } catch {
        // User may dismiss share dialog, but file is already saved in Documents
      }

      return {
        success: true,
        message: `File saved successfully to Documents: ${fileName}`,
        uri: fileResult.uri,
      };
    } catch (err) {
      console.warn('Documents directory write failed, trying Cache:', err);
      try {
        const cacheResult = await Filesystem.writeFile({
          path: fileName,
          data: cleanBase64,
          directory: Directory.Cache,
          recursive: true,
        });

        await Share.share({
          title: fileName,
          url: cacheResult.uri,
          dialogTitle: `Open or Save ${fileName}`,
        });

        return {
          success: true,
          message: `Saved: ${fileName}`,
          uri: cacheResult.uri,
        };
      } catch (fallbackErr) {
        console.error('Native file save error:', fallbackErr);
      }
    }
  }

  // 2. Web browser fallback (Localhost / Mobile Chrome)
  try {
    const byteCharacters = atob(cleanBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

    return {
      success: true,
      message: `Downloaded: ${fileName}`,
    };
  } catch (webErr) {
    console.error('Web download fallback failed:', webErr);
    return {
      success: false,
      message: 'Failed to download file.',
    };
  }
}
