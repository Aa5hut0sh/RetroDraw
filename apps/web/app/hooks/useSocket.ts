import { useEffect, useState } from "react";
import { WS_URL } from "../config";



export function useSocket() {
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const protocol =
      window.location.protocol === "https:" ? "wss" : "ws";

    const wsUrl = `${protocol}://${window.location.host}/ws?token=${token}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsLoading(false);
      setSocket(ws);
    };

    ws.onerror = () => {
      setIsLoading(false);
    };

    return () => ws.close();
  }, []);

  return { socket, isLoading };
}



export function useAuth() {
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = () => {
        const token = localStorage.getItem("token");
        setIsLoggedin(!!token);
        setIsLoading(false);
    };
    
    useEffect(() => {
        checkAuth();
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    return {
        isLoggedin,
        isLoading,
        checkAuth
    };
}



export function useRoomAuth(roomSlug: string) {
  const [hasAccess, setHasAccess] = useState(false);
  const [RoomLoading, setRoomLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem("room_access");

    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.slug === roomSlug && parsed.verified) {
        setHasAccess(true);
      }
    }

    setRoomLoading(false);
  }, [roomSlug]);

  return {
    hasAccess,
    RoomLoading,
  };
}
