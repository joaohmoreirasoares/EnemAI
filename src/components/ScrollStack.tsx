import React, { ReactNode, useEffect, useRef } from 'react';

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
    
    // Calcular posições de travamento - cada elemento tem uma posição diferente
    const lockPositions: number[] = [];
    
    cards.forEach((card, index) => {
      // Posição onde o cartão deve travar (cada um em uma posição diferente)
      const lockPosition = window.innerHeight * 0.7 + (index * 200); // Aumentei o espaçamento
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
        
        if (relativeScroll < lockPosition - sectionTop) {
          // Cartão ainda não chegou à posição de travamento
          const progress = Math.min(relativeScroll / (lockPosition - sectionTop), 1);
          
          // Animação de escala: começa em 1 e vai para 0.9
          const scale = 1 - (progress * 0.1);
          
          // Animação de opacidade: começa em 1 e vai para 0.7
          const opacity = 1 - (progress * 0.3);
          
          // Animação de posição: o elemento sobe um pouco
          const translateY = progress * -50; // Sobe 50px no máximo
          
          cardElement.style.transform = `translateY(${translateY}px) scale(${scale})`;
          cardElement.style.opacity = opacity;
          cardElement.style.zIndex = cards.length - index;
        } else {
          // Cartão travado na posição final
          cardElement.style.transform = `translateY(-50px) scale(0.9)`;
          cardElement.style.opacity = 0.7;
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

    // Cleanup
    return () => {
      window.removeEventListener('scroll', onScroll);
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