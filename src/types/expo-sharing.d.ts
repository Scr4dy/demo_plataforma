declare module 'expo-sharing' {
  export function shareAsync(uri: string, options?: { dialogTitle?: string; UTI?: string; mimeType?: string; });
  export function isAvailableAsync(): Promise<boolean>;
  export default { shareAsync, isAvailableAsync };
}