'use client';

import { useEffect, useState } from 'react';
import styles from './AnimatedNumber.module.css';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
}

export const AnimatedNumber = ({ value, duration = 1000 }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const difference = value - displayValue;
    if (Math.abs(difference) < 0.1) {
      setDisplayValue(value);
      return;
    }

    const step = difference * 0.1;
    const timeout = setTimeout(() => {
      setDisplayValue(displayValue + step);
    }, 16);

    return () => clearTimeout(timeout);
  }, [value, displayValue]);

  return (
    <div className={styles.number}>
      {displayValue.toLocaleString()}
    </div>
  );
}; 