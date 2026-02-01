import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, Modal, Switch, ScrollView, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { categoryService, Categoria } from '../../services/categoryService';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeader } from '../../context/HeaderContext';

const COLOR_PALETTE = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308',
  '#84CC16', '#22C55E', '#10B981', '#14B8A6',
  '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
  '#F43F5E', '#64748B', '#6B7280', '#71717A',
  '#78716C', '#57534E', '#292524', '#1F2937'
];

const ICON_PALETTE = [
  
  'book', 'school', 'library', 'ribbon', 'easel', 'newspaper',
  
  'briefcase', 'business', 'cash', 'card', 'trending-up', 'analytics',
  
  'code', 'terminal', 'git-branch', 'server', 'cloud', 'desktop',
  
  'build', 'construct', 'hammer', 'settings', 'cog', 'options',
  
  'chatbubbles', 'mail', 'call', 'notifications', 'megaphone', 'radio',
  
  'image', 'camera', 'videocam', 'musical-notes', 'color-palette', 'brush',
  
  'document', 'folder', 'documents', 'archive', 'clipboard', 'reader',
  
  'medkit', 'fitness', 'heart', 'pulse', 'nutrition', 'bandage',
  
  'basketball', 'football', 'bicycle', 'trophy', 'medal', 'podium',
  
  'home', 'location', 'map', 'compass', 'navigate', 'globe',
  
  'leaf', 'planet', 'sunny', 'moon', 'water', 'flame',
  
  'cart', 'storefront', 'pricetag', 'gift', 'wallet', 'restaurant',
  
  'people', 'person', 'happy', 'star', 'shield', 'key'
];

