

import { courseService } from './courseService';
import { categoryService } from './categoryService';
import { userService } from './userService';
import { certificateService } from './certificateService';
import {
  SearchResult,
  SearchOptions,
  SearchResponse,
  SearchResultType,
} from '../types/search.types';
import { getCourseDurationHours } from '../utils/courseHelpers';

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const calculateRelevance = (searchTerms: string[], text: string): number => {
  const normalizedText = normalizeText(text);
  let score = 0;

  searchTerms.forEach(term => {
    const normalizedTerm = normalizeText(term);
    
    
    if (normalizedText === normalizedTerm) {
      score += 100;
    }
    
    else if (normalizedText.startsWith(normalizedTerm)) {
      score += 50;
    }
    
    else if (normalizedText.includes(normalizedTerm)) {
      score += 25;
    }
    
    else {
      const words = normalizedText.split(' ');
      words.forEach(word => {
        if (word.startsWith(normalizedTerm)) {
          score += 10;
        } else if (word.includes(normalizedTerm)) {
          score += 5;
        }
      });
    }
  });

  return score;
};

const searchCourses = async (query: string, limit: number = 20): Promise<SearchResult[]> => {
  try {
    const courses = await courseService.getMyCourses();
    const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 0);

    const results = courses
      .map(course => {
        const relevance = calculateRelevance(
          searchTerms,
          `${course.titulo} ${course.descripcion || ''} ${course.instructor || ''}`
        );

        return {
          id: course.id.toString(),
          type: 'course' as SearchResultType,
          title: course.titulo,
          subtitle: course.instructor || 'Sin instructor',
          description: course.descripcion,
          imageUrl: course.imagenUrl,
          category: course.categoria ?? undefined,
          status: course.estado,
          date: undefined,
          relevance,
        };
      })
      .filter(result => result.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    return results.map(({ relevance, ...rest }) => rest);
  } catch (error) {
    
    return [];
  }
};

const searchCategories = async (query: string, limit: number = 10): Promise<SearchResult[]> => {
  try {
    const categories = await categoryService.getCategorias();
    const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 0);

    const results = categories
      .map(category => {
        const relevance = calculateRelevance(
          searchTerms,
          `${category.nombre} ${category.descripcion || ''}`
        );

        return {
          id: category.id.toString(),
          type: 'category' as SearchResultType,
          title: category.nombre,
          subtitle: `Categoría`,
          description: category.descripcion,
          category: undefined,
          date: undefined,
          relevance,
        };
      })
      .filter(result => result.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    return results.map(({ relevance, ...rest }) => rest);
  } catch (error) {
    
    return [];
  }
};

const searchUsers = async (query: string, limit: number = 10, isAdmin: boolean = false): Promise<SearchResult[]> => {
  if (!isAdmin) return [];

  try {
    const users = await userService.getUsers();
    const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 0);

    const results = users
      .map(user => {
        const relevance = calculateRelevance(
          searchTerms,
          `${user.nombre} ${user.apellido_paterno} ${user.apellido_materno || ''} ${user.correo} ${user.numero_empleado}`
        );

        return {
          id: user.id,
          type: 'user' as SearchResultType,
          title: `${user.nombre} ${user.apellido_paterno}`,
          subtitle: user.correo,
          description: `${user.departamento} - ${user.numero_empleado}`,
          category: undefined,
          status: user.estado,
          date: undefined,
          relevance,
        };
      })
      .filter(result => result.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    return results.map(({ relevance, ...rest }) => rest);
  } catch (error) {
    
    return [];
  }
};

const searchCertificates = async (query: string, limit: number = 10): Promise<SearchResult[]> => {
  try {
    const certificates = await certificateService.getMyCertificates();
    const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 0);

    const results = certificates
      .map(cert => {
        const title = (cert as any).title || (cert as any).titulo || 'Certificado';
        const category = (cert as any).category || (cert as any).categoria || '';
        const status = (cert as any).status || (cert as any).estado || '';
        
        const relevance = calculateRelevance(
          searchTerms,
          `${title} ${category}`
        );

        return {
          id: cert.id.toString(),
          type: 'certificate' as SearchResultType,
          title,
          subtitle: category,
          description: status,
          category: category,
          status: status,
          date: (cert as any).obtained || (cert as any).fechaEmision,
          relevance,
        };
      })
      .filter(result => result.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    return results.map(({ relevance, ...rest }) => rest);
  } catch (error) {
    
    return [];
  }
};

export const globalSearch = async (
  options: SearchOptions,
  isAdmin: boolean = false
): Promise<SearchResponse> => {
  const startTime = Date.now();
  const { query, filters, limit = 50, sortBy = 'relevance' } = options;

  if (!query || query.trim().length < 2) {
    return {
      results: [],
      total: 0,
      hasMore: false,
      query,
      executionTime: 0,
    };
  }

  try {
    
    const searchTypes = filters?.types || ['course', 'category', 'user', 'certificate'];

    
    const searchPromises: Promise<SearchResult[]>[] = [];

    if (searchTypes.includes('course')) {
      searchPromises.push(searchCourses(query, Math.floor(limit * 0.5)));
    }
    if (searchTypes.includes('category')) {
      searchPromises.push(searchCategories(query, Math.floor(limit * 0.2)));
    }
    if (searchTypes.includes('user') && isAdmin) {
      searchPromises.push(searchUsers(query, Math.floor(limit * 0.2), isAdmin));
    }
    if (searchTypes.includes('certificate')) {
      searchPromises.push(searchCertificates(query, Math.floor(limit * 0.1)));
    }

    const resultsArrays = await Promise.all(searchPromises);
    let results = resultsArrays.flat();

    
    if (filters?.categories && filters.categories.length > 0) {
      results = results.filter(r => r.category && filters.categories!.includes(r.category));
    }

    if (filters?.status && filters.status.length > 0) {
      results = results.filter(r => r.status && filters.status!.includes(r.status));
    }

    
    if (sortBy === 'title') {
      results.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'date') {
      results.sort((a, b) => {
        const dateA = a.date || 0;
        const dateB = b.date || 0;
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    }

    
    const limitedResults = results.slice(0, limit);

    const executionTime = Date.now() - startTime;

    return {
      results: limitedResults,
      total: results.length,
      hasMore: results.length > limit,
      query,
      executionTime,
    };
  } catch (error) {
    
    return {
      results: [],
      total: 0,
      hasMore: false,
      query,
      executionTime: Date.now() - startTime,
    };
  }
};

export const quickSearch = async (
  query: string,
  limit: number = 10,
  isAdmin: boolean = false
): Promise<SearchResult[]> => {
  const response = await globalSearch(
    {
      query,
      limit,
      sortBy: 'relevance',
    },
    isAdmin
  );

  return response.results;
};

export const getSearchSuggestions = async (
  query: string,
  limit: number = 5
): Promise<string[]> => {
  if (query.length < 2) return [];

  try {
    const results = await quickSearch(query, limit);
    return results.map(r => r.title).slice(0, limit);
  } catch (error) {
    
    return [];
  }
};

export const searchService = {
  globalSearch,
  quickSearch,
  getSearchSuggestions,
};
