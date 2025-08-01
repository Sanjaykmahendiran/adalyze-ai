import { useState, useEffect, useRef } from 'react';

// Reusable hook for intersection observer
export function useIntersectionObserver(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once !== false) {
            observer.disconnect();
          }
        } else if (options.once === false) {
          setIsVisible(false);
        }
      },
      { 
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '100px',
        root: options.root || null
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.disconnect();
      }
    };
  }, [options.threshold, options.rootMargin, options.root, options.once]);

  return { ref, isVisible };
}

// Reusable component for lazy loading
export function LazyLoadSection({ 
  children, 
  placeholder = "", 
  className = "", 
  threshold = 0.1,
  rootMargin = '100px',
  once = true 
}) {
  const { ref, isVisible } = useIntersectionObserver({
    threshold,
    rootMargin,
    once
  });

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (placeholder || <div className={className}></div>)}
    </div>
  );
}