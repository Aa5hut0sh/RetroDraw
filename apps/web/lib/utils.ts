import clsx from "clsx";
import { ClassNameValue, twMerge } from "tailwind-merge";

export function cn(...classes: ClassNameValue[]) {
  return twMerge(clsx(classes));
}


export const getBaseUrl = () => {
  
  if (typeof window !== "undefined") {
    return "/api";
  }

  return "http://127.0.0.1:3001/api";
};