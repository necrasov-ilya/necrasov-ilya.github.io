import { useLayoutEffect, useState, type RefObject } from 'react';

export function useElementWidth<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    const updateWidth = () => {
      const nextWidth = Math.round(element.getBoundingClientRect().width);

      setWidth((currentWidth) => (currentWidth === nextWidth ? currentWidth : nextWidth));
    };

    updateWidth();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth);

      return () => {
        window.removeEventListener('resize', updateWidth);
      };
    }

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return width;
}
