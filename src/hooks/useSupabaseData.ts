
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { PostgrestError } from '@supabase/supabase-js';

interface UseSupabaseDataOptions {
  table: string;
  column?: string;
  value?: any;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  userId?: boolean; // Whether to filter by the current user's ID
  onError?: (error: PostgrestError) => void;
}

export function useSupabaseData<T = any>(options: UseSupabaseDataOptions) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (options.userId && !user) {
      setLoading(false);
      setData([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Use type assertion to handle dynamic table names
        let query = supabase
          .from(options.table)
          .select(options.select || '*') as any;

        if (options.column && options.value !== undefined) {
          query = query.eq(options.column, options.value);
        }

        if (options.userId && user) {
          query = query.eq('user_id', user.id);
        }

        if (options.orderBy) {
          const { column, ascending = true } = options.orderBy;
          query = query.order(column, { ascending });
        }

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setData(data as T[]);
        setError(null);
      } catch (err: any) {
        console.error(`Error fetching data from ${options.table}:`, err);
        setError(err);
        setData(null);
        
        if (options.onError) {
          options.onError(err);
        } else {
          toast({
            title: "Error loading data",
            description: err.message || "Failed to load data",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [options.table, options.column, options.value, options.select, 
      options.orderBy, options.limit, options.userId, user?.id]);

  return { data, loading, error };
}

export async function insertData<T = any>(table: string, data: any) {
  try {
    const { data: result, error } = await (supabase
      .from(table)
      .insert(data)
      .select() as any);
    
    if (error) {
      throw error;
    }
    
    return { success: true, data: result as T[], error: null };
  } catch (error: any) {
    console.error(`Error inserting data into ${table}:`, error);
    return { success: false, data: null, error };
  }
}

export async function updateData<T = any>(table: string, id: string, data: any) {
  try {
    const { data: result, error } = await (supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select() as any);
    
    if (error) {
      throw error;
    }
    
    return { success: true, data: result as T[], error: null };
  } catch (error: any) {
    console.error(`Error updating data in ${table}:`, error);
    return { success: false, data: null, error };
  }
}

export async function deleteData(table: string, id: string) {
  try {
    const { error } = await (supabase
      .from(table)
      .delete()
      .eq('id', id) as any);
    
    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error: any) {
    console.error(`Error deleting data from ${table}:`, error);
    return { success: false, error };
  }
}
