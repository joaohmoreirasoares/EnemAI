"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface ArticleCardProps {
  title: string;
  description: string;
  date: string;
  readTime: string;
  category: string;
}

const ArticleCard = ({ title, description, date, readTime, category }: ArticleCardProps) => (
  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 max-w-md">
    <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded-full mb-3">
      {category}
    </span>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-gray-300 mb-4">{description}</p>
    <div className="flex items-center justify-between text-sm text-gray-400">
      <span>{date}</span>
      <span>{readTime}</span>
    </div>
  </div>
);

const articleCardsData: ArticleCardProps[] = [
  {
    title: "Como Maximizar Seu Tempo de Estudo",
    description: "Descubra técnicas comprovadas para aumentar sua eficiência nos estudos e alcançar melhores resultados no ENEM.",
    date: "15 Mar 2024",
    readTime: "5 min",
    category: "Dicas de Estudo"
  },
  {
    title: "Entendendo as Competências da Redação",
    description: "Um guia completo sobre as cinco competências avaliadas na redação do ENEM e como se preparar para cada uma.",
    date: "22 Mar 2024",
    readTime: "8 min",
    category: "Redação"
  },
  {
    title: "Matemática: Álgebra e suas Aplicações",
    description: "Explore conceitos fundamentais de álgebra que aparecem com frequência nas questões de matemática do ENEM.",
    date: "30 Mar 2024",
    readTime: "10 min",
    category: "Matemática"
  },
  {
    title: "História do Brasil: Período Colonial",
    description: "Reveja os principais eventos e características do período colonial brasileiro, essenciais para o ENEM.",
    date: "5 Abr 2024",
    readTime: "7 min",
    category: "História"
  }
];

const ScrollCard = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const x = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const x2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const x3 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const x4 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div ref={containerRef} className="relative h-[300vh] overflow-hidden">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="flex justify-between px-16 opacity-60">
          <div className="grid gap-2">
            {articleCardsData.map((card, i) => (
              <figure 
                key={i} 
                className="sticky top-0 h-screen grid place-content-center"
                style={{ y: i === 0 ? x : i === 1 ? x2 : i === 2 ? x3 : x4 }}
              >
                <ArticleCard {...card} />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScrollCard;