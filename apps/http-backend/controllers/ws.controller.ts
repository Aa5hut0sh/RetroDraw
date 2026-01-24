import type { Request, Response, NextFunction } from "express";
import { CreateRoomSchema } from "@repo/common/types";
import prisma from "@repo/db/client";
import bcrypt from 'bcrypt';

export const createRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = CreateRoomSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Incorrect inputs",
      });
    }

    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    if (!parsed.data?.secret) {
      return res.json({
        success: false,
        message: "room secret is missing",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashSecret = await bcrypt.hash(parsed.data.secret, salt);

    const room = await prisma.room.create({
      data: {
        slug: parsed.data!.name,
        adminId: userId,
        secret: hashSecret ,
      },
    });

    res.status(200).json({
      success: true,
      room,
    });
  } catch (err) {
    next(err);
  }
};

export const getChats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roomId = Number(req.params.roomId);

    if (!roomId || isNaN(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing roomId",
      });
    }

    const messages = await prisma.chat.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        message: true,
      },
    });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (err) {
    next(err);
  }
};
export const getRoom = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slug = Array.isArray(req.params.slug)
      ? req.params.slug[0]
      : req.params.slug;

    const room = await prisma.room.findUnique({
      where: {
        slug,
      },

      select: {
        id: true,
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      roomId: room.id,
    });
  } catch (err) {
    next(err);
  }
};

export const joinRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const slug = req.body.room;
    const Reqsecret = req.body.secret;

    const room = await prisma.room.findUnique({
      where: { slug },
      select: { secret: true, slug: true },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const valid = await bcrypt.compare(Reqsecret, room.secret);

    if (!valid) {
      return res.status(400).json({
        success: false,
        message: "Incorrect secret",
      });
    }

    return res.status(200).json({
      success: true,
      canJoin: true,
      room: { slug: room.slug },
    });
  } catch (err) {
    next(err);
  }
};

