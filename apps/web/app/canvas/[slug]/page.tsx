import axios from "axios";
import { BACKEND_URL } from "@/app/config";
import RoomCanvas from "@/components/RoomCanvas";

const getRoomId = async (slug: string) => {
  const response = await axios.get(`${BACKEND_URL}/ws/room/${slug}`);
  console.log(response.data.roomId);
  return response.data.roomId;
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
