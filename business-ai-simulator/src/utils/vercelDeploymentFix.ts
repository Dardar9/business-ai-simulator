/**
 * This file is created to force a new deployment on Vercel
 * It seems that Vercel is still using an older commit (dd1a811) instead of the latest one (1a039087)
 * where we fixed the TypeScript errors.
 */

export const forceNewDeployment = (): void => {
  console.log('Forcing a new deployment on Vercel');
};
