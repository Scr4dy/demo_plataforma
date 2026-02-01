
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CourseCategory } from '../../types/course.types';

const CATEGORIES: { key: CourseCategory; label: string; icon: string; color: string }[] = [
  {
    key: 'recursos-humanos',
    label: 'Recursos Humanos',
    icon: 'people',
    color: '#3b82f6'
  },
  {
    key: 'seguridad-higiene',
    label: 'Seguridad e Higiene',
    icon: 'shield-checkmark',
    color: '#10b981'
  },
  {
    key: 'desarrollo-personal',
    label: 'Desarrollo Personal',
    icon: 'person',
    color: '#8b5cf6'
  },
  {
    key: 'tecnologia',
    label: 'Tecnología',
    icon: 'laptop',
    color: '#ef4444'
  },
  {
    key: 'marketing',
    label: 'Marketing',
    icon: 'megaphone',
    color: '#f59e0b'
  },
  {
    key: 'gestion',
    label: 'Gestión',
    icon: 'business',
    color: '#06b6d4'
  },
  {
    key: 'finanzas',
    label: 'Finanzas',
    icon: 'cash',
    color: '#84cc16'
  },
  {
    key: 'operaciones',
    label: 'Operaciones',
    icon: 'settings',
    color: '#f97316'
  }
];

interface CategoryFilterProps {
  selectedCategory: CourseCategory | 'all';
  onCategorySelect: (category: CourseCategory | 'all') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategorySelect
}) => {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === 'all' && styles.categoryButtonActive
        ]}
        onPress={() => onCategorySelect('all')}
      >
        <Ionicons 
          name="grid" 
          size={20} 
          color={selectedCategory === 'all' ? '#ffffff' : '#6b7280'} 
        />
        <Text style={[
          styles.categoryText,
          selectedCategory === 'all' && styles.categoryTextActive
        ]}>
          Todos
        </Text>
      </TouchableOpacity>

      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.key}
          style={[
            styles.categoryButton,
            selectedCategory === category.key && [
              styles.categoryButtonActive,
              { backgroundColor: category.color }
            ]
          ]}
          onPress={() => onCategorySelect(category.key)}
        >
          <Ionicons 
            name={category.icon as any} 
            size={20} 
            color={selectedCategory === category.key ? '#ffffff' : category.color} 
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === category.key && styles.categoryTextActive
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    marginVertical: 16,
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  categoryButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
});