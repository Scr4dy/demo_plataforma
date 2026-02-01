import { supabase } from '../config/supabase';
import { logger } from './logger';
import { offlineCacheService } from '../services/offlineCacheService';

interface SelectFallbackOptions {
  single?: boolean;
  head?: boolean;
  count?: 'exact' | 'planned' | 'estimated';
}

export async function selectWithColumnFallback(
  table: string,
  selectColumns: string,
  columns: string[],
  value: any,
  opts?: SelectFallbackOptions
) {
  
  let tableCache: Record<string, boolean> = {};
  try {
    const persisted = await offlineCacheService.get<Record<string, boolean>>('schema', table);
    if (persisted && persisted.fromCache && persisted.data) {
      tableCache = persisted.data;
    }
  } catch (e: any) {
    
  }

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];

    
    if (tableCache[col] === false) {
      logger.info('selectWithColumnFallback - skipping column based on cached absence', { table, column: col });
      continue;
    }

    try {
      const q = supabase.from(table).select(selectColumns, { count: opts?.count, head: opts?.head });
      const withEq = q.eq(col, value);
      const res = opts?.single ? await withEq.single() : await withEq;

      if ((res as any).error) {
        const err = (res as any).error;
        
        logger.warn('selectWithColumnFallback - received error for column attempt', { table, column: col, rawError: err });

        
        if (err && (err.code === '42703' || (err.message && err.message.toLowerCase().includes('column')))) {
          tableCache[col] = false;
          try { await offlineCacheService.set('schema', tableCache, table); } catch (e: any) {  }
          logger.warn('Column fallback trying next column due to error', { table, column: col, error: err.message || err.code });
          continue;
        }

        
        return res;
      }

      
      tableCache[col] = true;
      try { await offlineCacheService.set('schema', tableCache, table); } catch (e: any) {  }

      logger.info('selectWithColumnFallback - selected column', { table, column: col });
      return res;
    } catch (error: any) {
      
      if (error && (error.code === '42703' || (error.message && error.message.toLowerCase().includes('column')))) {
        tableCache[col] = false;
        try { await offlineCacheService.set('progress', tableCache, table); } catch (e: any) {  }
        logger.warn('selectWithColumnFallback - column missing, trying next', { table, column: col, error: error.message });
        continue;
      }
      logger.error('selectWithColumnFallback - unexpected error', { table, column: col, error: error.message || error });
      return { data: null, error };
    }
  }

  
  const finalError = new Error(`No column matched when selecting from ${table} with fallback columns: ${columns.join(', ')}`);
  return { data: null, error: finalError };
}

export async function insertWithCursoIdFallback(table: string, payload: any) {
  try {
    const { data, error } = await supabase.from(table).insert([payload]).select().single();
    return { data, error };
  } catch (error: any) {
    
    try {
      let newPayload = { ...payload };
      if ('curso_id' in newPayload) {
        newPayload['id_curso'] = newPayload['curso_id'];
        delete newPayload['curso_id'];
      } else if ('id_curso' in newPayload) {
        newPayload['curso_id'] = newPayload['id_curso'];
        delete newPayload['id_curso'];
      } else if ('cursoId' in newPayload) {
        newPayload['curso_id'] = newPayload['cursoId'];
        delete newPayload['cursoId'];
      }

      const { data: d2, error: e2 } = await supabase.from(table).insert([newPayload]).select().single();
      return { data: d2, error: e2 };
    } catch (err: any) {
      logger.error('insertWithCursoIdFallback - unexpected error', { table, error: err.message || err });
      return { data: null, error: err };
    }
  }
}

