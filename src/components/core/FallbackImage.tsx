import { IKImageProps, Image } from "@imagekit/next";
import { StaticImport } from "next/dist/shared/lib/get-img-props";
import { useState, useEffect } from "react";

export default function ImageFallback({
  src,
  fallbackSrc,
  alt,
  ...rest
}: IKImageProps & {
  fallbackSrc: string | StaticImport;
}) {
  const [imgSrc, set_imgSrc] = useState<string | StaticImport>(src);

  useEffect(() => {
    set_imgSrc(src);
  }, [src]);

  return (
    <Image
      {...rest}
      src={imgSrc as string}
      alt={alt}
      onLoad={(result) => {
        if (result.currentTarget.width === 0) {
          // Broken image
          set_imgSrc(fallbackSrc);
        }
      }}
      onError={() => {
        set_imgSrc(fallbackSrc);
      }}
    />
  );
}
