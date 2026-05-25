const required = (k: string) => {
  const v = process.env[k];
  if (!v) throw new Error(`${k} environment variable is not set`);
  return v;
};
export const env = { JWT_SECRET: required("JWT_SECRET") };
