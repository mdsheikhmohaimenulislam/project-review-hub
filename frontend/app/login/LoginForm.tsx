"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { loginAction } from "../(auth)/_actions/authAction";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

type LoginUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type LoginResponse = {
  success?: boolean;
  message?: string;
  accessToken?: string;
  user?: LoginUser;
  data?: LoginUser & {
    user?: LoginUser;
    accessToken?: string;
  };
};

function isLoginResponse(value: unknown): value is LoginResponse {
  return typeof value === "object" && value !== null;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError("");

    try {
      const result: unknown = await loginAction(values);

      if (!isLoginResponse(result)) {
        setServerError("Unexpected server response. Please try again.");
        return;
      }

      if (result.success !== true) {
        setServerError(result.message ?? "Invalid email or password.");
        return;
      }

      // Supports both data.user.role and data.role responses.
      const responseData = result.data;
      const user = responseData?.user ?? responseData ?? result.user;
      const role = user?.role?.trim().toUpperCase();

      if (role !== "STUDENT" && role !== "MENTOR") {
        setServerError(
          "Login succeeded, but the account role is missing or invalid. Please contact the administrator.",
        );
        return;
      }

      const defaultPath =
        role === "MENTOR" ? "/mentor/dashboard" : "/student/dashboard";

      const requestedPath =
        searchParams.get("redirect") ?? searchParams.get("next");

      // Prevent external and protocol-relative redirects.
      const isSafePath =
        requestedPath?.startsWith("/") === true &&
        !requestedPath.startsWith("//") &&
        !requestedPath.includes("\\");

      const destination = isSafePath ? requestedPath : defaultPath;

      router.replace(destination);
      router.refresh();
    } catch (error: unknown) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
          <LockKeyhole size={26} />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Welcome back
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Sign in to your Project Review Hub account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {serverError}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email address
          </label>

          <div className="relative">
            <Mail
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
              className={`w-full rounded-xl border bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                errors.email
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
            />
          </div>

          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <div className="relative">
            <LockKeyhole
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password")}
              aria-invalid={Boolean(errors.password)}
              className={`w-full rounded-xl border bg-white py-3 pl-10 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 ${
                errors.password
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-gray-200 focus:border-indigo-500 focus:ring-indigo-100"
              }`}
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold text-indigo-600 transition hover:text-indigo-700 hover:underline"
        >
          Create an account
        </Link>
      </p>

      <p className="mt-4 text-center text-xs leading-5 text-gray-500">
        Sign in with the account provided to you for Project Review Hub.
      </p>
    </div>
  );
}