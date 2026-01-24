 "use client"

import { Card } from "@/components/retroui/Card";
import { Button } from "@/components/retroui/Button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useSocket";
export default function LandingPage() {
  const router = useRouter();
  const { isLoggedin, checkAuth } = useAuth();

  const handleLogout = ()=>{
    localStorage.removeItem("token");
    checkAuth();
  }

  return (

    <div className="min-h-screen bg-retro-bg font-mono text-black">
      <nav className="flex justify-between items-center p-6 border-b-4 border-black bg-white sticky top-0 z-50 ">
        <div className="text-2xl font-black uppercase tracking-tighter">
          Retro<span className="text-retro-pink">Draw</span>
        </div>
        {!isLoggedin? 
          <div className="flex gap-4">
          <Button variant="outline" className="font-bold border-2" onClick={()=>router.push("/signin")}>Sign In</Button>
          <Button   onClick={()=>router.push("/signup")}>Sign Up</Button>
        </div> : <Button   onClick={handleLogout}>Logout</Button>
        }
        
      </nav>

      <section className="flex flex-col items-center text-center py-24 px-6">
        <h1 className="text-6xl  font-black uppercase mb-6 leading-none">
          <span className="bg-white px-4 border-4 border-black shadow-retro"> Sketch your Big Ideas</span>
        </h1>
        <p className="max-w-2xl text-xl font-bold mb-10 text-gray-800">
          The  virtual whiteboard with a hand-drawn feel. Perfect for diagrams, wireframes, and chaotic brainstorming.
        </p>
        <div className="flex gap-6">
          <Button onClick={()=>{
            isLoggedin?router.push("/signup"):router.push("/joinroom")
          }} size="lg" className="h-16 px-10 text-xl bg-retro-pink border-4 border-black shadow-retro hover:translate-x-2px hover:translate-y-2px hover:shadow-none transition-all">
            GO TO CANVAS
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-6xl mx-auto pb-24">
        <FeatureCard title="Infinite Space" color="bg-retro-teal">
          Never run out of room for your sketches.
        </FeatureCard>
        <FeatureCard title="Zero Friction" color="bg-retro-yellow">
          sign-up and start drawing , It's all your creativity.
        </FeatureCard>
        <FeatureCard title="Live Collab" color="bg-retro-pink">
          Share Room name and Room secret to draw together in real-time.
        </FeatureCard>
      </section>
    </div>
  )
}

function FeatureCard({ title, children, color }: { title: string, children: React.ReactNode, color: string }) {
  return (
    <Card className={`p-8 border-4 border-black shadow-retro ${color}`}>
      <h3 className="text-2xl font-black uppercase mb-3">{title}</h3>
      <p className="font-bold text-lg">{children}</p>
    </Card>
  )
}


 
