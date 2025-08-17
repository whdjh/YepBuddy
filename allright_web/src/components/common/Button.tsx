import { clsx } from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "solid" | "outline" | "kakao";
  className?: string;
}

export default function Button({
  children,
  variant = "solid",
  className,
  ...props
}: ButtonProps) {
  const baseClasses = "rounded-[1rem] flex items-center justify-center cursor-pointer disabled:cursor-not-allowed";
  
  const variants = {
    solid: "bg-[#16a34a] hover:bg-[#22c55e] active:bg-[#4ade80] disabled:bg-gray-400",
    outline: "bg-transparent border border-solid text-[#16a34a] border-[#16a34a] hover:border-[#22c55e] hover:text-[#22c55e] active:border-[#16a34a] active:text-[#16a34a] disabled:border-gray-400 disabled:text-gray-400",
    kakao: "bg-[#FEE500] text-[#191919] hover:bg-[#FDD835] active:bg-[#FCC419] disabled:bg-gray-400 disabled:text-gray-600",
  };

  return (
    <button
      type="button"
      className={clsx(baseClasses, variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
