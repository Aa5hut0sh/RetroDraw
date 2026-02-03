import axios from "axios";
import RoomCanvas from "@/components/RoomCanvas";

const getRoomId = async (slug: string) => {
  const res = await fetch(
    `${process.env.INTERNAL_BACKEND_URL}/ws/room/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch room");
  }

  const data = await res.json();
  return data.roomId;
};

export default async function CanvasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const roomId = await getRoomId(slug);
  

  return <RoomCanvas roomId={roomId} slug={slug} />;
}
