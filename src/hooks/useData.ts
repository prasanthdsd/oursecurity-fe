import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { config } from '../config';
import { onPushReceived } from '../notifications/push';

/**
 * Loads data when the screen is focused, refreshes it every `config.pollMs` while focused,
 * and exposes pull-to-refresh state. Polling stands in for push notifications for now.
 */
export function useData<T>(loader: () => Promise<T>, poll = true) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const load = useCallback(async () => {
    try {
      setData(await loaderRef.current());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
      const unsubscribe = onPushReceived(() => load());
      if (!poll) return unsubscribe;
      const t = setInterval(load, config.pollMs);
      return () => {
        clearInterval(t);
        unsubscribe();
      };
    }, [load, poll]),
  );

  return { data, error, refreshing, refresh, reload: load };
}

/** Wraps an action so a button can show a spinner and the screen can show the error. */
export function useAction() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    setError(null);
    try {
      await fn();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      return false;
    } finally {
      setBusy(null);
    }
  }, []);
  return { busy, error, setError, run };
}
