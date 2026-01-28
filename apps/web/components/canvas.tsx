"use client";
import { useEffect, useRef, useState } from "react";
import { initDraw } from "@/draw";
import { IconButton } from "./Icons";
import {
  Pencil,
  RectangleHorizontalIcon,
  Circle,
  Eraser,
  ArrowLeft,
  DoorOpen,
  TextCursor,
  Minus,
  Diamond,
  MousePointer2
} from "lucide-react";
import { Game } from "@/draw/Game";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/retroui/Drawer";
import { Button } from "@/components/retroui/Button";

export type Tool =
  | "rect"
  | "circle"
  | "pencil"
  | "eraser"
  | "arrow"
  | "leave"
  | "text"
  | "line"
  | "diamond"
  | "pointer";

export function Canvas({
  roomId,
  socket,
}: {
  roomId: number;
  socket: WebSocket;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("rect");

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      setGame(g);

      return () => {
        g.destroy();
      };
    }
  }, [canvasRef]);

  const getCursorStyle = () => {
    switch (selectedTool) {
      case "eraser":
        return `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSI5IiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMyIvPjwvc3ZnPg') 12 12, auto`;
      case "rect":
      case "circle":
      case "pencil":
      case "line":
      case "arrow":
      case "text":
      case "diamond":
        return "crosshair"; 
      default:
        return "default";
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ backgroundColor: "#f5f1e6" , cursor: getCursorStyle() }}
      />

      <Topbar  setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (shape: Tool) => void;
}) {
  const router = useRouter();
  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
      }}
    >
      <div className="flex gap-1">
        <IconButton
          icon={<MousePointer2/>}
          onClick={() => {
            setSelectedTool("pointer");
          }}
          activated={selectedTool === "pointer"}
        ></IconButton>
        <IconButton
          icon={<Pencil />}
          onClick={() => {
            setSelectedTool("pencil");
          }}
          activated={selectedTool === "pencil"}
        ></IconButton>
        <IconButton
          icon={<RectangleHorizontalIcon />}
          onClick={() => {
            setSelectedTool("rect");
          }}
          activated={selectedTool === "rect"}
        ></IconButton>
        <IconButton
          icon={<Diamond />}
          onClick={() => {
            setSelectedTool("diamond");
          }}
          activated={selectedTool === "diamond"}
        ></IconButton>
        <IconButton
          icon={<Circle />}
          onClick={() => {
            setSelectedTool("circle");
          }}
          activated={selectedTool === "circle"}
        ></IconButton>
        <IconButton
          icon={<TextCursor />}
          onClick={() => {
            setSelectedTool("text");
          }}
          activated={selectedTool === "text"}
        ></IconButton>
        <IconButton
          icon={<ArrowLeft />}
          onClick={() => {
            setSelectedTool("arrow");
          }}
          activated={selectedTool === "arrow"}
        ></IconButton>
        <IconButton
          icon={<Minus />}
          onClick={() => {
            setSelectedTool("line");
          }}
          activated={selectedTool === "line"}
        ></IconButton>
        <IconButton
          icon={<Eraser />}
          onClick={() => {
            setSelectedTool("eraser");
          }}
          activated={selectedTool === "eraser"}
        ></IconButton>

        <DrawerStyleDefault
          onClick={() => {
            localStorage.removeItem("room_access");
            router.push("/joinroom");
          }}
          selectedTool="leave"
          activated={selectedTool === "leave"}
          setSelectedTool={setSelectedTool}
        ></DrawerStyleDefault>
      </div>
    </div>
  );
}

export default function DrawerStyleDefault({
  onClick,
  selectedTool,
  activated,
  setSelectedTool,
}: {
  onClick: () => void;
  selectedTool: string;
  activated: boolean;
  setSelectedTool: (shape: Tool) => void;
}) {
  return (
    <Drawer>
      <Drawer.Trigger asChild>
        <IconButton
          icon={<DoorOpen />}
          onClick={() => {
            setSelectedTool("leave");
          }}
          activated={activated}
        ></IconButton>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>Are you absolutely sure?</Drawer.Title>
        </Drawer.Header>
        <Drawer.Footer>
          <div className="flex justify-center gap-3">
            <Button onClick={onClick}>Leave</Button>
            <Drawer.Close>
              <Button onClick={() => setSelectedTool("pointer")} variant="outline">Cancel</Button>
            </Drawer.Close>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
