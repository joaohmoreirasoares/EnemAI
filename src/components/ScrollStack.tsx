import React, { ReactNode, useEffect, useRef } from 'react';
import Lenis from 'lenis';

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

  useEffect(() => {
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll('.scroll-stack-card');
    const container = containerRef.current;
    
    // Configurar Lenis apenas para o scroll dentro desta seção
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Função de animação
    const animate = () => {
      lenis.raf();
      requestAnimationFrame(animate);
    };
    animate();

    // Calcular posições de travamento
    const lockPositions: number[] = [];
    const cardHeights: number[] = [];
    
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      cardHeights[index] = rect.height;
      
      // Posição onde o cartão deve travar (cada um um pouco mais abaixo)
      const lockPosition = window.innerHeight * 0.7 + (index * 100);
      lockPositions[index] = lockPosition;
    });

    // Posição inicial da seção
    const sectionTop = container.getBoundingClientRect().top + window.scrollY;

    // Função para atualizar os cartões
    const updateCards = () => {
      const scrollY = window.scrollY;
      const relativeScroll = scrollY - sectionTop;

      cards.forEach((card, index) => {
        const cardElement = card as HTMLElement;
        const lockPosition = lockPositions[index];
        const cardHeight = cardHeights[index];
        
        if (relativeScroll < lockPosition - sectionTop) {
          // Cartão ainda não chegou à posição de travamento
          const progress = Math.min(relativeScroll / (lockPosition - sectionTop), 1);
          const translateY = progress * (lockPosition - sectionTop - relativeScroll);
          const scale = 1 - (index * 0.05) - (progress * 0.1);
          const opacity = 1 - (index * 0.2) - (progress * 0.1);
          
          cardElement.style.transform = `translateY(${translateY}px) scale(${scale})`;
          cardElement.style.opacity = opacity;
          cardElement.style.zIndex = cards.length - index;
        } else {
          // Cartão travado na posição
          const translateY = lockPosition - sectionTop - relativeScroll;
          const scale = 1 - (index * 0.05) - 0.1;
          const opacity = 1 - (index * 0.2) - 0.1;
          
          cardElement.style.transform = `translateY(${translateY}px) scale(${scale})`;
          cardElement.style.opacity = opacity;
          cardElement.style.zIndex = cards.length - index;
        }
      });
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
    lenis.on('scroll', updateCards);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', onScroll);
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`.trim()}>
      <div className="py-16">
        {children}
      </div>
    </div>
  );
};

export default ScrollStack;