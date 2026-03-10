import { useCallback, useEffect, useRef, useState } from "react";

interface UseFakeLoadingOptions {
  delayMs?: number;
  succeeds?: boolean;
  onSuccess?: () => void;
}

export function useFakeLoading(options: UseFakeLoadingOptions = {}) {
  const { delayMs = 2500, succeeds = true, onSuccess } = options;

  const [isLoading, setIsLoading] = useState(false);
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback(() => {
    setIsLoading(true);

    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      timeoutRef.current = null;
      if (succeeds && onSuccessRef.current) {
        onSuccessRef.current();
      }
    }, delayMs);
  }, [delayMs, succeeds]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { isLoading, start };
}
