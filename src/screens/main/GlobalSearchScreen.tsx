

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation.types';
import { SearchBar } from '../../components/common/SearchBar';
import { TypeIconBadge } from '../../components/common/TypeIconBadge';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { globalSearch } from '../../services/searchService';
import { SearchResult, SearchResultType, SearchFilters } from '../../types/search.types';
import {
  getSearchTypeIcon,
  getSearchTypeColor,
  getSearchTypeLabel,
} from '../../utils/typeHelpers';
import { getLoadingMessage, getEmptyStateMessage } from '../../utils/personalizedMessages';
import InlineHeader from '../../components/common/InlineHeader';

const GlobalSearchScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { state } = useAuth();
  const { theme, colors } = useTheme();
  const isAdmin = state.user?.role === 'admin';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [selectedTypes, setSelectedTypes] = useState<SearchResultType[]>([
    'course',
    'category',
    ...(isAdmin ? ['user' as SearchResultType] : []),
  ]);
  const [executionTime, setExecutionTime] = useState(0);

  
  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await globalSearch(
          {
            query,
            filters: { ...filters, types: selectedTypes },
            limit: 50,
            sortBy: 'relevance',
          },
          isAdmin
        );

        setResults(response.results);
        setExecutionTime(response.executionTime);
      } catch (error) {
        
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [query, selectedTypes, filters, isAdmin]);

  const handleResultPress = (result: SearchResult) => {
    switch (result.type) {
      case 'course':
        if (Platform.OS === 'web') {
          const { goToWebRoute } = require('../../utils/webNav');
          goToWebRoute('CourseDetail', { courseId: result.id });
        } else {
          navigation.navigate('CourseDetail', { courseId: result.id });
        }
        break;
      case 'category':
        if (Platform.OS === 'web') {
          const { goToWebTab } = require('../../utils/webNav');
          goToWebTab('Categories', { initialCategory: result.title });
        } else {
          navigation.navigate('Categories', { initialCategory: result.title });
        }
        break;
      case 'user':
        if (isAdmin) {
          navigation.navigate('UserForm', { userId: result.id });
        }
        break;
      case 'certificate':
        
        navigation.navigate('Certificates');
        break;
    }
  };

  const toggleType = (type: SearchResultType) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<SearchResultType, SearchResult[]>);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {}
      <InlineHeader title="Buscar" backTo="Dashboard" showOnWeb={false} forceBackOnMobile={true} containerStyle={{ backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }} />

      {}
      <View style={[styles.header, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar cursos, categorías, usuarios..."
          autoFocus={true}
          showCancel={true}
          onCancel={() => navigation.goBack()}
        />
      </View>

      {}
      <View style={[styles.filtersContainer, { borderBottomColor: theme.colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FilterChip
            label="Cursos"
            icon="school-outline"
            active={selectedTypes.includes('course')}
            onPress={() => toggleType('course')}
            colors={colors}
          />
          <FilterChip
            label="Categorías"
            icon="layers-outline"
            active={selectedTypes.includes('category')}
            onPress={() => toggleType('category')}
            colors={colors}
          />
          {isAdmin && (
            <FilterChip
              label="Usuarios"
              icon="person-outline"
              active={selectedTypes.includes('user')}
              onPress={() => toggleType('user')}
              colors={colors}
            />
          )}
          <FilterChip
            label="Certificados"
            icon="ribbon-outline"
            active={selectedTypes.includes('certificate')}
            onPress={() => toggleType('certificate')}
            colors={colors}
          />
        </ScrollView>
      </View>

      {}
      <ScrollView style={styles.resultsContainer}>
        {loading && query.length >= 2 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>{getLoadingMessage('general')}</Text>
          </View>
        ) : query.length < 2 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color={theme.dark ? '#555' : '#ccc'} />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>Buscar en todo</Text>
            <Text style={[styles.emptyStateText, { color: theme.dark ? '#999' : '#666' }]}>
              Escribe al menos 2 caracteres para comenzar la búsqueda
            </Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color={theme.dark ? '#555' : '#ccc'} />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>Sin resultados</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Text style={[styles.emptyStateText, { color: theme.dark ? '#999' : '#666' }]}>
                {getEmptyStateMessage('search')} Intenta con otros términos
              </Text>
              <Ionicons name="bulb-outline" size={16} color={theme.dark ? '#999' : '#666'} style={{ marginLeft: 4 }} />
            </View>
          </View>
        ) : (
          <>
            {}
            <View style={[styles.resultsInfo, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}> 
              <Text style={[styles.resultsCount, { color: theme.colors.text }]}> 
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </Text>
              <Text style={[styles.executionTime, { color: theme.colors.textSecondary }]}> 
                {executionTime}ms
              </Text>
            </View> 

            {}
            {Object.entries(groupedResults).map(([type, typeResults]) => (
              <View key={type} style={styles.resultGroup}>
                <View style={[styles.groupHeader, { backgroundColor: theme.dark ? 'rgba(255,255,255,0.02)' : '#f8f9fa' }]}>
                  <Ionicons
                    name={getSearchTypeIcon(type as SearchResultType) as any}
                    size={20}
                    color={getSearchTypeColor(type as SearchResultType)}
                  />
                  <Text style={[styles.groupTitle, { color: theme.colors.text }]}> 
                    {getSearchTypeLabel(type as SearchResultType)}s ({typeResults.length})
                  </Text>
                </View> 

                {typeResults.map(result => (
                  <SearchResultItem
                    key={result.id}
                    result={result}
                    onPress={() => handleResultPress(result)}
                  />
                ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

interface FilterChipProps {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
  colors: any;
}

const FilterChip: React.FC<FilterChipProps> = ({ label, icon, active, onPress, colors }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.filterChip, { backgroundColor: active ? colors.primary : theme.colors.card }, active && [styles.filterChipActive, { backgroundColor: colors.primary }]]}
      onPress={onPress}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={active ? '#fff' : theme.colors.textSecondary}
      />
      <Text style={[styles.filterChipText, { color: active ? '#fff' : theme.colors.textSecondary }, active && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
} 

interface SearchResultItemProps {
  result: SearchResult;
  onPress: () => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ result, onPress }) => {
  const { theme, colors } = useTheme();
  return (
    <TouchableOpacity style={[styles.resultItem, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]} onPress={onPress}>
      <TypeIconBadge
        iconName={getSearchTypeIcon(result.type)}
        color="#fff"
        backgroundColor={getSearchTypeColor(result.type)}
        style={styles.resultIcon}
      />

      <View style={styles.resultContent}>
        <Text style={[styles.resultTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {result.title}
        </Text>
        {result.subtitle && (
          <Text style={[styles.resultSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {result.subtitle}
          </Text>
        )}
        {result.description && (
          <Text style={[styles.resultDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {result.description}
          </Text>
        )}
      </View> 

      <Ionicons name="chevron-forward" size={20} color={theme.colors.icon} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  executionTime: {
    fontSize: 12,
    color: '#999',
  },
  resultGroup: {
    marginTop: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
});

export default GlobalSearchScreen;
