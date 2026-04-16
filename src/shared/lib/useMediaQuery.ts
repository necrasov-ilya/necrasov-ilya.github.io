import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);
    const syncMatches = (event: MediaQueryList | MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncMatches);

      return () => {
        mediaQuery.removeEventListener('change', syncMatches);
      };
    }

    mediaQuery.addListener(syncMatches);

    return () => {
      mediaQuery.removeListener(syncMatches);
    };
  }, [query]);

  return matches;
}
