'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

type SettingsStateContextValue = {
  cancelVersion: number;
  saveVersion: number;
  setDirty: (dirty: boolean) => void;
};

const SettingsStateContext = createContext<SettingsStateContextValue | null>(null);

export function SettingsStateProvider({
  children,
  onControlsChange,
  onDirtyChange
}: {
  children: React.ReactNode;
  onControlsChange?: (controls: { onCancel: () => void; onSave: () => void }) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const [saveVersion, setSaveVersion] = useState(0);
  const [cancelVersion, setCancelVersion] = useState(0);
  const controls = useMemo(
    () => ({
      onCancel: () => setCancelVersion((version) => version + 1),
      onSave: () => setSaveVersion((version) => version + 1)
    }),
    []
  );

  const value = useMemo(
    () => ({
      cancelVersion,
      saveVersion,
      setDirty: onDirtyChange
    }),
    [cancelVersion, onDirtyChange, saveVersion]
  );

  useEffect(() => {
    onControlsChange?.(controls);
  }, [controls, onControlsChange]);

  return <SettingsStateContext.Provider value={value}>{children}</SettingsStateContext.Provider>;
}

export function useSettingsFormState<T>(initialValues: T) {
  const context = useContext(SettingsStateContext);
  const [savedValues, setSavedValues] = useState(initialValues);
  const [values, setValues] = useState(initialValues);

  useEffect(() => {
    context?.setDirty(JSON.stringify(values) !== JSON.stringify(savedValues));
  }, [context, savedValues, values]);

  useEffect(() => {
    if (!context?.saveVersion) return;

    setSavedValues(values);
    context.setDirty(false);
  }, [context, context?.saveVersion, values]);

  useEffect(() => {
    if (!context?.cancelVersion) return;

    setValues(savedValues);
    context.setDirty(false);
  }, [context, context?.cancelVersion, savedValues]);

  return [values, setValues] as const;
}
