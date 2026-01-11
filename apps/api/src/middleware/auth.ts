import { type Request, type Response, type NextFunction } from "express";
import { prisma } from "@repo/database";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Check for session token in cookies or Authorization header
  // Note: NextAuth v5 default cookie name might be 'authjs.session-token' or '__Secure-authjs.session-token'
  const token =
    req.cookies?.["authjs.session-token"] ||
    req.cookies?.["__Secure-authjs.session-token"] ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      res.status(401).json({ error: "Unauthorized: Invalid or expired session" });
      return;
    }

    (req as any).user = session.user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
