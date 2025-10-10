import React, { ReactNode, useEffect, useRef, useState } from 'react';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card w-full my-8 p-8 rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700 transition-all duration-700 ease-out ${itemClassName}`.trim()}>
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  className = '',
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrollBlocked, setIsScrollBlocked] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll('.scroll-stack-card');
    const container = containerRef.current;
    
    // Posição inicial da seção
    const sectionTop = container.getBoundingClientRect().top + window.scrollY;

    // Função para bloquear/desbloquear scroll
    const blockScroll = () => {
      if (!isScrollBlocked) {
        setLastScrollY(window.scrollY);
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${window.scrollY}px`;
        document.body.style.width = '100%';
        setIsScrollBlocked(true);
      }
    };

    const unblockScroll = () => {
      if (isScrollBlocked) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, lastScrollY);
        setIsScrollBlocked(false);
      }
    };

    // Função para atualizar os cartões
    const updateCards = () => {
      const scrollY = window.scrollY;
      const relativeScroll = scrollY - sectionTop;

      cards.forEach((card, index) => {
        const cardElement = card as HTMLElement;
        
        // Posição onde este elemento deve começar a aparecer
        const appearPosition = index * window.innerHeight * 0.8;
        
        // Posição onde este elemento deve parar
        const stopPosition = appearPosition + window.innerHeight * 0.6;
        
        if (relativeScroll < appearPosition) {
          // Elemento ainda não apareceu
          cardElement.style.transform = 'translateY(100px) scale(0.8)';
          cardElement.style.opacity = '0';
          cardElement.style.zIndex = 1;
        } else if (relativeScroll < stopPosition) {
          // Elemento aparecendo
          const progress = (relativeScroll - appearPosition) / (stopPosition - appearPosition);
          
          // Animação de entrada
          const translateY = 100 * (1 - progress);
          const scale = 0.8 + (0.2 * progress);
          const opacity = progress;
          
          cardElement.style.transform = `translateY(${translateY}px) scale(${scale})`;
          cardElement.style.opacity = opacity;
          cardElement.style.zIndex = cards.length - index;
          
          // Bloquear scroll enquanto o primeiro elemento está aparecendo
          if (index === 0 && progress < 1) {
            blockScroll();
          }
        } else {
          // Elemento parado - verificar se elementos posteriores estão aparecendo
          let shouldScaleDown = false;
          let shouldFade = false;
          
          // Verificar se algum elemento posterior está aparecendo
          for (let i = index + 1; i < cards.length; i++) {
            const nextCard = cards[i] as HTMLElement;
            const nextAppearPosition = i * window.innerHeight * 0.8;
            
            if (relativeScroll >= nextAppearPosition) {
              shouldScaleDown = true;
              shouldFade = true;
              break;
            }
          }
          
          if (shouldScaleDown && shouldFade) {
            // Diminuir e ficar mais transparente quando elementos posteriores aparecem
            const scale = 0.9 - (index * 0.1);
            const opacity = 0.8 - (index * 0.2);
            const translateY = -50 - (index * 20);
            
            cardElement.style.transform = `translateY(${translateY}px) scale(${scale})`;
            cardElement.style.opacity = opacity;
            cardElement.style.zIndex = cards.length - index;
          } else {
            // Elemento parado normal
            const translateY = -50 - (index * 20);
            cardElement.style.transform = `translateY(${translateY}px) scale(1)`;
            cardElement.style.opacity = 1;
            cardElement.style.zIndex = cards.length - index;
          }
        }
      });
      
      // Desbloquear scroll quando todos os elementos estiverem parados
      const allStopped = cards.length > 0 && Array.from(cards).every((card, index) => {
        const cardElement = card as HTMLElement;
        const appearPosition = index * window.innerHeight * 0.8;
        const stopPosition = appearPosition + window.innerHeight * 0.6;
        return relativeScroll >= stopPosition;
      });
      
      if (allStopped) {
        unblockScroll();
      }
    };

    // Atualizar nos eventos de scroll
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateCards();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Inicializar e adicionar listeners
    updateCards();
    window.addEventListener('scroll', onScroll);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', onScroll);
      unblockScroll();
    };
  }, [isScrollBlocked, lastScrollY]);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`.trim()}>
      <div className="py-16">
        {children}
      </div>
    </div>
  );
};

export default ScrollStack;