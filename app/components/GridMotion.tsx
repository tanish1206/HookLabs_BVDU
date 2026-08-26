'use client'
import { useEffect, useRef, FC, ReactNode } from 'react';
import { gsap } from 'gsap';

export interface GridMotionProps {
  items?: (string | ReactNode)[];
  gradientColor?: string;
}

const GridMotion: FC<GridMotionProps> = ({ items = [], gradientColor = 'black' }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollYRef = useRef<number>(typeof window !== 'undefined' ? window.scrollY : 0);

  const totalItems = 28;
  const defaultItems = Array.from({ length: totalItems }, (_, index) => `Item ${index + 1}`);
  
  // Pad the array to totalItems length if there are fewer items than needed
  // by looping the provided items. GridMotion looks best with 28 items.
  const paddedItems = [];
  if (items.length > 0) {
    for (let i = 0; i < totalItems; i++) {
        paddedItems.push(items[i % items.length]);
    }
  }
  const combinedItems = items.length > 0 ? paddedItems : defaultItems;

  useEffect(() => {
    gsap.ticker.lagSmoothing(0);

    const handleScroll = (): void => {
      scrollYRef.current = window.scrollY;
    };

    const updateMotion = (): void => {
      const baseDuration = 0.5;
      const inertiaFactors = [0.2, 0.4, 0.3, 0.1];

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1;
          // Move horizontally based on scroll depth. 0.8 multiplier for parallax effect speed.
          const moveAmount = scrollYRef.current * 0.8 * direction;

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power3.out',
            overwrite: 'auto'
          });
        }
      });
    };

    const removeAnimationLoop = gsap.ticker.add(updateMotion);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Trigger on mount
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      removeAnimationLoop();
    };
  }, []);

  return (
    <div ref={gridRef} className="h-full w-full overflow-hidden absolute inset-0">
      <section
        className="w-full h-full overflow-hidden relative flex items-center justify-center"
        style={{}}
      >
        <div className="absolute inset-0 pointer-events-none z-[4] bg-[length:250px]"></div>
        <div className="gap-4 flex-none relative w-[150vw] h-[150vh] grid grid-rows-4 grid-cols-1 rotate-[-15deg] origin-center z-[2]">
          {Array.from({ length: 4 }, (_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4 grid-cols-7"
              style={{ willChange: 'transform, filter' }}
              ref={el => {
                rowRefs.current[rowIndex] = el;
              }}
            >
              {Array.from({ length: 7 }, (_, itemIndex) => {
                const content = combinedItems[rowIndex * 7 + itemIndex];
                return (
                  <div key={itemIndex} className="relative w-full h-full">
                    <div className="relative w-full h-full overflow-hidden rounded-[10px] bg-[#111] flex items-center justify-center text-white text-[1.5rem]">
                      {typeof content === 'string' && content.startsWith('http') ? (
                        <div
                          className="w-full h-full bg-cover bg-center absolute top-0 left-0"
                          style={{ backgroundImage: `url(${content})` }}
                        ></div>
                      ) : (
                        <div className="w-full h-full absolute inset-0 overflow-hidden">{content}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="relative w-full h-full top-0 left-0 pointer-events-none"></div>
      </section>
    </div>
  );
};

export default GridMotion;
