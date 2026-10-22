import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client.js";

type AppErrorType = Error & {
  statusCode?: number;
  status?: number;
  code?: string;
  errorCode?: string;
};

export const globalErrorHandling = (
  err: AppErrorType,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode =
    err.statusCode ?? err.status ?? httpStatus.INTERNAL_SERVER_ERROR;
  let errorMessage = err.message || "Internal server error";
  const errorName = err.name || "InternalServerError";

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage =
      "You have provided an incorrect field type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.CONFLICT;
      errorMessage = "Duplicate record already exists";
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = httpStatus.NOT_FOUND;
      errorMessage = "The requested record was not found";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      errorMessage = "Database authentication failed";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.SERVICE_UNAVAILABLE;
      errorMessage = "Unable to connect to the database server";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errorMessage = "An error occurred during query execution";
  }

  res.status(statusCode).json({
    success: false,
    name: errorName,
    statusCode,
    message: errorMessage,
  });
};