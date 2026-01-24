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
    img2: "https://paragraph.b-cdn.net/ChatGPT%20Image%20Jan%2021%2C%202026%2C%2010_22_19%20PM.webp", // Section 2
    img3: "https://paragraph.b-cdn.net/battle/paragraph%20mentor/PM5.webp", // Section 3
    img4: "https://paragraph.b-cdn.net/battle/paragraph%20mentor/PM2.webp", // Section 4
    img5: "https://paragraph.b-cdn.net/ChatGPT%20Image%20Jan%2021%2C%202026%2C%2010_35_27%20PM.webp",
    img6: "https://paragraph.b-cdn.net/final%20image.webp",

    // UNUSED / FUTURE (LEFT INTACT)
    img7: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img7.webp",
    img8: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img8.webp",
    img9: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img9.webp",
    img10: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img10.webp",
    img11: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img11.webp",
  };

  /**
   * WEB VIDEOS (Bunny Stream iframe URLs)
   * These are used ONLY on web layouts.
   */
const videos = {
  hero: "https://iframe.mediadelivery.net/embed/562001/fd252cc5-912d-4134-86f9-9732f883facf",
};


  return (
    <MainLayout>
      <HomeScreen images={images} videos={videos} />
    </MainLayout>
  );
}
