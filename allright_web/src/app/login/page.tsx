import AuthCard from "@/components/product/login/AuthCard";

export default function Login() {
  return (
    <main className="mt-[5.5rem] mx-[0.5rem] bg-[#242429] p-[1rem] rounded-[0.5rem] min-h-[calc(100vh-5.5rem-1rem)]">
      <div className="pc:flex pc:items-center pc:justify-center pc:min-h-screen">
        <AuthCard />
      </div>
    </main>
  );
}