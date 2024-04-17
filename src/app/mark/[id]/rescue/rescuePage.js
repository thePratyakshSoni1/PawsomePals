"use client";
import { Button, MultiLineInputField, UploadImageButton } from "@/components";
import { useState } from "react";
import styles from "./page.module.css"
import { LoadingDialog } from "@/components/loadingDialog";
import { useRouter } from "next/navigation";

export function RescuePage({ params }) {

    const [msg, setMsg] = useState("")
    const [imgBuf, setImgBuf] = useState()
    const [isLoading, setLoading] = useState(false)

    const router = useRouter()

    const onSendRequest = async ()=>{
        setLoading(true)
        if(imgBuf){
            if(msg.length > 40){

                let payload = { markId: params.id, imgBuf: imgBuf, msg: msg }
                let reqFetch = await (await fetch("/api/marks/rescue",{
                    method: "POST",
                    credentials: "include",
                    body: JSON.stringify(payload)
                })).json()

                if(reqFetch.isSuccess){
                    alert("Your request is sent for approval to the mark author, you'll soon get the notification about the approval")
                    location.replace("/home")
                }else{ 
                    alert(reqFetch.msg)
                    router.back()
                }
                

            }else alert("Message should be at least 40 characters long, and genuine !")
        }else alert("Add your image rescuing the pal (animal), please !")

        setLoading(false)
    }

    return (
        <div className={styles.contentContainer}>
        <div className={styles.main}>
            <div>
            <UploadImageButton
                fillWidth={true}
                buf={imgBuf}
                setBuf={setImgBuf}
                text="Add Pal's Photo"
                imageStyles={{
                marginTop: "6px",
                border: "none",
                objectFit: "cover",
                padding: "0px",
                }}
            />
            <MultiLineInputField
                onChange={setMsg}
                placeholder={"Your message"}
                value={msg}
            />
            <Button
                fillWidth={true}
                onClick={() => {
                    isLoading ? () => {} : onSendRequest();
                }}
                text="Send Approval Request"
                color="#00ff4e"
                buttonStyles={{
                marginTop: "auto",
                marginBottom: "1rem",
                }}
            />
            </div>
        </div>
        {isLoading ? <LoadingDialog /> : ""}
        </div>
    );
}
