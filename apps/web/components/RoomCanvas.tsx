"use client";

import { useEffect, useRef, useState } from "react";
import { initDraw } from "@/draw";
import { WS_URL } from "@/app/config";
import { Canvas } from "@/components/canvas";
import { useAuth } from "@/app/hooks/useSocket";
import { useRouter } from "next/navigation";
import { useRoomAuth } from "@/app/hooks/useSocket";
const token = localStorage.getItem("token");

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
    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: roomId,
        }),
      );
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  if (!socket) {
    return <div> Connecting to server</div>;
  }

  return <Canvas roomId={roomId} socket={socket} />;
}
