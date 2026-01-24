// WebMedia.tsx
import React from "react";
import { Platform, Image } from "react-native";

export default function WebMedia({
  image,
  video,
  style,
}: {
  image: string;
  video?: string;
  style?: any;
}) {
  // ✅ WEB → VIDEO
  if (Platform.OS === "web" && video) {
    return (
      <video
        src={video}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 16,
          objectFit: "cover",
          display: "block",
          ...style,
        }}
      />
    );
  }

  // ✅ MOBILE → IMAGE FALLBACK
  return <Image source={{ uri: image }} style={style} />;
}
