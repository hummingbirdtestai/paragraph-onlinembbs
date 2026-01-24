import React from 'react';
import HomeScreen from '@/components/HomeScreen';
import MainLayout from '@/components/MainLayout';

export default function Index() {
  /**
   * IMAGE ASSETS
   * Used for BOTH mobile and web.
   * img1 is the HERO image (system-first illustration).
   */
  const images = {
    // HERO (FINAL)
    img1: "https://paragraph.b-cdn.net/Heroimage.webp",

    // SECTION IMAGES
    img2: "https://paragraph.b-cdn.net/second%20image.webp",
    img3: "https://paragraph.b-cdn.net/THIRD%20IMAGE.webp",
    img4: "https://paragraph.b-cdn.net/FOURTH%20IMAGE.webp",
    img5: "https://paragraph.b-cdn.net/ChatGPT%20Image%20Jan%2021%2C%202026%2C%2010_35_27%20PM.webp",
    img6: "https://paragraph.b-cdn.net/final%20image.webp",

    // UNUSED / FUTURE (safe to keep)
    img7: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img7.webp",
    img8: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img8.webp",
    img9: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img9.webp",
    img10: "https://paragraph.b-cdn.net/battle/Home%20page%20images/img10.webp",
  };

  return (
    <MainLayout>
      <HomeScreen images={images} />
    </MainLayout>
  );
}
