import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { PostgrestError } from '@supabase/supabase-js';

// Define valid table names to ensure type safety
// This is now a literal string union type to match the actual table names in the database
type ValidTableNames = 'profiles' | 'orders';

interface UseSupabaseDataOptions {
  table: ValidTableNames;
  column?: string;
  value?: any;
  select?: string;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  limit?: number;
  single?: boolean;
}

interface SupabaseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: PostgrestError | null;
}

export function useSupabaseData<T = any>(options: UseSupabaseDataOptions): SupabaseDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      let query = supabase.from(options.table).select(options.select || '*');

      if (options.column && options.value) {
        query = query.eq(options.column, options.value);
      }

      if (options.orderBy) {
        query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending });
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.single) {
        try {
          const { data, error } = await query.single();
          if (error) {
            setError(error);
            toast({
              title: "Fetch Error",
              description: `Failed to fetch data: ${error.message}`,
              variant: "destructive",
            });
          } else {
            setData(data as T);
          }
        } catch (err) {
          setError(err as PostgrestError);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await query;
        if (error) {
          setError(error);
          toast({
            title: "Fetch Error",
            description: `Failed to fetch data: ${error.message}`,
            variant: "destructive",
          });
        } else {
          setData(data as T);
        }
      } catch (err) {
        setError(err as PostgrestError);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

  }, [options.table, options.column, options.value, options.orderBy, options.limit, options.select, options.single, toast]);

  return { data, loading, error };
}

export async function insertData<T = any>(table: ValidTableNames, data: any) {
  try {
    const { data: result, error } = await (supabase
      .from(table)
      .insert(data)
      .select());

    if (error) {
      console.error("Error inserting data:", error);
      throw error;
    }

    return result as T;
  } catch (error) {
    console.error("Error in insertData:", error);
    throw error;
  }
}

export async function updateData<T = any>(table: ValidTableNames, id: string, data: any) {
  try {
    const { data: result, error } = await (supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select());

    if (error) {
      console.error("Error updating data:", error);
      throw error;
    }

    return result as T;
  } catch (error) {
    console.error("Error in updateData:", error);
    throw error;
  }
}

export async function deleteData(table: ValidTableNames, id: string) {
  try {
    const { error } = await (supabase
      .from(table)
      .delete()
      .eq('id', id));

    if (error) {
      console.error("Error deleting data:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteData:", error);
    throw error;
  }
}
