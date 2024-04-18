"use client"
import { LoadingDialog } from "@/components/loadingDialog";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  let router = useRouter()
  useEffect(()=>{router.push("/home")},[])
  return <div style={{height: "100vh", width: "100vw"}}>
    <LoadingDialog />
  </div>
}
