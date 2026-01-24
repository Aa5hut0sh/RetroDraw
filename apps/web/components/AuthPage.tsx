"use client"
import React, { useState , useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/retroui/Button";
import { Input } from "@/components/retroui/Input";
import { Label } from "@/components/retroui/Label";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from '@/app/config';
import { useAuth } from "@/app/hooks/useSocket";
import { MoveLeft } from "lucide-react";
import api from "@/lib/Api";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name , setName] = useState("");
  const [loading, setLoading] = useState(false);
    const router = useRouter();

    const { isLoggedin, isLoading } = useAuth();

    useEffect(() => {
    if (!isLoading && isLoggedin) {
      router.push("/joinroom");
    }
  }, [isLoggedin, isLoading, router]);


  const handleSubmit = async () => {
    setLoading(true);
    const endpoint = isSignin ? 'auth/login' : 'auth/signup';
    const payload = isSignin 
      ? { email, password } 
      : { name, email, password }

    try {

      const response = await api.post(`/${endpoint}`, payload);
      localStorage.setItem("token" , response.data.token);
      router.push("/joinroom");
    } catch (error) {
      console.error("Authentication failed:", error);
      alert("Something went wrong. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };


  

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[#FFF4E0] font-mono">
      <div className=" absolute left-10 top-10">
        <Button
          onClick={() => {
            router.push("/");
          }}
        >
          <MoveLeft className="h-4 w-4 mr-2" /> Return
        </Button>
      </div>
      <div className="p-8 m-4 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
        <h2 className="text-3xl font-black uppercase mb-6 italic">
          {isSignin ? "Welcome Back" : "Create Account"}
        </h2>

        <div className="space-y-6">
          <div className="grid w-full items-center gap-2">
            {!isSignin && (
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="name" className="font-bold uppercase">Full Name</Label>
              <Input 
                type="text" 
                id="name" 
                placeholder="Ashutosh Sharma" 
                className="border-2 border-black focus-visible:ring-0"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
            <Label htmlFor="email" className="font-bold uppercase">Email Address</Label>
            <Input 
              type="email" 
              id="email" 
              placeholder="name@example.com" 
              className="border-2 border-black focus-visible:ring-0 focus-visible:ring-offset-0"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="password" className="font-bold uppercase">Password</Label>
            <Input 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              className="border-2 border-black focus-visible:ring-0 focus-visible:ring-offset-0"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className='flex justify-center'>
            <Button 
            onClick={handleSubmit}
            disabled={loading}
            variant="secondary"
            size="lg"
          >
            {loading ? "Processing..." : (isSignin ? "Sign in" : "Sign up")}
          </Button>
          </div>
          

          <div className="flex items-center justify-center gap-1 font-mono font-bold text-sm mt-6">
            <span className="text-black">
                {isSignin ? "Don't have an account?" : "Already a member?"}
            </span>
            <Button 
                variant="link" 
                className="p-0 h-auto font-bold text-sm text-black underline decoration-2 underline-offset-2 hover:text-retro-pink transition-colors"
                onClick={() => {
                isSignin ? router.push("/signup") : router.push("/signin");
                }}
            >
                {isSignin ? "Sign up" : "Sign in"}
            </Button>
        </div>
        </div>
      </div>
    </div>
  );
}