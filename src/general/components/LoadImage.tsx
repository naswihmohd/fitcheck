import { useEffect, useState } from "react";

interface LoadImageItem {
  itemIndex: number | null;
  isLoaded: boolean;
}

const LoadImage = ({
  src,
  alt,
  index,
  className,
  widthFix,
  onLoad,
  onStartLoad,
}: {
  src: string;
  alt: string | null;
  index: number;
  className: string;
  widthFix?: boolean;
  onLoad?: () => void;
  onStartLoad?: () => void;
}) => {
  const [loaded, setLoaded] = useState<LoadImageItem[]>([]);

  useEffect(() => {
    if (src == null) return;

    if (loaded.find((item) => item.itemIndex === index)?.isLoaded) return;

    onStartLoad?.(); // notify parent image load started

    const image = new Image();
    image.src = src;

    const handleLoad = () => {
      setLoaded((prev) =>
        prev.map((item) =>
          item.itemIndex === index ? { ...item, isLoaded: true } : item
        )
      );
      onLoad?.(); // notify parent image finished loading
    };

    image.addEventListener("load", handleLoad);
    return () => image.removeEventListener("load", handleLoad);
  }, [src, index]);

  useEffect(() => {
    if (!loaded.find((item) => item.itemIndex === index)) {
      setLoaded((prev) => [...prev, { itemIndex: index, isLoaded: false }]);
    }
  }, [index]);

  const isImageLoaded = loaded.find((item) => item.itemIndex === index)?.isLoaded;

  return (
    <>
      {!isImageLoaded ? (
        <div
          className={`${!widthFix && 'w-full h-full'} flex justify-center items-center ${className}
          animate-pulse bg-gray-600 border-none`}
        >
        </div>
      ) : (
        <img alt={alt ?? ""} src={src} className={className} />
      )}
    </>
  );
};

export default LoadImage;
