import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { ConflictField } from '../components/ui/ConflictModal';

interface ConflictState<T = Record<string, unknown>> {
  isOpen: boolean;
  entityName: string;
  fields: ConflictField[];
  localVersion: T | null;
  remoteVersion: T | null;
}

export function useConflictHandler() {
  const [conflict, setConflict] = useState<ConflictState>({
    isOpen: false,
    entityName: '',
    fields: [],
    localVersion: null,
    remoteVersion: null,
  });

  const handleConflict = useCallback(
    <T extends Record<string, unknown>>(
      error: AxiosError,
      entityName: string,
      localData: T,
      fieldLabels: Record<string, string>
    ) => {
      if (error.response?.status !== 409) return false;

      const remoteData = (error.response?.data as Record<string, unknown>)?.remote as Record<string, unknown>;
      if (!remoteData) return false;

      const fields: ConflictField[] = Object.keys(fieldLabels).map((key: string) => ({
        field: key,
        label: fieldLabels[key] ?? '',
        local: localData[key],
        remote: remoteData[key],
      }));

      setConflict({
        isOpen: true,
        entityName,
        fields,
        localVersion: localData,
        remoteVersion: remoteData,
      });

      return true;
    },
    []
  );

  const closeConflict = useCallback(() => {
    setConflict({
      isOpen: false,
      entityName: '',
      fields: [],
      localVersion: null,
      remoteVersion: null,
    });
  }, []);

  return {
    conflict,
    handleConflict,
    closeConflict,
  };
}
