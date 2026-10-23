import type { Request, Response } from "express";
import httpStatus from "http-status";

import { catchAsync } from "../../utils/catchAsync.ts";
import { sendResponse } from "../../utils/sendResponse.ts";
import { AppError } from "../../utils/AppError.ts";

import { AuthService } from "./auth.service.ts";
import type { IRequestUser } from "./auth.interface.ts";

const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    path: "/",
  };
};

const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Student registered successfully",
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);
  const { accessToken, refreshToken, user } = result;

  const cookieOptions = getCookieOptions();

  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      ...user,
      accessToken,
      refreshToken,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as IRequestUser | undefined;

  if (!user?.userId) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "You are not logged in. Please log in to access this resource.",
    );
  }

  const result = await AuthService.getMe(user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result,
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  const cookieOptions = getCookieOptions();

  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged out successfully",
    data: null,
  });
});

export const AuthController = {
  register,
  loginUser,
  getMe,
  logout,
};
