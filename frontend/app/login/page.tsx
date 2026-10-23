import Image from "next/image";
import LoginForm from "./LoginForm";


export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-2">
      {/* Left side image */}
<section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-950 lg:flex lg:items-center lg:justify-center">
  <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-indigo-900/30 to-blue-950/60" />

  <div className="relative z-10 flex flex-col items-center px-10 text-center xl:px-16">
    <h2 className="max-w-lg text-4xl font-bold leading-tight text-white xl:text-5xl">
      Welcome to Project Review Hub
    </h2>

    <p className="mt-5 max-w-lg text-base leading-7 text-white/85 xl:text-lg">
      Submit your projects, receive valuable feedback, and track your
      progress in one place.
    </p>
  </div>
</section>

      {/* Right side form */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}