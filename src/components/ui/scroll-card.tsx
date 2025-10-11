import React from 'react';

interface ScrollCardProps {
  card: {
    title: string;
    description: string;
    link: string;
    linkText: string;
  };
}

const ScrollCard: React.FC<ScrollCardProps> = ({ card }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-2">{card.title}</h3>
      <p className="text-center">{card.description}</p>
      <a
        href={card.link}
        target="_blank"
        className="w-fit bg-black p-3 rounded-md cursor-pointer text-white mx-auto block text-center"
      >
        {card.linkText}
      </a>
    </div>
  );
};

export default ScrollCard;