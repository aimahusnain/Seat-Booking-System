'use client';

import { useState, useEffect, useCallback } from "react";
import type { Table } from "@/types/booking";

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    try {
      const response = await fetch("/api/get-tables");
      const data = await response.json();
      if (data.success) {
        setTables(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(`Failed to fetch tables: ${error}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchTables();

    // Set up WebSocket connection for real-time updates
    const socket = new WebSocket(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001');

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'TABLES_UPDATED') {
        fetchTables();
      }
    };

    // Cleanup function to close WebSocket connection when component unmounts
    return () => {
      socket.close();
    };
  }, [fetchTables]);

  const addTable = async (tableData: Omit<Table, 'id'>) => {
    try {
      const response = await fetch("/api/add-table", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableData),
      });
      const data = await response.json();
      if (data.success) {
        await fetchTables(); // Refetch tables after adding a new one
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(`Failed to add table: ${error}`);
    }
  };

  return { 
    tables, 
    loading, 
    error,
    addTable,
    fetchTables,
  };
}
