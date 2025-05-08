
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";

type FetchOptions = {
  table: string;
  column?: string;
  value?: any;
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
};

export function useSupabaseData<T>(
  options: FetchOptions,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        let query = supabase.from(options.table).select(options.select || "*");
        
        if (options.column && options.value !== undefined) {
          query = query.eq(options.column, options.value);
        }
        
        if (options.orderBy) {
          query = query.order(
            options.orderBy.column, 
            { ascending: options.orderBy.ascending !== false }
          );
        }
        
        if (options.limit) {
          query = query.limit(options.limit);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        setData(data as T[]);
      } catch (err) {
        setError(err as PostgrestError);
        console.error("Error fetching data from Supabase:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchData();
    }
    
  }, [user, ...dependencies]);

  return { data, loading, error };
}
