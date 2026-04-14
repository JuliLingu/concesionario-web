import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0b] px-4 pt-32 pb-16 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(181,0,11,0.05),transparent_50%)]" />
      
      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-primary/80 mb-4 block animate-fade-in">
            Acceso Exclusivo
          </span>
          <h1 className="text-6xl font-bold tracking-tighter text-white font-space uppercase leading-none mb-2">
            Login<span className="text-primary">.</span>
          </h1>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/30">
            The Kinetic Gallery Experience
          </p>
        </div>

        <div className="bg-white/5 p-[1px] rounded-sm backdrop-blur-sm shadow-2xl">
           <div className="bg-white p-10 md:p-12 shadow-premium">
              <LoginForm />
           </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
            Est. 2024 &copy; JBJ Automotores
          </p>
        </div>
      </div>
    </div>
  );
}