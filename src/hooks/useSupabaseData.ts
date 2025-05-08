
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { useAuth } from "@/contexts/AuthContext";

// Define allowed table names explicitly based on our database
type TableName = "profiles" | "orders";

type FetchOptions = {
  table: TableName;
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

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Using the from method with the table name (now properly typed)
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
      setError(null);
    } catch (err) {
      setError(err as PostgrestError);
      console.error("Error fetching data from Supabase:", err);
    } finally {
      setLoading(false);
    }
  }, [user, options.table, options.column, options.value, options.select, options.limit,
     options.orderBy?.column, options.orderBy?.ascending, ...dependencies]);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateData = useCallback(async (id: string, updates: Partial<T>) => {
    if (!user) return { data: null, error: { message: "User not authenticated" } as PostgrestError };
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(options.table)
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      
      // Refresh data after update
      fetchData();
      
      return { data, error: null };
    } catch (err) {
      console.error(`Error updating ${options.table}:`, err);
      return { data: null, error: err as PostgrestError };
    } finally {
      setLoading(false);
    }
  }, [user, options.table, fetchData]);

  const insertData = useCallback(async (newData: Partial<T>) => {
    if (!user) return { data: null, error: { message: "User not authenticated" } as PostgrestError };
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(options.table)
        .insert(newData)
        .select();
        
      if (error) throw error;
      
      // Refresh data after insert
      fetchData();
      
      return { data, error: null };
    } catch (err) {
      console.error(`Error inserting into ${options.table}:`, err);
      return { data: null, error: err as PostgrestError };
    } finally {
      setLoading(false);
    }
  }, [user, options.table, fetchData]);

  return { 
    data, 
    loading, 
    error,
    updateData,
    insertData,
    refreshData: fetchData
  };
}
