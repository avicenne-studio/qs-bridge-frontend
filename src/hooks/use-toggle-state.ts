import { useCallback, useState } from "react";

export function useToggleState(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);

  return [value, toggle];
}
