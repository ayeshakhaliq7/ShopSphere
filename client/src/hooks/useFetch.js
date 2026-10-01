import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../services/api';

/** Runs an async loader and tracks loading/error state. Re-runs when `deps` change. */
export default function useFetch(loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    run()
      .then((res) => !cancelled && setData(res))
      .catch((err) => !cancelled && setError({ message: getErrorMessage(err), status: err.response?.status }))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [run]);

  useEffect(() => load(), [load]);

  return { data, setData, loading, error, reload: load };
}