export async function insertWithUsuarioAndCursoFallback(table: string, payload: any) {
  const userKeys = ['usuario_id', 'id_empleado', 'id_usuario', 'user_id'];
  const courseKeys = ['curso_id', 'id_curso', 'cursoId', 'id'];

  
  try {
    const { data, error } = await supabase.from(table).insert([payload]).select().single();
    
    if (error) {
      const msg = String(error?.message || '').toLowerCase();
      
      if (
        error.code === '42703' ||
        error.code === 'PGRST205' ||
        error.code === 'PGRST204' ||
        error.code === '22P02' ||
        msg.includes('column') ||
        msg.includes('could not find') ||
        msg.includes('invalid input syntax for type integer')
      ) {
        logger.warn('insertWithUsuarioAndCursoFallback - initial insert flagged retriable error', { table, error: error.message || error.code });
        
      } else {
        return { data, error };
      }
    } else {
      return { data, error };
    }
  } catch (err: any) {
    
  }

  
  const originalPayload = { ...payload };

  
  
  
  try {
    const getCandidate = originalPayload['usuario_id'] || originalPayload['user_id'] || originalPayload['id_usuario'] || originalPayload['id_empleado'];
    const isUuid = (v: any) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v);
    if (isUuid(getCandidate)) {
      try {
        const { data: resolved, error: resolveErr } = await supabase
          .from('usuarios')
          .select('id_usuario, id')
          .eq('auth_id', getCandidate)
          .maybeSingle();
        if (!resolveErr && resolved) {
          const resolvedId = resolved.id_usuario || resolved.id;
          if (resolvedId) {
            
            originalPayload['usuario_id'] = originalPayload['usuario_id'] || resolvedId;
            originalPayload['user_id'] = originalPayload['user_id'] || resolvedId;
            originalPayload['id_usuario'] = originalPayload['id_usuario'] || resolvedId;
            originalPayload['id_empleado'] = originalPayload['id_empleado'] || resolvedId;
            logger.info('insertWithUsuarioAndCursoFallback - resolved auth uuid to numeric id', { table, resolvedId });
          }
        } else {
          logger.warn('insertWithUsuarioAndCursoFallback - could not resolve auth uuid to numeric id', { table, candidate: getCandidate, error: resolveErr && resolveErr.message });
        }
      } catch (resolveEx: any) {
        logger.warn('insertWithUsuarioAndCursoFallback - error resolving auth uuid', { table, error: resolveEx && (resolveEx.message || resolveEx) });
      }
    }
  } catch (e) {
    
  }

  for (const u of userKeys) {
    for (const c of courseKeys) {
      try {
        let newPayload: any = { ...originalPayload };

        
        if (!('usuario_id' in newPayload) && !('id_empleado' in newPayload) && !('id_usuario' in newPayload) && !('user_id' in newPayload)) {
          
        }
        
        if ('usuario_id' in newPayload) newPayload[u] = newPayload['usuario_id'];
        if ('id_empleado' in newPayload) newPayload[u] = newPayload['id_empleado'];
        if ('id_usuario' in newPayload) newPayload[u] = newPayload['id_usuario'];
        if ('user_id' in newPayload) newPayload[u] = newPayload['user_id'];
        
        for (const key of userKeys) if (key !== u) delete newPayload[key];

        
        if ('curso_id' in newPayload) newPayload[c] = newPayload['curso_id'];
        if ('id_curso' in newPayload) newPayload[c] = newPayload['id_curso'];
        if ('cursoId' in newPayload) newPayload[c] = newPayload['cursoId'];
        if ('id' in newPayload) newPayload[c] = newPayload['id'];
        for (const key of courseKeys) if (key !== c) delete newPayload[key];

        logger.info('insertWithUsuarioAndCursoFallback - trying permutation', { table, userKey: u, courseKey: c });
        const { data, error } = await supabase.from(table).insert([newPayload]).select().single();
        if (error) {
          
          const msg = String(error?.message || '').toLowerCase();
          if (
            error.code === '42703' ||
            error.code === 'PGRST205' ||
            error.code === 'PGRST204' ||
            error.code === '22P02' ||
            msg.includes('column') ||
            msg.includes('could not find') ||
            msg.includes('invalid input syntax for type integer') ||
            (error as any)?.status === 400
          ) {
            logger.warn('insertWithUsuarioAndCursoFallback - insert attempted but column/table missing, type mismatch, or schema cache issue; trying next', { table, userKey: u, courseKey: c, error: error.message || error.code });
            continue;
          }
          return { data, error };
        }
        logger.info('insertWithUsuarioAndCursoFallback - insert succeeded with keys', { table, userKey: u, courseKey: c });
        return { data, error };
      } catch (e: any) {
        
        const emsg = String(e?.message || '').toLowerCase();
        if (
          e && (
            e.code === '42703' ||
            e.code === 'PGRST205' ||
            e.code === '22P02' ||
            emsg.includes('column') ||
            emsg.includes('could not find') ||
            emsg.includes('invalid input syntax for type integer')
          )
        ) {
          logger.warn('insertWithUsuarioAndCursoFallback - column missing or type mismatch, trying next permutation', { table, userKey: u, courseKey: c, error: e.message || e.code });
          continue;
        }
        logger.error('insertWithUsuarioAndCursoFallback - unexpected error', { table, userKey: u, courseKey: c, error: e.message || e });
        return { data: null, error: e };
      }
    }
  }

  const finalError = new Error(`Failed insert with user/course fallback for table ${table}`);
  return { data: null, error: finalError };
}

