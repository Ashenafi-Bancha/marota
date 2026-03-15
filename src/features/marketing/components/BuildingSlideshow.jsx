import { useState, useEffect } from "react";

const BuildingSlideshow = ({ images, interval = 3000 }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return (
    <div className="overflow-hidden rounded-xl shadow-lg w-full h-64 md:h-full">
      <img
        src={images[current]}
        alt={`Marota Building ${current + 1}`}
        className="w-full h-full object-cover transition duration-700 ease-in-out"
      />
    </div>
  );
};

export default BuildingSlideshow;