const AdminCategoriesScreen = () => {
  const { theme, colors } = useTheme();
  const navigation = useNavigation();
  const { header, setHeader } = useHeader();
  const isFocused = useIsFocused();
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [icono, setIcono] = useState('folder');
  const [orden, setOrden] = useState('0');
  const [activo, setActivo] = useState(true);

  
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tempColor, setTempColor] = useState('#6B7280');

  
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [tempIcon, setTempIcon] = useState('folder');

  
  const handleOpenColorPicker = useCallback(() => {
    setTempColor(color);
    setShowColorPicker(true);
  }, [color]);

  const handleCancelColorPicker = useCallback(() => {
    setTempColor(color);
    setShowColorPicker(false);
  }, [color]);

  const handleApplyColor = useCallback(() => {
    setColor(tempColor);
    setShowColorPicker(false);
  }, [tempColor]);

  
  const handleOpenIconPicker = useCallback(() => {
    setTempIcon(icono);
    setShowIconPicker(true);
  }, [icono]);

  const handleCancelIconPicker = useCallback(() => {
    setTempIcon(icono);
    setShowIconPicker(false);
  }, [icono]);

  const handleApplyIcon = useCallback(() => {
    setIcono(tempIcon);
    setShowIconPicker(false);
  }, [tempIcon]);

  
  const headerReapplyRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (Platform.OS === 'web') return;

    
    const applyHeader = () => {
      setHeader({
        title: 'Gestión de Categorías',
        subtitle: 'Gestionar categorías del sistema',
        showBack: true,
        manual: true,
        owner: 'AdminCategories'
      });
    };

    if (isFocused) {
      
      applyHeader();
      if (headerReapplyRef.current) clearTimeout(headerReapplyRef.current);
      headerReapplyRef.current = setTimeout(() => {
        applyHeader();
        headerReapplyRef.current = null;
      }, 120);
    } else {
      
      if (header && (header.owner === 'AdminCategories' || (header.manual && header.title === 'Gestión de Categorías'))) {
        setHeader(null);
      }
      if (headerReapplyRef.current) { clearTimeout(headerReapplyRef.current); headerReapplyRef.current = null; }
    }

    
    return () => {
      if (header && (header.owner === 'AdminCategories' || (header.manual && header.title === 'Gestión de Categorías'))) {
        setHeader(null);
      }
      if (headerReapplyRef.current) { clearTimeout(headerReapplyRef.current); headerReapplyRef.current = null; }
    };
  }, [setHeader, navigation, isFocused]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getCategorias({ forceRefresh: true });
      setCategories(data);
    } catch (error) {
      
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cat: Categoria) => {
    setEditingCategory(cat);
    setNombre(cat.nombre);
    setDescripcion(cat.descripcion || '');
    setColor(cat.color || '#6B7280');
    setIcono(cat.icono || 'folder');
    setOrden(String(cat.orden || 0));
    setActivo(cat.activo !== false);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setNombre('');
    setDescripcion('');
    setColor('#6B7280');
    setIcono('folder');
    
    const maxOrden = categories.length > 0
      ? Math.max(...categories.map(cat => cat.orden || 0))
      : 0;
    setOrden(String(maxOrden + 1));
    setActivo(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert('Validación', 'El nombre es obligatorio');
      return;
    }

    try {
      if (editingCategory) {
        await categoryService.updateCategoria(editingCategory.id, {
          nombre,
          descripcion,
          color,
          icono,
          orden: parseInt(orden) || 0,
          activo
        });
      } else {
        await categoryService.createCategoria(
          nombre,
          descripcion,
          color,
          icono,
          parseInt(orden) || 0,
          activo
        );
      }
      setModalVisible(false);
      loadCategories();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la categoría');
    }
  };

  const handleDelete = (cat: Categoria) => {
    Alert.alert(
      'Eliminar Categoría',
      `¿Estás seguro de eliminar "${cat.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoryService.deleteCategoria(cat.id);
              loadCategories();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Categoria }) => (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderLeftWidth: 4, borderLeftColor: item.color || '#6B7280' }]}>
      {}
      <View style={[styles.iconContainer, { backgroundColor: (item.color || '#6B7280') + '15' }]}>
        <Ionicons name={(item.icono || 'folder') as any} size={28} color={item.color || '#6B7280'} />
      </View>

      {}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{item.nombre}</Text>
          {}
          <View style={[styles.orderBadgeSmall, { backgroundColor: (item.color || '#6B7280') + '20' }]}>
            <Text style={[styles.orderTextSmall, { color: item.color || '#6B7280' }]}>#{item.orden || 0}</Text>
          </View>
        </View>
        {!!item.descripcion && (
          <Text style={[styles.desc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.descripcion}
          </Text>
        )}
        {}
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.activo ? colors.success + '15' : theme.colors.error + '15' }
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: item.activo ? colors.success : theme.colors.error }
            ]} />
            <Text style={[
              styles.statusText,
              { color: item.activo ? colors.success : theme.colors.error }
            ]}>
              {item.activo ? 'Activa' : 'Inactiva'}
            </Text>
          </View>
        </View>
      </View>

      {}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.actionBtn, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="pencil" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item)} style={[styles.actionBtn, { backgroundColor: theme.colors.error + '15' }]}>
          <Ionicons name="trash" size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {}
      <View style={{
        backgroundColor: theme.colors.background,
        paddingTop: 10,
        paddingBottom: 16,
        paddingHorizontal: 16,
        zIndex: 10
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <TouchableOpacity
            onPress={handleAdd}
            style={{
              backgroundColor: colors.primary,
              height: 40,
              paddingHorizontal: 16,
              borderRadius: 20,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: 'bold', marginLeft: 6, fontSize: 13 }}>Nueva Categoría</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={categories}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshing={loading}
        onRefresh={loadCategories}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </Text>

            <ScrollView>
              <Text style={[styles.label, { color: theme.colors.text }]}>Nombre</Text>
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder="Nombre de la categoría"
                placeholderTextColor="#999"
              />

              <Text style={[styles.label, { color: theme.colors.text }]}>Descripción</Text>
              <TextInput
                value={descripcion}
                onChangeText={setDescripcion}
                style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                placeholder="Descripción opcional"
                placeholderTextColor="#999"
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Color (Hex)</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <TouchableOpacity
                      onPress={handleOpenColorPicker}
                      style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: color, borderWidth: 2, borderColor: '#ccc' }}
                    />
                    <TextInput
                      value={color}
                      onChangeText={setColor}
                      style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: theme.colors.background, color: theme.colors.text }]}
                      placeholder="#RRGGBB"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Icono (Ionicons)</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <TouchableOpacity
                      onPress={handleOpenIconPicker}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: theme.colors.background,
                        borderWidth: 2,
                        borderColor: '#ccc',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}
                    >
                      <Ionicons name={icono as any} size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <TextInput
                      value={icono}
                      onChangeText={setIcono}
                      style={[styles.input, { flex: 1, marginBottom: 0, backgroundColor: theme.colors.background, color: theme.colors.text }]}
                      placeholder="folder"
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Orden</Text>
                  <TextInput
                    value={orden}
                    onChangeText={setOrden}
                    keyboardType="numeric"
                    style={[styles.input, { backgroundColor: theme.colors.background, color: theme.colors.text }]}
                    placeholder="0"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={[styles.label, { color: theme.colors.text, marginBottom: 8 }]}>Activo</Text>
                  <Switch
                    value={activo}
                    onValueChange={setActivo}
                    trackColor={{ false: "#767577", true: colors.primary }}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtn}>
                <Text style={{ color: theme.colors.error }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.modalBtn, { backgroundColor: colors.primary }]}>
                <Text style={{ color: '#fff' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {}
      <Modal visible={showColorPicker} transparent animationType="fade">
        <View style={styles.colorPickerOverlay}>
          <View style={[styles.colorPickerContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text, marginBottom: 16 }]}>
              Seleccionar Color
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {}
              <View style={styles.colorGrid}>
                {COLOR_PALETTE.map((paletteColor) => (
                  <TouchableOpacity
                    key={paletteColor}
                    onPress={() => setTempColor(paletteColor)}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: paletteColor },
                      tempColor.toUpperCase() === paletteColor.toUpperCase() && styles.colorSwatchSelected
                    ]}
                  >
                    {tempColor.toUpperCase() === paletteColor.toUpperCase() && (
                      <Ionicons name="checkmark" size={24} color="#fff" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {}
              <View style={{ marginTop: 20 }}>
                <Text style={[styles.label, { color: theme.colors.text, marginBottom: 8 }]}>O ingresa código hexadecimal:</Text>
                <TextInput
                  value={tempColor}
                  onChangeText={setTempColor}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      marginBottom: 0
                    }
                  ]}
                  placeholder="#RRGGBB"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={handleCancelColorPicker}
                style={styles.modalBtn}
              >
                <Text style={{ color: theme.colors.error }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApplyColor}
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: '#fff' }}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {}
      <Modal visible={showIconPicker} transparent animationType="fade">
        <View style={styles.colorPickerOverlay}>
          <View style={[styles.colorPickerContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text, marginBottom: 16 }]}>
              Seleccionar Icono
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {}
              <View style={styles.iconGrid}>
                {ICON_PALETTE.map((paletteIcon) => (
                  <TouchableOpacity
                    key={paletteIcon}
                    onPress={() => setTempIcon(paletteIcon)}
                    style={[
                      styles.iconSwatch,
                      { backgroundColor: theme.colors.background },
                      tempIcon === paletteIcon && styles.iconSwatchSelected
                    ]}
                  >
                    <Ionicons
                      name={paletteIcon as any}
                      size={28}
                      color={tempIcon === paletteIcon ? colors.primary : theme.colors.text}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {}
              <View style={{ marginTop: 20 }}>
                <Text style={[styles.label, { color: theme.colors.text, marginBottom: 8 }]}>O ingresa nombre del icono:</Text>
                <TextInput
                  value={tempIcon}
                  onChangeText={setTempIcon}
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.colors.background,
                      color: theme.colors.text,
                      marginBottom: 0
                    }
                  ]}
                  placeholder="folder"
                  placeholderTextColor="#999"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={handleCancelIconPicker}
                style={styles.modalBtn}
              >
                <Text style={{ color: theme.colors.error }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleApplyIcon}
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              >
                <Text style={{ color: '#fff' }}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  orderBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  orderBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8
  },
  orderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  orderTextSmall: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  title: { fontSize: 17, fontWeight: '700' },
  desc: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  label: { marginBottom: 8, fontWeight: '600' },
  input: { padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#eee' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 12 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  colorPickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  colorPickerContent: { borderRadius: 20, padding: 24, width: '90%', maxWidth: 400 },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center'
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  colorSwatchSelected: {
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center'
  },
  iconSwatch: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent'
  },
  iconSwatchSelected: {
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4
  }
});

export default AdminCategoriesScreen;
