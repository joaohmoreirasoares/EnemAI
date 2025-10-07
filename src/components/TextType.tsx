import React, { useState, useEffect } from 'react';

interface TextTypeProps {
  text: string[];
  typingSpeed: number;
  pauseDuration: number;
  showCursor: boolean;
  cursorCharacter: string;
}

const TextType: React.FC<TextTypeProps> = ({
  text,
  typingSpeed,
  pauseDuration,
  showCursor,
  cursorCharacter
}) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = text[currentPhraseIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        setCurrentText(currentPhrase.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
        
        if (currentIndex === currentPhrase.length) {
          // Pause at end of phrase
          setTimeout(() => {
            setIsDeleting(true);
          }, pauseDuration);
        }
      } else {
        // Deleting - made much faster
        setCurrentText(currentPhrase.substring(0, currentIndex - 1));
        setCurrentIndex(currentIndex - 1);
        
        if (currentIndex === 0) {
          setIsDeleting(false);
          setCurrentPhraseIndex((currentPhraseIndex + 1) % text.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentIndex, currentPhraseIndex, isDeleting, text, typingSpeed, pauseDuration]);

  return (
    <span className="inline-block">
      {currentText}
      {showCursor && (
        <span className="animate-pulse inline-block w-1 h-6 bg-white ml-1 align-middle">
          {cursorCharacter}
        </span>
      )}
    </span>
  );
};

export default TextType;