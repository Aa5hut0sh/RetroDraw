import jwt from "jsonwebtoken";
import { IncomingMessage } from "http";
import WebSocket from "ws";

const JWT_SECRET = process.env.JWT_SECRET || "my-secret";
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}


export const authenticate = (
  req: IncomingMessage,
  ws: WebSocket,
): { userId: string } | null => {
  try {
    const url = req.url;

    if (!url) {
      ws.close(1008, "no url");
      return null;
    }

    const queryParams = new URLSearchParams(url.split("?")[1]);
    const token = queryParams.get("token");

    if (!token) {
      ws.close(1008, "Token missing");
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
      id: string;
    };

    const userId = decoded.id;
    if (!userId) {
      ws.close(1008, "Invalid token payload");
      return null;
    }

    return { userId };
  } catch (err) {
    ws.close(1008, "Invalid token");
    return null;
  }
};
