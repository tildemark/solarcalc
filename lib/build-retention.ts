export const BUILD_RETENTION_DAYS = 30;

export function getBuildExpiryCutoff(): Date {
  return new Date(Date.now() - BUILD_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

export function formatBuildRetentionLabel(): string {
  return `${BUILD_RETENTION_DAYS} days`;
}
