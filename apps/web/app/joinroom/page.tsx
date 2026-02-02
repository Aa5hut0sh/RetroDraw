"use client";

import { Card } from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/retroui/Loader";
import { Dialog } from "@/components/retroui/Dialog";
import { Text } from "@/components/retroui/Text";
import { MoveLeft } from "lucide-react";
import api from "@/lib/Api";
import { useAuth } from "@/app/hooks/useSocket";

type Option = "join" | "create" | "none";

export default function Home() {
  const router = useRouter();
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { isLoading, isLoggedin } = useAuth();

  useEffect(() => {
    if (!isLoading && !isLoggedin) {
      router.push("/signin");
    }
  }, [isLoggedin, isLoading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen justify-center items-center">
        <Loader />;
      </div>
    );
  }

  return (
    <div>
      <div className=" absolute left-10 top-10">
        <Button
          onClick={() => {
            router.push("/");
          }}
        >
          <MoveLeft className="h-4 w-4 mr-2" /> Return
        </Button>
      </div>
      <div className="flex min-h-screen justify-center items-center">
        <Card className="w-500px">
          <Card.Header className="pb-0">
            <Card.Title className="text-center">Enter room</Card.Title>
          </Card.Header>
          <Card.Content className="flex items-center gap-4">
            <Input
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              type="text"
              placeholder="Chat-Room-1"
            />
            <DialogStyleDefault
              mode="join"
              name={name}
              room={room}
              setLoading={setLoading}
            ></DialogStyleDefault>
          </Card.Content>

          <Card.Header className="pb-0">
            <Card.Title className="text-center">Create room</Card.Title>
          </Card.Header>
          <Card.Content className="flex items-center gap-4">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Chat-Room-1"
            />
            <DialogStyleDefault
              mode="create"
              name={name}
              room={room}
              setLoading={setLoading}
            ></DialogStyleDefault>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

function DialogStyleDefault({
  mode,
  name,
  room,
  setLoading,
}: {
  mode: Option;
  name: string;
  room: string;
  setLoading: (value: boolean) => void;
}) {
  const [secret, setSecret] = useState("");
  const router = useRouter();
  const createRoom = async () => {
    setLoading(true);
    const endpoint = "ws/room";

    try {
      const response = await api.post(`/${endpoint}`, { name, secret });
      localStorage.setItem(
          "room_access",
          JSON.stringify({
            slug: response.data.room.slug,
            verified: true,
          }),
        );
      router.push(`/canvas/${response.data.room.slug}`);
    } catch (error) {
      console.error("Unable to create room:", error);
      alert("Something went wrong. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async () => {
    setLoading(true);
    const endpoint = "ws/joinroom";

    try {
      const response = await api.post(`/${endpoint}`, { room, secret });
      if (response.data.canJoin) {
        localStorage.setItem(
          "room_access",
          JSON.stringify({
            slug: response.data.room.slug,
            verified: true,
          }),
        );
        router.push(`/canvas/${response.data.room.slug}`);
      }
    } catch (error) {
      console.error("Unable to create room:", error);
      alert("Something went wrong. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button>{mode === "join" ? "Join" : "Create"}</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Text as="h5">{mode==="join" ? "Enter Room Secret" :"Create Room Secret" }</Text>
        </Dialog.Header>
        <section className="flex flex-col gap-4 p-4">
          <section className="text-xl">
            <Input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              type="text"
              placeholder="My-secret"
            />
          </section>
          <section className="flex w-full justify-end">
            <Dialog.Trigger asChild>
              <Button onClick={mode === "join" ? joinRoom : createRoom}>
                Confirm
              </Button>
            </Dialog.Trigger>
          </section>
        </section>
      </Dialog.Content>
    </Dialog>
  );
}
