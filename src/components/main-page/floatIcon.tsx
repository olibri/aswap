import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

type Props = {
  src: string;
  size?: number;
  initialX: number | string;
  initialY: number | string;
};

export default function FloatIcon({ src, size = 42, initialX, initialY }: Props) {
  const controls = useAnimation();

  // генеруємо хаотичний рух по колу/синусоїді
  useEffect(() => {
    async function infiniteFloat() {
      while (true) {
        const x = (Math.random() - 0.5) * 160; 
        const y = (Math.random() - 0.5) * 160;
        const rotate = (Math.random() - 0.5) * 60; // ±30°
        await controls.start({
          x,
          y,
          rotate,
          transition: {
            duration: 3 + Math.random() * 2, 
            ease: "easeInOut",
          },
        });
      }
    }
    infiniteFloat();
  }, [controls]);

  return (
    <motion.img
      src={src}
      style={{
        position: "absolute",
        width: size,
        height: size,
        top: initialY,
        left: initialX,
        objectFit: "contain",
        cursor: "grab",
        zIndex: 2,
      }}
      initial={{ x: 0, y: 0, rotate: 0 }}
      animate={controls}
      drag
      dragMomentum
      dragElastic={0.18}
      whileTap={{ cursor: "grabbing", scale: 1.15 }}
    />
  );
}
