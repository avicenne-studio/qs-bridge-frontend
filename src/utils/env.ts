export const getEnv = (key: string): string | undefined => {
  const envVars = import.meta.env as Record<string, string | undefined>;
  return envVars[key];
};

export const getEnvironment = (): string => {
  return (
    import.meta.env.MODE ??
    getEnv("ENVIRONMENT") ??
    getEnv("VITE_ENVIRONMENT") ??
    ""
  );
};
