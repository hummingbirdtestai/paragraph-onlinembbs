//useTypingAnimation.ts
import { useEffect, useState, useRef } from 'react';

interface UseTypingAnimationOptions {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export function useTypingAnimation({ text, speed = 20, onComplete }: UseTypingAnimationOptions) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    indexRef.current = 0;

    if (!text) return;

    const typeNextChar = () => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current += 1;
        timerRef.current = setTimeout(typeNextChar, speed);
      } else {
        setIsComplete(true);
        onCompleteRef.current?.();
      }
    };

    timerRef.current = setTimeout(typeNextChar, speed);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [text, speed]);

  return { displayedText, isComplete };
}
