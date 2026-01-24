import React from 'react';
import HomeScreen from '@/components/HomeScreen';
import MainLayout from '@/components/MainLayout';

export default function Index() {
  /**
   * MOBILE IMAGES (UNCHANGED)
   * These are used exactly as-is on mobile layouts.
   */
  const images = {
    // HERO
    img1: "https://paragraph.b-cdn.net/battle/Home%20page%20images/HP1.webp",

    // SECTION IMAGES
    img2: "https://paragraph.b-cdn.net/ChatGPT%20Image%20Jan%2021%2C%202026%2C%2010_22_19%20PM.webp",
    img3: "https://paragraph.b-cdn.net/battle/paragraph%20mentor/PM5.webp",
    img4: "https://paragraph.b-cdn.net/battle/paragraph%20mentor/PM2.webp",
    img5: "https://paragraph.b-cdn.net/ChatGPT%20Image%20Jan%2021%2C%202026%2C%2010_35_27%20PM.webp",
    img6: "https://paragraph.b-cdn.net/final%20image.webp",

    // UNUSED / FUTURE
    img7: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img7.webp",
    img8: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img8.webp",
    img9: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img9.webp",
    img10: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img10.webp",
    img11: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img11.webp",
  };

  /**
   * WEB VIDEOS (Bunny Stream iframe URLs)
   */
  const videos = {
    hero: "https://iframe.mediadelivery.net/play/562001/fd252cc5-912d-4134-86f9-9732f883facf?autoplay=true&muted=true&loop=true&controls=false",
  };

  return (
    <MainLayout>
      <HomeScreen images={images} videos={videos} />
    </MainLayout>
  );
}
