
// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   ArrowRight,
//   Eye,
//   EyeOff,
//   LoaderCircle,
//   LockKeyhole,
//   Mail,
//   ShieldCheck,
//   User,
// } from "lucide-react";
// import { toast } from "sonner";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { registerAction } from "../(auth)/_actions/authAction";

// const registerSchema = z.object({
//   name: z.string().trim().min(2, "Name must contain at least 2 characters"),
//   email: z.string().trim().email("Enter a valid email address"),
//   password: z.string().min(8, "Password must contain at least 8 characters"),
// });

// type RegisterValues = z.infer<typeof registerSchema>;

// type RegisterResponse = {
//   success: boolean;
//   statusCode: number;
//   message: string;
//   data: {
//     id: string;
//     name: string;
//     email: string;
//     role: "STUDENT" | "MENTOR";
//     createdAt: string;
//   };
// };

// function isRegisterResponse(value: unknown): value is RegisterResponse {
//   if (typeof value !== "object" || value === null) return false;

//   const response = value as Record<string, unknown>;
//   const data = response.data;

//   if (typeof data !== "object" || data === null) return false;

//   const user = data as Record<string, unknown>;

//   return (
//     typeof response.success === "boolean" &&
//     typeof response.message === "string" &&
//     typeof user.id === "string" &&
//     typeof user.name === "string" &&
//     typeof user.email === "string" &&
//     (user.role === "STUDENT" || user.role === "MENTOR")
//   );
// }

// export default function RegisterForm() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const form = useForm<RegisterValues>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//       password: "",
//     },
//   });

//   const onSubmit = async (values: RegisterValues) => {
//     if (loading) return;

//     setLoading(true);

//     try {
//       const result: unknown = await registerAction({
//         name: values.name.trim(),
//         email: values.email.trim(),
//         password: values.password,
//       });

//       if (!isRegisterResponse(result)) {
//         toast.error("Invalid server response. Please try again.");
//         return;
//       }

//       if (!result.success) {
//         toast.error(result.message || "Registration failed.");
//         return;
//       }

//       toast.success(result.message || "Registration successful!");

//       if (result.data.role === "STUDENT") {
//         router.replace("/student/dashboard");
//       } else {
//         router.replace("/mentor/dashboard");
//       }

//       router.refresh();
//     } catch (error: unknown) {
//       toast.error(
//         error instanceof Error
//           ? error.message
//           : "Something went wrong. Please try again.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-background to-violet-50 px-4 py-10 dark:from-background dark:via-background dark:to-indigo-950/20">
//       <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border bg-background shadow-2xl lg:grid-cols-2">
//         {/* Left panel */}
//         <section className="relative hidden overflow-hidden p-8 text-white lg:flex lg:flex-col xl:p-10">
//           <div
//             className="absolute inset-0 bg-cover bg-center"
//             style={{
//               backgroundImage:
//                 "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80')",
//             }}
//           />
//           <div className="absolute inset-0 bg-slate-950/75" />

//           <div className="relative z-10 flex h-full flex-col">
//             <Link href="/" className="inline-flex items-center gap-3">
//               <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
//                 <ShieldCheck className="h-5 w-5" />
//               </div>
//               <div>
//                 <p className="text-xl font-bold tracking-tight">
//                   Project Review Hub
//                 </p>
//                 <p className="text-xs text-white/70">
//                   Project submission and review
//                 </p>
//               </div>
//             </Link>

//             <div className="mt-20 max-w-xl xl:mt-24">
//               <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur">
//                 <span className="h-2 w-2 rounded-full bg-indigo-400" />
//                 Join the community
//               </div>

//               <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
//                 Share your projects.
//                 <br />
//                 <span className="text-indigo-300">
//                   Get valuable feedback.
//                 </span>
//               </h1>

//               <p className="mt-5 max-w-lg text-base leading-7 text-white/80">
//                 Create your account to submit projects, track reviews, and
//                 improve your work with Project Review Hub.
//               </p>

//               <div className="mt-8 space-y-3">
//                 <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
//                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-400/20 text-indigo-200">
//                     <User className="h-5 w-5" />
//                   </div>
//                   <div>
//                     <p className="text-sm font-semibold">Submit Your Projects</p>
//                     <p className="mt-0.5 text-xs text-white/70">
//                       Share your project and follow its review status.
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
//                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/20 text-violet-200">
//                     <ShieldCheck className="h-5 w-5" />
//                   </div>
//                   <div>
//                     <p className="text-sm font-semibold">Get Project Feedback</p>
//                     <p className="mt-0.5 text-xs text-white/70">
//                       Track reviews and improve your projects.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="mt-auto pt-10">
//               <p className="text-sm font-semibold text-indigo-300">
//                 Build. Submit. Improve.
//               </p>
//               <p className="mt-1 text-xs text-white/70">
//                 Project Review Hub — learn through feedback.
//               </p>
//             </div>
//           </div>
//         </section>

