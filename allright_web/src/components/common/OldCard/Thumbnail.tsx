import Image from "next/image";

interface ThumbnailProps {
  thumbnail: string;
  alt: string;
  isFirst: boolean;
}

export const Thumbnail = ({ thumbnail, alt, isFirst }: ThumbnailProps) => {
  return (
    <Image 
      src={thumbnail}
      alt={alt}
      loading={isFirst ? "eager" : "lazy"}
      width={343}
      height={200}
      className="h-full w-full object-cover"
    />
  );
};