export default { selectWithColumnFallback, insertWithCursoIdFallback };

export async function detectUserKeyInTable(
  table: string,
  candidateKeys: string[] = ['id_empleado', 'id_usuario', 'usuario_id', 'user_id']
): Promise<string | null> {
  
  let tableCache: Record<string, boolean> = {};
  try {
    const persisted = await offlineCacheService.get<Record<string, boolean>>('schema', table);
    if (persisted && persisted.fromCache && persisted.data) {
      tableCache = persisted.data;
      for (const k of candidateKeys) {
        if (tableCache[k] === true) return k;
      }
    }
  } catch (e: any) {
    
  }

  try {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      const msg = String(error.message || '').toLowerCase();
      if (error.code === 'PGRST116' || msg.includes('404') || msg.includes('relation') || msg.includes('could not find')) {
        logger.warn('detectUserKeyInTable - table relation missing or select(*) not allowed', { table, error: error.message || error.code });
        return null;
      }
      
      logger.warn('detectUserKeyInTable - select(*) returned error', { table, error: error.message || error.code });
      return null;
    }

    if (!Array.isArray(data) || data.length === 0) return null;

    const row = data[0] as Record<string, any>;
    const found = candidateKeys.find(k => Object.prototype.hasOwnProperty.call(row, k)) || null;

    
    for (const k of candidateKeys) {
      tableCache[k] = (found === k);
    }
    try { await offlineCacheService.set('schema', tableCache, table); } catch (_) {  }

    return found;
  } catch (e: any) {
    logger.warn('detectUserKeyInTable - unexpected error', { table, error: e && (e.message || e) });
    return null;
  }
}

export async function selectWithRelationFallback(
  table: string,
  selectColumns: string,
  columns: string[],
  value: any,
  opts?: SelectFallbackOptions
) {
  
  let firstAttempt: any;
  if (typeof value === 'undefined' || value === null) {
    try {
      const q = supabase.from(table).select(selectColumns, { count: opts?.count, head: opts?.head });
      firstAttempt = opts?.single ? await q.single() : await q;
    } catch (error: any) {
      firstAttempt = { data: null, error };
    }
  } else {
    firstAttempt = await selectWithColumnFallback(table, selectColumns, columns, value, opts);
  }
  if (!(firstAttempt as any).error) {
    logger.info('selectWithRelationFallback - succeeded with relations', { table, selectColumns });
    return firstAttempt;
  }

  const err: any = (firstAttempt as any).error;
  
  logger.warn('selectWithRelationFallback - initial relation select error', { table, selectColumns, rawError: err });

  
  const msg = (err && (err.message || '')).toString().toLowerCase();
  if (msg.includes('relationship') || msg.includes('relation') || msg.includes('could not find') || msg.includes('missing') || msg.includes('invalid')) {
    
    const stripped = selectColumns.replace(/\b\w+\s*\([^)]*\)/g, '')
      .replace(/\s*,\s*,/g, ',')
      .replace(/(^\s*,)|(,\s*$)/g, '')
      .trim();
    const finalSelect = stripped || '*';
    logger.warn('selectWithRelationFallback - relation select failed, retrying without relations', { table, selectColumns, finalSelect, rawError: err });
    
    if (typeof value === 'undefined' || value === null) {
      try {
        const q = supabase.from(table).select(finalSelect, { count: opts?.count, head: opts?.head });
        const res = opts?.single ? await q.single() : await q;
        return res;
      } catch (error: any) {
        return { data: null, error };
      }
    }
    
    const secondAttempt = await selectWithColumnFallback(table, finalSelect, columns, value, opts);
    return secondAttempt;
  }
  
  return firstAttempt;
}