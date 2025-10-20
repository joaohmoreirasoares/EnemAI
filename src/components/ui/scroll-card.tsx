import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ArticleCardProps {
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
}

const ArticleCard = ({ title, description, date, readTime, category }: ArticleCardProps) => (
  <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 w-80 h-96 flex flex-col">
    <CardContent className="p-6 flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold bg-purple-900 text-purple-200 px-2 py-1 rounded">
          {category}
        </span>
        <span className="text-xs text-gray-400">{readTime}</span>
      </div>
      
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 text-sm">{description}</p>
      </div>
      
      <div className="mt-auto">
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </CardContent>
  </Card>
);

const articleCardsData: ArticleCardProps[] = [
  {
    title: "Como Maximizar Seu Tempo de Estudo",
    description: "Descubra técnicas comprovadas para aumentar sua eficiência nos estudos e alcançar melhores resultados no ENEM.",
    date: "15 de Maio, 2023",
    readTime: "5 min",
    category: "Estudo"
  },
  {
    title: "As Competências Mais Cobradas no ENEM",
    description: "Entenda quais habilidades são essenciais para se destacar nas principais áreas avaliadas no exame.",
    date: "22 de Abril, 2023",
    readTime: "7 min",
    category: "Análise"
  },
  {
    title: "Dicas para Redação Nota Máxima",
    description: "Aprenda estratégias para desenvolver uma redação que conquiste os avaliadores do ENEM.",
    date: "10 de Março, 2023",
    readTime: "6 min",
    category: "Redação"
  },
  {
    title: "Mapa Mental: História do Brasil",
    description: "Resumo visual dos principais períodos e eventos históricos que mais caem no ENEM.",
    date: "5 de Fevereiro, 2023",
    readTime: "4 min",
    category: "Resumo"
  }
];

const ScrollCard = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);
  
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? clientWidth : -clientWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-transparent">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden bg-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-gray-900/50 backdrop-blur-sm z-10"></div>
        
        <div className="relative w-full h-full flex items-center bg-transparent">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 z-20 bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div 
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
            className="w-full h-full overflow-x-auto overflow-y-hidden scrollbar-hide flex items-center bg-transparent"
          >
            <motion.div 
              style={{ x }}
              className="flex justify-between px-16 bg-transparent"
            >
              <div className="grid gap-2">
                {articleCardsData.map((card, i) => (
                  <figure key={i} className="sticky top-0 h-screen grid place-content-center">
                    <ArticleCard {...card} />
                  </figure>
                ))}
              </div>
            </motion.div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 z-20 bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScrollCard;