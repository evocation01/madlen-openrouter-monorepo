import { type Request, type Response, type NextFunction } from "express";
import { decode } from "@auth/core/jwt";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token =
    req.cookies?.["authjs.session-token"] ||
    req.cookies?.["__Secure-authjs.session-token"] ||
    req.headers.authorization?.replace("Bearer ", "");

  console.log("Auth Middleware Debug:");
  console.log("- Cookies:", req.cookies ? Object.keys(req.cookies) : "None");
  console.log("- Token found:", !!token);

  if (!token) {
    res.status(401).json({ error: "Unauthorized: No token" });
    return;
  }

  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
        console.error("AUTH_SECRET is not set in API");
        res.status(500).json({ error: "Server Configuration Error" });
        return;
    }

    // Determine salt based on cookie name present
    // Default to 'authjs.session-token' if not secure, or just pass the cookie name if we know it.
    // decode() uses 'authjs.session-token' as default salt if not provided.
    // However, if it's __Secure, we MUST provide the salt.
    let salt = "authjs.session-token";
    if (req.cookies?.["__Secure-authjs.session-token"]) {
        salt = "__Secure-authjs.session-token";
    }

    const decoded = await decode({ 
        token, 
        secret,
        salt, // Important for HKDF key derivation
    });

    if (!decoded || !decoded.sub) {
        console.log("- JWT verification failed: Invalid payload or signature");
        res.status(401).json({ error: "Unauthorized: Invalid token" });
        return;
    }

    console.log("- JWT Verified. User ID:", decoded.sub);

    // Attach user to request
    (req as any).user = { id: decoded.sub, email: decoded.email, name: decoded.name };
    next();
  } catch (error) {
    console.error("Auth middleware error (JWT):", error);
    res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
}
