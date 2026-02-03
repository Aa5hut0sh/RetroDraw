"use client";

import { useEffect, useRef, useState } from "react";
import { initDraw } from "@/draw";
import { WS_URL } from "@/app/config";
import { Canvas } from "@/components/canvas";
import { useAuth } from "@/app/hooks/useSocket";
import { useRouter } from "next/navigation";
import { useRoomAuth } from "@/app/hooks/useSocket";

export default function RoomCanvas({
  roomId,
  slug,
}: {
  roomId: number;
  slug: string;
}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const router = useRouter();
  const { isLoading, isLoggedin } = useAuth();
  const { RoomLoading , hasAccess } = useRoomAuth(slug);

  useEffect(() => {
    if (!isLoading && !isLoggedin) {
      router.push("/signin");
    }
  }, [isLoggedin, isLoading, router]);

  useEffect(() => {
    if (!RoomLoading && !hasAccess) {
      router.push("/joinroom");
    }
  }, [hasAccess, RoomLoading]);

  useEffect(() => {
    if (isLoading || RoomLoading){
      console.log("loading error");
      return;
    } 
    if (!isLoggedin || !hasAccess){
      console.log("Access error");
      return;
    } 

    const token = localStorage.getItem("token");
    if (!token) {
      console.log("token error");
      return;
    }

    const ws = new WebSocket(`${WS_URL}/ws?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: roomId,
        }),
      );
    };

    ws.onerror = (e) => console.error("WS error", e);
    ws.onclose = (e) => console.log("WS closed", e.code, e.reason);

    return () => {
      ws.close();
    };
  }, [roomId , isLoading , RoomLoading , isLoggedin , hasAccess]);

  if (!socket) {
    return <div> Connecting to server</div>;
  }

  return <Canvas roomId={roomId} socket={socket} />;
}
