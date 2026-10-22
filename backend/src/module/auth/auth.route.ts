
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validateRequest } from "../../middlewares/validateRequst.ts";
import { auth } from "../../middlewares/checkAuth.ts";
import { AuthController } from "./auth.controller.ts";
import { AuthValidation } from "./auth.validation.ts";
import { UserRole } from "../../../generated/prisma/enums.ts";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

router.post(
  "/register",
  authLimiter,
  validateRequest(AuthValidation.RegistrationZodSchema),
  AuthController.register,
);

router.post(
  "/login",
  authLimiter,
  validateRequest(AuthValidation.LoginZodSchema),
  AuthController.loginUser,
);

router.get(
  "/me",
  auth(UserRole.MENTOR, UserRole.STUDENT),
  AuthController.getMe,
);

router.post("/logout", AuthController.logout);

export const AuthRoutes = router;
