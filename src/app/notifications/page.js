import { SimpleTopBar } from "@/components/simpleToBar";
import { DataBase, RescueNotification } from "@/utils/firebase";
import { apiRouteTokenValidationHandler } from "@/utils/utilsFuncts";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./notifications.module.css"
import Image from "next/image";

export default async function Notifications(){


    let validation = await apiRouteTokenValidationHandler(cookies().get('token'))
    if( validation.isSuccess ){
        let UserOps = DataBase.UserOps()
        let userFetch = await UserOps.getUser(validation.id)
        if(userFetch.isSuccess && userFetch.isExisting == true){
            const userNotifs = [...userFetch.user.notifications]
            // const userNotifs = []
            const imgstoFetch = []
            userNotifs.forEach(it=>[
                imgstoFetch.push(DataBase.getImage(UserOps.fbStorage, it.image, false))
            ])

            let imgFetchTask = await Promise.all(imgstoFetch)
            imgFetchTask.forEach((it, indx)=>{

                if(userNotifs[indx].type == RescueNotification.TYPES.RequestResponse){
                    userNotifs[indx] = {
                        title: `Your request got ${userNotifs[indx].isApproved ? "Approved" : "Rejected"} for`,
                        subText: userNotifs[indx].msg.length > 60 ? userNotifs[indx].msg.substring(0, 57)+"..." : userNotifs[indx].msg,
                        img: it.isSuccess ? `data:type=image/*;base64,${Buffer.from(it.buf).toString('base64')}` : "/placeholder.jpg",
                        at: userNotifs[indx].seenAt.toDate().toLocaleString(),
                        isApproved: userNotifs[indx].isApproved,
                        isSeen: userNotifs[indx].isSeen,
                        type: userNotifs[indx].type,
                        id: userNotifs[indx].id,
                        responseReceived: userNotifs[indx].responseReceived
                    }
                }else{
                    userNotifs[indx] = {
                        title: `Approval request for rescue`,
                        subText: userNotifs[indx].msg.length > 60 ? userNotifs[indx].msg.substring(0, 57)+"..." : userNotifs[indx].msg,
                        img: it.isSuccess ? `data:type=image/*;base64,${Buffer.from(it.buf).toString('base64')}` : "/placeholder.jpg",
                        at: userNotifs[indx].requestAt.toDate().toLocaleString(),
                        isApproved: userNotifs[indx].isApproved,
                        isSeen: userNotifs[indx].isSeen,
                        type: userNotifs[indx].type,
                        id: userNotifs[indx].id,
                        responseReceived: userNotifs[indx].responseReceived
                    }
                }
            })

            return <>
                <SimpleTopBar title={"Updates"}/>
                <div className={styles.main} >
                    <div>
                        {
                            userNotifs.length > 0 ? <>
                                {
                                    userNotifs.reverse().map((it, indx)=>{
                                        return <a href={'/notifications/'+it.id} key={indx} ><div 
                                                className={styles.notifContainer} 
                                                style={ (it.type == RescueNotification.TYPES.RequestResponse && it.responseReceived) ? {background: "transparent", border: "none"} : ((it.type == RescueNotification.TYPES.RescueApprovalRequest && it.isSeen) ? {background: "transparent", border: "none"} : {} ) }
                                            >
                                                <Image alt="" width={60} height={60} src={it.img} />
                                                <div className={styles.textContainer}>
                                                    <span className={styles.title}>{it.title}</span>
                                                    <span className={styles.date}>{it.at}</span>
                                                    <span className={styles.subTitle}>{it.subText}</span>
                                                </div>
                                        </div></a>
                                    })
                                }
                            </> : <div style={{color: "gray", display: "flex", alignItems: "center", justifyContent: "center", width: "100vw", height: "100%", fontWeight: 'bold', fontSize: "2rem", paddingTop: "1rem"}}> No Updates </div>
                        }
                    </div>
                </div>
            </>

        }else if(!userFetch.isExisting) return <h3>User Not Found</h3> 
        else return <h3>Page not woring, comeback later !</h3>
    }else{
        return redirect("/login")
    }
    
}