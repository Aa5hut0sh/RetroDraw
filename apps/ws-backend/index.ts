import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { authenticate } from "./middlewares/wsAuth.middleware";
import prisma from "@repo/db/client";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({ server });

interface User {
  ws: WebSocket;
  userId: string;
  rooms: string[];
}

const users: User[] = [];

wss.on("connection", (ws, req) => {
  const user = authenticate(req, ws);
  const userId = user?.userId;
  if (!userId) {
    ws.close();
    return;
  }

  const newUser = {
    userId,
    rooms: [],
    ws,
  }

  users.push(newUser);

  console.log("User connected:", userId);

  ws.on("message", async (data) => {
    let parsedData ;

    try {
      parsedData = JSON.parse(data as unknown as string);
    } catch (err) {
      console.error("Invalid JSON received:", data.toString());
      return;
    }

    if (parsedData.type === "join_room") {
      const user = users.find((x) => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }

      user.rooms = user.rooms.filter((x) => x !== parsedData.roomId);
    }

    if(parsedData.type=="erase"){
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }

      const roomId = parsedData.roomId;
      const shape = parsedData.shape;

      await prisma.chat.deleteMany({
        where :{
          message: shape
        }
      });

      users.forEach((u) => {
        if (u.rooms.includes(roomId)) {
          u.ws.send(
            JSON.stringify({
              type: "erase",
              roomId,
              shape,
            })
          );
        }
      });


      console.log("shape removed");
    }

    if (parsedData.type === "chat") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }

      const roomId = parsedData.roomId;
      const message = parsedData.message;

      await prisma.chat.create({
        data:{
          message,
          roomId,
          userId
        }
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              roomId,
            }),
          );
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("User disconnected:", userId);
      const index = users.indexOf(newUser);
      if (index > -1) {
        users.splice(index, 1);
      }
    });
});

server.listen(PORT, () => {
  console.log(`WS server running on ${PORT}`);
});
