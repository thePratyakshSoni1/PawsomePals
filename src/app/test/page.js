"use client"
import {LoadingPlaceHolder } from "@/components/loadingDialog";
import Image from "next/image";


export default function TheTest(){
    return <>
        <div style={{width: "100vw", height: "100vh", background: "blue"}}>
            <div style={{width: "650px", height: "160px"}}>
                <LoadingPlaceHolder width="2rem" borderWidth="2px" customCss={{borderRadius: "0px", backgroundColor: "black"}}/>
            </div>
        </div>
    </>
}
