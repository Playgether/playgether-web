import { useEffect, useState } from "react";

export default function TextLimitComponentFunction(
  text: string,
  maxCharacters: number
) {
  const [limitedText, setLimitedText] = useState(text);

  useEffect(() => {
    if (text.length > maxCharacters) {
      setLimitedText(text.substring(0, maxCharacters));
    } else {
      setLimitedText(text);
    }
  }, [text, maxCharacters]);

  return limitedText;
}
