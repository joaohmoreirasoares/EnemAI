import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  title: string;
  description: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
}

interface ScrollCardProps {
  className?: string;
}

const articleCardsData: ArticleCardProps[] = [
  {
    title: "Como usar a IA para estudar",
    description: "Descubra técnicas eficazes para utilizar inteligência artificial no seu processo de aprendizagem e maximizar seus resultados nos estudos.",
    date: "15 de Maio, 2023",
    author: "Equipe Enem AI",
    readTime: "5 min",
    category: "Dicas de Estudo"
  },
  {
    title: "Planejamento estratégico para o ENEM",
    description: "Aprenda a criar um plano de estudos eficiente que cobre todas as áreas do ENEM e se adapta ao seu ritmo e disponibilidade.",
    date: "22 de Abril, 2023",
    author: "Prof. Carlos Silva",
    readTime: "8 min",
    category: "Planejamento"
  },
  {
    title: "Análise de redação nota 1000",
    description: "Entenda os critérios que levam a uma redação nota máxima no ENEM e veja exemplos práticos de como aplicá-los.",
    date: "10 de Março, 2023",
    author: "Dra. Ana Beatriz",
    readTime: "12 min",
    category: "Redação"
  }
];

const ArticleCard = ({ title, description, date, author, readTime, category }: ArticleCardProps) => {
  return (
    <div className="max-w-2xl mx-auto bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 md:p-8 shadow-xl">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-xs font-medium">
          {category}
        </span>
        <span className="text-gray-400 text-sm">{date}</span>
        <span className="text-gray-400 text-sm">•</span>
        <span className="text-gray-400 text-sm">{readTime}</span>
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">{title}</h2>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        {description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mr-3">
            <span className="font-semibold text-white text-sm">
              {author.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="text-gray-300 font-medium">{author}</span>
        </div>
        
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium">
          Ler mais
        </button>
      </div>
    </div>
  );
};

export default function ScrollCard({ className }: ScrollCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const [activeCard, setActiveCard] = useState(0);
  const cardProgress = useTransform(
    scrollYProgress,
    [0, 1],
    [0, articleCardsData.length - 1]
  );
  
  // Update active card based on scroll progress
  cardProgress.on("change", (latest) => {
    const newIndex = Math.min(Math.floor(latest), articleCardsData.length - 1);
    if (newIndex !== activeCard) {
      setActiveCard(newIndex);
    }
  });

  return (
    <div ref={containerRef} className={cn("h-[300vh] bg-transparent", className)}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden bg-transparent">
        <div className="flex justify-between px-16 bg-transparent"> // <-- MODIFIED HERE
          <div className="grid gap-2">
            {articleCardsData.map((card, i) => (
              <figure key={i} className="sticky top-0 h-screen grid place-content-center">
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: activeCard === i ? 1 : 0.3,
                    y: activeCard === i ? 0 : 50,
                    scale: activeCard === i ? 1 : 0.9
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <ArticleCard {...card} />
                </motion.div>
              </figure>
            ))}
          </div>
          
          <div className="h-full flex items-center">
            <div className="flex flex-col space-y-4">
              {articleCardsData.map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-10 rounded-full bg-gray-700 overflow-hidden cursor-pointer"
                  onClick={() => setActiveCard(i)}
                >
                  <motion.div
                    className="w-full bg-purple-600 rounded-full"
                    initial={{ height: "0%" }}
                    animate={{ 
                      height: activeCard === i ? "100%" : activeCard > i ? "100%" : "0%" 
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}