import React from 'react';

interface ScrollCardProps {
  card?: {
    title: string;
    description: string;
    link: string;
    linkText: string;
  };
}

const ScrollCard: React.FC<ScrollCardProps> = ({ card }) => {
  const defaultCard = {
    title: "Título Padrão",
    description: "Descrição padrão do card",
    link: "#",
    linkText: "Saiba mais"
  };

  const cardData = card || defaultCard;

  return (
    <div className="bg-purple-900/80 backdrop-blur-sm rounded-xl p-6 border border-purple-700">
      <h3 className="text-xl font-semibold text-white mb-2">{cardData.title}</h3>
      <p className="text-center">{cardData.description}</p>
      <a
        href={cardData.link}
        target="_blank"
        className="w-fit bg-purple-800 p-3 rounded-md cursor-pointer text-white mx-auto block text-center"
      >
        {cardData.linkText}
      </a>
    </div>
  );
};

export default ScrollCard;