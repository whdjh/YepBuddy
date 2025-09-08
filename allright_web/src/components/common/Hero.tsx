interface HeroProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function Hero({ title, subtitle }: HeroProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md py-20 bg-gradient-to-t from-[var(--background)] to-[rgba(22,163,74,0.12)]">
      <h1 className="text-5xl font-bold">{title}</h1>
      {subtitle && <p className="text-2xl font-light text-foreground">{subtitle}</p>}
    </div>
  );
}
