type StaticPhoneProps = {
  className?: string
  imageAlt: string
  imageSrc: string
}

export function StaticPhone({ className = "", imageAlt, imageSrc }: StaticPhoneProps) {
  return (
    <div
      className={`relative m-0 aspect-phone overflow-hidden rounded-phone-mobile border-phone border-ink bg-device shadow-phone desktop:rounded-phone ${className}`}
    >
      <img
        alt={imageAlt}
        className="h-full w-full object-cover"
        decoding="async"
        height="2622"
        loading="lazy"
        src={imageSrc}
        width="1206"
      />
    </div>
  )
}