//         {/* Registration form */}
//         <section className="flex items-center justify-center p-5 sm:p-8 lg:p-10">
//           <div className="w-full max-w-lg">
//             <div className="mb-8 text-center">
//               <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
//                 <User className="h-7 w-7" />
//               </div>
//               <h2 className="mt-5 text-3xl font-bold tracking-tight">
//                 Create your account
//               </h2>
//               <p className="mt-2 text-sm text-muted-foreground">
//                 Join Project Review Hub today.
//               </p>
//             </div>

//             <form
//               onSubmit={form.handleSubmit(onSubmit)}
//               className="space-y-5"
//               noValidate
//             >
//               {/* Name */}
//               <div className="space-y-2">
//                 <label htmlFor="name" className="text-sm font-medium">
//                   Full Name
//                 </label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                   <Input
//                     id="name"
//                     autoComplete="name"
//                     placeholder="Enter your full name"
//                     className="h-12 rounded-xl pl-10"
//                     disabled={loading}
//                     aria-invalid={Boolean(form.formState.errors.name)}
//                     {...form.register("name")}
//                   />
//                 </div>
//                 {form.formState.errors.name && (
//                   <p className="text-sm font-medium text-destructive">
//                     {form.formState.errors.name.message}
//                   </p>
//                 )}
//               </div>

//               {/* Email */}
//               <div className="space-y-2">
//                 <label htmlFor="email" className="text-sm font-medium">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                   <Input
//                     id="email"
//                     type="email"
//                     autoComplete="email"
//                     placeholder="you@example.com"
//                     className="h-12 rounded-xl pl-10"
//                     disabled={loading}
//                     aria-invalid={Boolean(form.formState.errors.email)}
//                     {...form.register("email")}
//                   />
//                 </div>
//                 {form.formState.errors.email && (
//                   <p className="text-sm font-medium text-destructive">
//                     {form.formState.errors.email.message}
//                   </p>
//                 )}
//               </div>

//               {/* Password */}
//               <div className="space-y-2">
//                 <label htmlFor="password" className="text-sm font-medium">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     autoComplete="new-password"
//                     placeholder="Enter your password"
//                     className="h-12 rounded-xl pl-10 pr-11"
//                     disabled={loading}
//                     aria-invalid={Boolean(form.formState.errors.password)}
//                     {...form.register("password")}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword((previous) => !previous)}
//                     disabled={loading}
//                     aria-label={showPassword ? "Hide password" : "Show password"}
//                     aria-pressed={showPassword}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
//                   >
//                     {showPassword ? (
//                       <EyeOff className="h-4 w-4" />
//                     ) : (
//                       <Eye className="h-4 w-4" />
//                     )}
//                   </button>
//                 </div>
//                 {form.formState.errors.password && (
//                   <p className="text-sm font-medium text-destructive">
//                     {form.formState.errors.password.message}
//                   </p>
//                 )}
//               </div>

//               <Button
//                 type="submit"
//                 disabled={loading}
//                 className="group h-12 w-full rounded-xl text-base font-semibold"
//               >
//                 {loading ? (
//                   <>
//                     <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
//                     Creating account...
//                   </>
//                 ) : (
//                   <>
//                     Create Account
//                     <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
//                   </>
//                 )}
//               </Button>
//             </form>

//             <div className="mt-6 text-center text-sm text-muted-foreground">
//               Already have an account?{" "}
//               <Link
//                 href="/login"
//                 className="font-semibold text-primary hover:underline"
//               >
//                 Sign in
//               </Link>
//             </div>

//             <div className="mt-6 rounded-2xl border bg-muted/40 p-4">
//               <div className="flex items-center gap-2 text-sm font-semibold">
//                 <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
//                 Secure Registration
//               </div>
//               <p className="mt-1 text-xs leading-5 text-muted-foreground">
//                 Your account is created using the Project Review Hub
//                 authentication service.
//               </p>
//             </div>
//           </div>
//         </section>
//       </div>
//     </main>
//   );
// }
