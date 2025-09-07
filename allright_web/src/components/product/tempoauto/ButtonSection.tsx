import { Button } from "@/components/ui/button";

interface ButtonSectionProps {
  selected: "concentric" | "eccentric" | null;
  setSelected: (id: "concentric" | "eccentric") => void;
}

export default function ButtonSection({ selected, setSelected }: ButtonSectionProps) {
  const handleClickButton = (id: "concentric" | "eccentric") => {
    setSelected(id);
  };

  return (
    <div className="flex gap-5 justify-center items-center mt-5">
      <Button
        type="button"
        onClick={() => handleClickButton('concentric')}
        className={`h-[3rem] w-[10rem] ${selected === "concentric" ? "bg-[#16a34a]" : "bg-gray-400"
          }`}
      >
        수축(단축성 수축)먼저
      </Button>
      <Button
        type="button"
        onClick={() => handleClickButton('eccentric')}
        className={`h-[3rem] w-[10rem] ${selected === "eccentric" ? "bg-[#16a34a]" : "bg-gray-400"
          }`}
      >
        이완(신장성 수축)먼저
      </Button>
    </div>
  );
}