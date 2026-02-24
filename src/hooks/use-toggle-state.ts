import { useState } from "react";

export function useToggleState(initialValue: boolean): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = () => setValue((v) => !v);

  return [value, toggle];
}
