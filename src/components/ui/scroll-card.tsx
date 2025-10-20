import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const articleCardsData = [
  {
    title: "Inteligência Artificial no ENEM",
    description: "Como a IA está revolucionando a preparação para o ENEM e ajudando estudantes a alcançarem melhores resultados.",
    image: "https://images.unsplash.com/photo-1677442135722-5f11e06a4e6d?w=800&auto=format&fit=crop",
    author: "Prof. Ana Silva",
    readTime: "5 min"
  },
  {
    title: "Técnicas de Redação",
    description: "Domine as competências da redação do ENEM com nossas técnicas comprovadas e exemplos práticos.",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop",
    author: "Prof. Carlos Mendes",
    readTime: "8 min"
  },
  {
    title: "Matemática para ENEM",
    description: "Estratégias eficazes para resolver os principais tópicos de matemática que mais caem no ENEM.",
    image: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&auto=format&fit=crop",
    author: "Prof. Roberta Santos",
    readTime: "10 min"
  },
  {
    title: "História e Geografia",
    description: "Dicas para dominar as questões interdisciplinares de história e geografia no ENEM.",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop",
    author: "Prof. João Almeida",
    readTime: "7 min"
  }
];

const ScrollCard = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance cards every 5 seconds when not hovered
  useEffect(() => {
    if (!isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentCardIndex((prev) => (prev + 1) % articleCardsData.length);
      }, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered]);

  // Sync scroll progress with card index
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const newIndex = Math.floor(latest * articleCardsData.length);
      if (newIndex < articleCardsData.length) {
        setCurrentCardIndex(newIndex);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % articleCardsData.length);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + articleCardsData.length) % articleCards.length);
  };

  const currentCard = articleCardsData[currentCardIndex];

  return (
    <div 
      ref={containerRef} 
      className="relative h-[500px] overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background with gradient overlay */}
      <div className="absolute inset-0">
        <img 
          src={currentCard.image} 
          alt={currentCard.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/40 to-gray-900/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="flex justify-between px-16 w-full">
          <div className="grid gap-2">
            {articleCardsData.map((card, i) => (
              <figure 
                key={i} 
                className="sticky top-0 h-screen grid place-content-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: currentCardIndex === i ? 1 : 0.7,
                    y: currentCardIndex === i ? 0 : 20
                  }}
                  transition={{ duration: 0.5 }}
                  className="max-w-md"
                >
                  <Card className="bg-gray-800/80 backdrop-blur-sm border-gray-700 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={card.image} 
                          alt={card.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center text-sm text-gray-400 mb-2">
                          <span>{card.author}</span>
                          <span className="mx-2">•</span>
                          <span>{card.readTime}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                        <p className="text-gray-300">{card.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </figure>
            ))}
          </div>

          {/* Main featured card */}
          <div className="max-w-2xl">
            <motion.div
              key={currentCardIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl font-bold text-white mb-4">{currentCard.title}</h2>
              <p className="text-xl text-gray-200 mb-6">{currentCard.description}</p>
              <div className="flex items-center text-gray-300 mb-8">
                <span>{currentCard.author}</span>
                <span className="mx-3">•</span>
                <span>{currentCard.readTime}</span>
              </div>
              <Button 
                size="lg" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
              >
                Ler Artigo Completo
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="outline"
        size="icon"
        onClick={prevCard}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={nextCard}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Progress indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {articleCardsData.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentCardIndex(i)}
            className={`w-3 h-3 rounded-full transition-colors ${
              i === currentCardIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ScrollCard;