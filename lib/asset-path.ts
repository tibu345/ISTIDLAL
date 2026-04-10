export function withBasePath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return path;
  }

  const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();

  if (!configuredBasePath) {
    return path;
  }

  return `${configuredBasePath}${path === "/" ? "" : path}`;
}
