import { useEffect, useState } from 'react';
import './FloatingNumber.css';

interface FloatingNumberProps {
  value: number; // positive = heal, negative = damage
  id: number;    // unique key for re-rendering
  onComplete: () => void;
}

export function FloatingNumber({ value, id, onComplete }: FloatingNumberProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, 1500);
    return () => clearTimeout(timer);
  }, [id, onComplete]);

  if (!visible) return null;

  const isHeal = value > 0;
  const display = isHeal ? `+${value}` : `${value}`;

  return (
    <div
      className={`floating-number ${isHeal ? 'floating-number--heal' : 'floating-number--damage'}`}
      key={id}
    >
      {display}
    </div>
  );
}
