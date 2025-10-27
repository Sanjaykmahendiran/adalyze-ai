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
  const navigateToAdResults = (adId: string) => {
    const token = generateAdToken(adId);
    router.push(`/results?ad-token=${token}`);
  };
  
  /**
   * Navigate to AB results page with tokens
   */
  const navigateToABResults = (adIdA: string, adIdB: string) => {
    const tokenA = generateAdToken(adIdA);
    const tokenB = generateAdToken(adIdB);
    router.push(`/ab-results?ad-token-a=${tokenA}&ad-token-b=${tokenB}`);
  };
  
  return {
    navigateToAdResults,
    navigateToABResults,
  };
}
