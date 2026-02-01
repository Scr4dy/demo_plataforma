
import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserAvatarProps {
  
  uri: string | null;
  
  size?: number;
  
  userName?: string;
  
  backgroundColor?: string;
  
  borderColor?: string;
  
  borderWidth?: number;
  
  loading?: boolean;
  
  style?: ViewStyle;
  
  showAdminBadge?: boolean;
  
  onPress?: () => void;
}

export function UserAvatar({
  uri,
  size = 50,
  userName = 'Usuario',
  backgroundColor = '#2196F3',
  borderColor = '#fff',
  borderWidth = 2,
  loading = false,
  style,
  showAdminBadge = false,
  onPress,
}: UserAvatarProps) {
  
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(userName);

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth,
    borderColor,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: uri ? 'transparent' : backgroundColor,
  };

  const content = (
    <View style={[containerStyle, style]}>
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : uri ? (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
            {initials}
          </Text>
        </View>
      )}

      {}
      {showAdminBadge && (
        <View
          style={[
            styles.adminBadge,
            {
              width: size * 0.33,
              height: size * 0.33,
              borderRadius: size * 0.165,
              bottom: -2,
              right: -2,
            },
          ]}
        >
          <Ionicons name="shield-checkmark" size={size * 0.2} color="#fff" />
        </View>
      )}
    </View>
  );

  
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={styles.touchable}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  touchable: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  adminBadge: {
    position: 'absolute',
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});

export default UserAvatar;
