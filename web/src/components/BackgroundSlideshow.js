'use client';

import { useState, useEffect } from 'react';
import styles from './BackgroundSlideshow.module.css';

const IMAGES = [
  '/wedding_table_bg.png',
  '/wedding_couple_bg.png',
  '/wedding_rings_bg.png',
  '/wedding_venue_bg.png'
];

export default function BackgroundSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % IMAGES.length);
    }, 6000); // Transition every 6 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.slideshowContainer}>
      <div className={styles.overlay} />
      {IMAGES.map((img, i) => (
        <div
          key={img}
          className={`${styles.slide} ${i === index ? styles.active : ''}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
    </div>
  );
}
