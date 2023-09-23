'use client'

import { useState, useEffect, HTMLAttributes } from 'react';
import { twJoin } from 'tailwind-merge';

interface TextLimitComponentProps extends HTMLAttributes<HTMLDivElement> {
  text: string
  maxCharacters: number
  paragraphClassName?: string
}

const TextLimitComponent = ({ text, maxCharacters, paragraphClassName, ...rest }: TextLimitComponentProps) => {
  const [limitedText, setLimitedText] = useState(text);

  useEffect(() => {
    if (text.length > maxCharacters) {
      setLimitedText(text.substring(0, maxCharacters) + '...');
    } else {
      setLimitedText(text);
    }
  }, [text, maxCharacters]);

  return (
    <div className={twJoin(rest.className)}>

        <p className={twJoin(paragraphClassName)}>{limitedText}</p>

    </div>
  );
};

export default TextLimitComponent;
