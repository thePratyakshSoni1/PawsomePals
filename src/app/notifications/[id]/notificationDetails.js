"use client"
import { SimpleTopBar } from "@/components/simpleToBar";
import styles from "./notifications.module.css"
import { Button } from "@/components/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RescueNotification } from "@/utils/firebase";
import { Divider } from "@/components/divider";
import { MultiLineInputField } from "@/components";
import { LoadingDialog } from "@/components/loadingDialog";

export function NotifDetails({
    isSeen,
    isApproved,
    notificationId, 
    msg, 
    requestorId, 
    requestorName, 
    requestorImgBuf, 
    imgBuf,
    markImgBuf,
    markTitle,
    markId,
    type,
    isInjured,
    forAdoption,
    isReceived
}){

    const [isLoading, setLoading] = useState(false)
    const [responseMsg, setMsg] = useState("")
    const router = useRouter()

    const onApprove = (isApproved)=>{
        setLoading(true)
        let reqPayload = {
            isApproved: isApproved,
            notificationId: notificationId,
            markId: markId,
            msg: responseMsg
        }

        fetch( "/api/marks/rescue", {
                method: "PUT",
                credentials: "include",
                body: JSON.stringify(reqPayload)
        }).then(it=>it.json().then(resp=>{
            if(resp.isSuccess){
                alert("Request "+ (isApproved ? "approved" : "rejected") +" successfully")
                location.replace("/mark/"+markId)
            }else{
                alert(resp.msg)
                setLoading(false)
            }
        }))

    }

    return <div className={styles.contentContainer}>
        <SimpleTopBar title={"Approval Request"} />
        <div className={styles.main} style={{background: `${isSeen && isApproved ? "linear-gradient(0deg, #a9ff99, white)" : ((isSeen && !isApproved) ? "linear-gradient(0deg, #ff8585, white)" : "")}`}}>
            <div>
            <Image
                id={styles.animalImg}
                src={ imgBuf }
                height={100}
                width={100}
                alt=""
            />
            <a href={`/mark/${markId}`}>
                <div className={styles.markCard} >
                <Image width={100} height={100} alt="" src={markImgBuf} />
                <div className={styles.titleAndTag}>
                    <span id={styles.title}>{markTitle}</span>
                    <div>
                    <span id={styles.subText}>
                        {" "}
                        {forAdoption ? "Adopt" : ""}{" "}
                    </span>
                    <span id={styles.subText}>
                        {" "}
                        {isInjured ? "Injured" : ""}{" "}
                    </span>
                    </div>
                </div>
                <Image
                    width={100}
                    height={100}
                    alt=""
                    id={styles.backBtn}
                    src="/back.png"
                />
                </div>
            </a>
            <div id={styles.requestorInfo}>
                <Image
                    src={ requestorImgBuf }
                    height={100}
                    width={100}
                    alt=""
                />
                <span>{requestorName}</span>
            </div>
            <p style={{
                marginBottom: "1rem",
                backgroundColor: `${isSeen && isApproved ? "#2ce72c" : ((isSeen && !isApproved) ? "red" : "black")}`,
                color: `${"white"}`,
                borderRadius: "0px 100px 100px 100px"
            }} 
            >{msg}</p>
            {
                (type == RescueNotification.TYPES.RequestResponse && isSeen) || (type == RescueNotification.TYPES.RescueApprovalRequest && isSeen) ? <>
                    <div style={{
                        height: "180px", 
                        // background: isApproved ? "linear-gradient(0deg, #98ff85, white)" : "linear-gradient(0deg, #ff8585, white)", 
                        display: "flex", alignItems: "center", 
                        justifyContent: "center",
                        fontSize: "2.5rem",
                        fontWeight: "bold",
                        color: isApproved ? "#00ff08" : "red",
                        marginTop: "auto",
                        width: "100%"
                    }}>
                        <span style={{
                            rotate: "-10deg",
                            padding: "8px 14px",
                            border: "solid",
                            borderStyle: "dashed",
                            paddingTop: "2rem"
                        }}
                        >{ isApproved ? "Approved" : "REJECTED" }</span>
                    </div>
                </> : ( (type == RescueNotification.TYPES.RescueApprovalRequest && !isSeen) ? <>
                    <MultiLineInputField onChange={setMsg} placeholder={"Response message"} value={responseMsg} inputStyles={{minHeight: "20rem", marginBottom: "1rem", borderRadius: "32px 0px 32px 32px"}}/>
                    <Button fillWidth={true} text={"Approve"} color="green" onClick={()=>onApprove(true)} buttonStyles={{marginTop: "auto"}}/>
                    <Button fillWidth={true} text={"Reject"} color="red" onClick={()=>onApprove(false)}/>
                    <br></br>
                </> : <>PAGE NOT FOUND</>)
            }
            </div>
        </div>
    {isLoading ? <LoadingDialog /> : ""}
    </div>
}