import jwt from 'jsonwebtoken';


const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: verifiedToken,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Invalid or expired token",
    };
  }
};

export const jwtUtils = {
  verifyToken,
};
