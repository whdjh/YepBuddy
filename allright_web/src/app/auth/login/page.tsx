import AuthCard from "@/components/product/auth/login/AuthCard";

export default function Login() {
  return (
    <div className="grid grid-cols-2 min-h-[calc(100vh-8rem)]">
      <div className="bg-gradient-to-br from-[rgba(22,163,74,.45)] via-black/80 to-[rgba(22,163,74,.45)]" />
      <div className="flex flex-col items-center">
        <AuthCard />
      </div>
    </div>
  );
}