import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import { catchAsync } from "../utils/catchAsync.ts";
import { AppError } from "../utils/AppError.ts";
import { jwtUtils } from "../utils/jwt.ts";
import config from "../config/index.ts";
import { UserRole } from "../../generated/prisma/enums.ts";
import { prisma } from "../libs/prisma.ts";








export interface RequestUser {
  email: string;
  name: string;
  userId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export const auth = (...requiredRoles: UserRole[]) => {
  return catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const token = req.cookies?.accessToken;

      if (!token) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "You are not logged in. Please log in.",
        );
      }

      const verifiedToken = jwtUtils.verifyToken(
        token,
        config.jwt_access_secret,
      );

      if (!verifiedToken.success) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          verifiedToken.error,
        );
      }

      const { email, name, userId, role } =
        verifiedToken.data as JwtPayload & {
          userId: string;
          name: string;
          email: string;
          role: UserRole;
        };

      if (!userId) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "Invalid authentication token.",
        );
      }

      if (requiredRoles.length && !requiredRoles.includes(role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You don't have permission to access this resource.",
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError(
          httpStatus.UNAUTHORIZED,
          "User not found. Please log in again.",
        );
      }

      req.user = {
        email: user.email,
        name: user.name,
        userId: user.id,
        role: user.role,
      };

      next();
    },
  );
};