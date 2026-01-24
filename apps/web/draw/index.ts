import axios from "axios";
import { BACKEND_URL } from "@/app/config";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: number,
  socket: WebSocket,
) {
  const ctx = canvas.getContext("2d");
  let existingShapes: Shape[] = await getexistingShapes(roomId);

  if (!ctx) {
    return;
  }

  socket.onmessage = (event) => {
    try {
      const parsedData = JSON.parse(event.data);
      if (
        parsedData?.type === "chat" &&
        typeof parsedData.message === "string"
      ) {
        existingShapes.push(JSON.parse(parsedData.message));
        clearCanvas(existingShapes, canvas, ctx);
      }
    } catch {
      console.error("Invalid JSON received:", event.data);
    }
  };

  clearCanvas(existingShapes, canvas, ctx);
  let isClicked = false;
  let stX = 0;
  let stY = 0;

  canvas.addEventListener("mousedown", (e) => {
    isClicked = true;
    console.log(e.clientX);
    stX = e.clientX;
    console.log(e.clientY);
    stY = e.clientY;
  });

  canvas.addEventListener("mouseup", (e) => {
    isClicked = false;
    const width = e.clientX - stX;
    const height = e.clientY - stY;

    //@ts-ignore
    const selectedTool = window.selectedTool;
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: stX,
        y: stY,
        width,
        height,
      };
    } else if (selectedTool === "circle") {
      const centerX = stX + width / 2;
      const centerY = stY + height / 2;
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;

      shape = {
        type: "circle",
        centerX,
        centerY,
        radius,
      };
    }

    if (shape) {
      existingShapes.push(shape);
    }

    socket.send(
      JSON.stringify({
        type: "chat",
        roomId: roomId,
        message: JSON.stringify(shape),
      }),
    );

  });
  canvas.addEventListener("mousemove", (e) => {
    if (isClicked) {
      const width = e.clientX - stX;
      const height = e.clientY - stY;

      clearCanvas(existingShapes, canvas, ctx);
      ctx.strokeStyle = "rgba(0,0,0)";
      // ctx.strokeRect(stX, stY, width, height);
      //@ts-ignore
      const selectedTool = window.selectedTool;
      if (selectedTool == "rect") {
        ctx.strokeRect(stX, stY, width, height);
      }
      if (selectedTool === "circle") {
        const centerX = stX + width / 2;
        const centerY = stY + height / 2;
        const radius = Math.max(width, height) / 2;
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
      }
    }
  });
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  existingShapes.map((shape) => {
    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
    }

    if(shape.type==="circle"){
      ctx.beginPath();
      ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();
    }
  });
}

type ChatRow = { message: string };

const getexistingShapes = async (roomId: number): Promise<Shape[]> => {
  const response = await axios.get(`${BACKEND_URL}/ws/chat/${roomId}`);
  const rows: ChatRow[] = response.data.messages ?? [];
  rows.map((r) => r.message);

  const shapes = rows.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData;
  });

  return shapes;
};
