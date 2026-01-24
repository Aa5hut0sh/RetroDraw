import { getexistingShapes } from "./http";
import { Tool } from "@/components/canvas";
import { createTextInput } from "./TextInput";

type Point = { x: number; y: number };
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
    }
  | {
      type: "pencil";
      points: Point[];
    }
  | {
      type: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }
  | {
      type: "arrow";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }
  | {
      type: "text";
      x: number;
      y: number;
      text: string;
    }
  | {
      type: "diamond";
      x: number;
      y: number;
      width: number;
      height: number;
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private roomId: number;
  private socket: WebSocket;
  private selectedTool: Tool = "circle";
  private existingShapes: Shape[] = [];

  private isClicked = false;
  private stX = 0;
  private stY = 0;
  private currentPencilPoints: { x: number; y: number }[] = [];
  private eraserRadius = 5;

  constructor(canvas: HTMLCanvasElement, roomId: number, socket: WebSocket) {
    this.canvas = canvas;
    this.roomId = roomId;
    this.socket = socket;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context");
    this.ctx = ctx;

    this.init();
    this.initSocket();
    this.initMouseHandlers();
  }

  async init() {
    this.existingShapes = await getexistingShapes(this.roomId);
    this.clearCanvas();
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  initSocket() {
    this.socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);

        if (
          parsedData?.type === "chat" &&
          typeof parsedData.message === "string"
        ) {
          this.existingShapes.push(JSON.parse(parsedData.message));
          this.clearCanvas();
        }

        if (parsedData.type === "erase") {
          this.existingShapes = this.existingShapes.filter(
            (s) => !this.isSameShape(s, parsedData.shape),
          );

          this.clearCanvas();
        }
      } catch {
        console.error("Invalid JSON received:", event.data);
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";

    this.existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      }

      if (shape.type === "diamond") {
        const { x, y, width, height } = shape;
        this.ctx.beginPath();
        this.ctx.moveTo(x + width / 2, y);
        this.ctx.lineTo(x + width, y + height / 2);
        this.ctx.lineTo(x + width / 2, y + height);
        this.ctx.lineTo(x, y + height / 2);
        this.ctx.closePath();
        this.ctx.stroke();
      }

      if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          shape.radius,
          0,
          Math.PI * 2,
        );
        this.ctx.stroke();
        this.ctx.closePath();
      }

      if (shape.type === "pencil") {
        this.ctx.beginPath();

        shape.points.forEach((point, index) => {
          if (index === 0) {
            this.ctx.moveTo(point.x, point.y);
          } else {
            this.ctx.lineTo(point.x, point.y);
          }
        });

        this.ctx.stroke();
        this.ctx.closePath();
      }

      if (shape.type === "line") {
        this.ctx.beginPath();
        this.ctx.moveTo(shape.x1, shape.y1);
        this.ctx.lineTo(shape.x2, shape.y2);
        this.ctx.stroke();
      }

      if (shape.type === "arrow") {
        const { x1, y1, x2, y2 } = shape;

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        // arrow head
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLen = 20;

        this.ctx.beginPath();
        this.ctx.moveTo(x2, y2);
        this.ctx.lineTo(
          x2 - headLen * Math.cos(angle - Math.PI / 6),
          y2 - headLen * Math.sin(angle - Math.PI / 6),
        );
        this.ctx.lineTo(
          x2 - headLen * Math.cos(angle + Math.PI / 6),
          y2 - headLen * Math.sin(angle + Math.PI / 6),
        );
        this.ctx.closePath();
        this.ctx.fill();
      }

      if (shape.type === "text") {
        this.ctx.font = "16px sans-serif";
        this.ctx.fillText(shape.text, shape.x, shape.y);
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.stX = e.clientX;
    this.stY = e.clientY;

    if (this.selectedTool === "text") {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      createTextInput(e.clientX, e.clientY, (text) => {
        const shape: Shape = {
          type: "text",
          x,
          y,
          text,
        };

        this.existingShapes.push(shape);
        this.clearCanvas();

        this.socket.send(
          JSON.stringify({
            type: "chat",
            roomId: this.roomId,
            message: JSON.stringify(shape),
          }),
        );
      });
      return;
    }

    this.isClicked = true;

    if (this.selectedTool === "pencil") {
      this.currentPencilPoints = [{ x: e.clientX, y: e.clientY }];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.isClicked = false;

    const width = e.clientX - this.stX;
    const height = e.clientY - this.stY;

    const selectedTool = this.selectedTool;
    let shape: Shape | null = null;

    if (selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.stX,
        y: this.stY,
        width,
        height,
      };
    }

    if (selectedTool === "diamond") {
      shape = {
        type: "diamond",
        x: this.stX,
        y: this.stY,
        width,
        height,
      };
    }

    if (selectedTool === "circle") {
      const centerX = this.stX + width / 2;
      const centerY = this.stY + height / 2;
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;

      shape = {
        type: "circle",
        centerX,
        centerY,
        radius,
      };
    }

    if (selectedTool === "line") {
      shape = {
        type: "line",
        x1: this.stX,
        y1: this.stY,
        x2: e.clientX,
        y2: e.clientY,
      };
    }

    if (selectedTool === "arrow") {
      shape = {
        type: "arrow",
        x1: this.stX,
        y1: this.stY,
        x2: e.clientX,
        y2: e.clientY,
      };
    }

    if (this.selectedTool === "pencil") {
      shape = {
        type: "pencil",
        points: this.currentPencilPoints,
      };

      this.currentPencilPoints = [];
    }

    if (shape === null) {
      return;
    }

    // if (shape) {
    //   this.existingShapes.push(shape);
    // }

    this.socket.send(
      JSON.stringify({
        type: "chat",
        roomId: this.roomId,
        message: JSON.stringify(shape),
      }),
    );
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.isClicked) return;

    const width = e.clientX - this.stX;
    const height = e.clientY - this.stY;

    this.ctx.strokeStyle = "rgba(0,0,0)";
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";

    const selectedTool = this.selectedTool;

    if (this.selectedTool === "eraser") {
      const x = e.clientX;
      const y = e.clientY;

      const shapeToErase = this.existingShapes.find((shape) =>
        this.isPointInsideShape(x, y, shape),
      );

      if (!shapeToErase) return;

      this.existingShapes = this.existingShapes.filter(
        (shape) => shape !== shapeToErase,
      );
      this.clearCanvas();

      this.socket.send(
        JSON.stringify({
          type: "erase",
          roomId: this.roomId,
          shape: JSON.stringify(shapeToErase),
        }),
      );

      return;
    }

    if (this.selectedTool === "pencil") {
      const lastPoint =
        this.currentPencilPoints[this.currentPencilPoints.length - 1];

      this.ctx.beginPath();
      this.ctx.moveTo(lastPoint.x, lastPoint.y);
      this.ctx.lineTo(e.clientX, e.clientY);
      this.ctx.stroke();
      this.ctx.closePath();

      this.currentPencilPoints.push({ x: e.clientX, y: e.clientY });
      return;
    }

    if (selectedTool === "line") {
      this.clearCanvas();

      this.ctx.beginPath();
      this.ctx.moveTo(this.stX, this.stY);
      this.ctx.lineTo(e.clientX, e.clientY);
      this.ctx.stroke();
      return;
    }
    if (selectedTool === "arrow") {
      this.clearCanvas();

      const endX = e.clientX;
      const endY = e.clientY;

      this.ctx.beginPath();
      this.ctx.moveTo(this.stX, this.stY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();

      const angle = Math.atan2(endY - this.stY, endX - this.stX);
      const headLen = 20;

      this.ctx.beginPath();
      this.ctx.moveTo(endX, endY);

      this.ctx.lineTo(
        endX - headLen * Math.cos(angle - Math.PI / 6),
        endY - headLen * Math.sin(angle - Math.PI / 6),
      );

      this.ctx.lineTo(
        endX - headLen * Math.cos(angle + Math.PI / 6),
        endY - headLen * Math.sin(angle + Math.PI / 6),
      );

      this.ctx.closePath();
      this.ctx.fill();

      return;
    }

    this.clearCanvas();

    if (selectedTool === "rect") {
      this.ctx.strokeRect(this.stX, this.stY, width, height);
    }

    if (selectedTool === "diamond") {
      this.clearCanvas();
      this.ctx.beginPath();
      this.ctx.moveTo(this.stX + width / 2, this.stY);
      this.ctx.lineTo(this.stX + width, this.stY + height / 2);
      this.ctx.lineTo(this.stX + width / 2, this.stY + height);
      this.ctx.lineTo(this.stX, this.stY + height / 2);
      this.ctx.closePath();
      this.ctx.stroke();
    }

    if (selectedTool === "circle") {
      const centerX = this.stX + width / 2;
      const centerY = this.stY + height / 2;
      const radius = Math.max(width, height) / 2;

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  isPointInsideShape(x: number, y: number, shape: Shape): boolean {
    const tolerance = this.eraserRadius;

    if (shape.type === "rect") {
      const insideX = x >= shape.x && x <= shape.x + shape.width;
      const insideY = y >= shape.y && y <= shape.y + shape.height;

      const onLeft = Math.abs(x - shape.x) <= tolerance && insideY;
      const onRight =
        Math.abs(x - (shape.x + shape.width)) <= tolerance && insideY;
      const onTop = Math.abs(y - shape.y) <= tolerance && insideX;
      const onBottom =
        Math.abs(y - (shape.y + shape.height)) <= tolerance && insideX;

      return onLeft || onRight || onTop || onBottom;
    }

    if (shape.type === "diamond") {
      const { x: sx, y: sy, width, height } = shape;

      const points = [
        { x: sx + width / 2, y: sy }, // Top
        { x: sx + width, y: sy + height / 2 }, // Right
        { x: sx + width / 2, y: sy + height }, // Bottom
        { x: sx, y: sy + height / 2 }, // Left
      ];


      for (let i = 0; i < 4; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % 4];

        const dist =
          Math.abs(
            (p2.y - p1.y) * x - (p2.x - p1.x) * y + p2.x * p1.y - p2.y * p1.x,
          ) / Math.hypot(p2.y - p1.y, p2.x - p1.x);

        if (dist <= this.eraserRadius) return true;
      }
    }

    if (shape.type === "circle") {
      const dx = x - shape.centerX;
      const dy = y - shape.centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      return Math.abs(dist - shape.radius) <= tolerance;
    }

    if (shape.type === "pencil") {
      return shape.points.some((point) => {
        const dx = x - point.x;
        const dy = y - point.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.eraserRadius;
      });
    }

    if (shape.type === "line" || shape.type === "arrow") {
      const dist =
        Math.abs(
          (shape.y2 - shape.y1) * x -
            (shape.x2 - shape.x1) * y +
            shape.x2 * shape.y1 -
            shape.y2 * shape.x1,
        ) / Math.hypot(shape.y2 - shape.y1, shape.x2 - shape.x1);

      return dist <= this.eraserRadius;
    }

    if (shape.type === "text") {
      return (
        x >= shape.x && x <= shape.x + 100 && y <= shape.y && y >= shape.y - 20
      );
    }

    return false;
  }

  isSameShape(shape1: Shape, shape2: string): boolean {
    try {
      const parsedShape2 = JSON.parse(shape2);
      return JSON.stringify(shape1) === JSON.stringify(parsedShape2);
    } catch {
      return false;
    }
  }
}
