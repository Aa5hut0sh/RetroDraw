import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { createRoom , getChats, getRoom , joinRoom} from "../controllers/ws.controller";
const router = Router();

router.post("/room" , authenticate , createRoom);
router.get("/chat/:roomId", getChats);
router.get("/room/:slug" , getRoom);
router.post("/joinroom" , joinRoom);

export default router;

