import { useRouter } from 'next/navigation';
import { generateAdToken } from '@/lib/tokenUtils';

/**
 * Hook for navigating to ad results with token support
 */
export function useAdNavigation() {
  const router = useRouter();

  /**
   * Navigate to results page with token instead of direct ad_id
   */
  const navigateToAdResults = (adId: string, userId?: string | number) => {
    const token = generateAdToken(adId, userId);
    router.push(`/results?ad-token=${token}`);
  };

  const navigateToTrendingAdResults = (adId: string, userId?: string | number) => {
    const token = generateAdToken(adId, userId);
    router.push(`/results?trending-token=${token}`);
  };

  const navigateToTop10AdResults = (adId: string, userId?: string | number) => {
    const token = generateAdToken(adId, userId);
    router.push(`/results?top10-token=${token}`);
  };

  /**
   * Navigate to AB results page with tokens
   */
  const navigateToABResults = (adIdA: string, adIdB: string, userId?: string | number) => {
    const tokenA = generateAdToken(adIdA, userId);
    const tokenB = generateAdToken(adIdB, userId);
    router.push(`/ab-results?ad-token-a=${tokenA}&ad-token-b=${tokenB}`);
  };

  return {
    navigateToAdResults,
    navigateToABResults,
    navigateToTrendingAdResults,
    navigateToTop10AdResults,
  };
}
