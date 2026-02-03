import { BACKEND_URL } from "@/app/config";
import axios from "axios";

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

type ChatRow = { message: string };

export const getexistingShapes = async (roomId: number): Promise<Shape[]> => {
  const response = await axios.get(`${BACKEND_URL}/api/ws/chat/${roomId}`);
  const rows: ChatRow[] = response.data.messages ?? [];
  rows.map((r) => r.message);

  const shapes = rows.map((x: { message: string }) => {
    const messageData = JSON.parse(x.message);
    return messageData;
  });

  return shapes;
};