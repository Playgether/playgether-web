'use client'

import { useState, useEffect } from 'react';

const TextLimitComponent = ({ text, maxCharacters }) => {
  const [limitedText, setLimitedText] = useState(text);

  useEffect(() => {
    if (text.length > maxCharacters) {
      setLimitedText(text.substring(0, maxCharacters) + '...');
    } else {
      setLimitedText(text);
    }
  }, [text, maxCharacters]);

  return (
    <div className="w-full">

        {limitedText}

    </div>
  );
};

export default TextLimitComponent;
