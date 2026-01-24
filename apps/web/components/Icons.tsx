import { ReactNode } from "react";
import { Button } from "./retroui/Button";

export function IconButton({
  icon,
  onClick,
  activated,
}: {
  icon: ReactNode;
  onClick: () => void;
  activated: boolean;
}) {
  return (

    <Button onClick={onClick} className={`m-2 cursor-pointer  border-2 p-2 ${
        activated
          ? "bg-red-500 border-red-500 text-white"
          : "bg-white border-gray-300 text-black hover:bg-gray-100"
      }`} variant="outline" >{icon}</Button>
  );
}
