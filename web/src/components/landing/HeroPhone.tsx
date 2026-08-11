type HeroPhoneProps = {
  imageAlt: string
  imageSrc: string
  mobileImageSrc: string
}

export function HeroPhone({ imageAlt, imageSrc, mobileImageSrc }: HeroPhoneProps) {
  return (
    <div className="relative aspect-phone w-51.25 phone:w-63.75">
      <div className="absolute inset-0 overflow-hidden rounded-phone-mobile border-phone border-ink bg-device shadow-phone phone:rounded-phone">
        <picture className="block h-full w-full">
          <source media="(max-width: 760px)" srcSet={mobileImageSrc} />
          <img
            alt={imageAlt}
            className="h-full w-full object-cover"
            decoding="async"
            fetchPriority="high"
            height="2622"
            loading="eager"
            src={imageSrc}
            width="1206"
          />
        </picture>
      </div>
    </div>
  )
}
