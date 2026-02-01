declare module 'expo-document-picker' {
  export function getDocumentAsync(options?: any): Promise<any>;
  export interface DocumentResult {
    type: 'success' | 'cancel';
    mimeType?: string;
    name?: string;
    uri?: string;
    size?: number;
    assets?: any[];
  }
  export default { getDocumentAsync };
}
