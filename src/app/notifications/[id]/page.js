import { SimpleTopBar } from "@/components/simpleToBar";
import { DataBase, RescueNotification } from "@/utils/firebase";
import { apiRouteTokenValidationHandler } from "@/utils/utilsFuncts";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./notifications.module.css"
import Image from "next/image";
import { NotifDetails } from "./notificationDetails";

export default async function Page({params}){

    let validation = await apiRouteTokenValidationHandler(cookies().get('token'))
    if( validation.isSuccess ){
        let UserOps = DataBase.UserOps()
        let userFetch = await UserOps.getUser(validation.id)
        if(userFetch.isSuccess && userFetch.isExisting == true){

            let index
            let targetNotif = userFetch.user.notifications.find((it, ind)=>{
                index =  ind 
                return it.id == params.id
             })

            if(targetNotif){
                if(targetNotif.type == RescueNotification.TYPES.RequestResponse){
                    if(!targetNotif.responseReceived){
                        let y = await UserOps.updateSpecific(validation.id, {notifications: [...userFetch.user.notifications.slice(0, index), {...userFetch.user.notifications[index], responseReceived: true}, ...userFetch.user.notifications.slice(index+1, userFetch.user.notifications.length)]})
                        console.log("RECIVED: ", y)
                    }
                }

                let [markFetch, notifImg, userImg, requetor] = await Promise.all([
                    DataBase.Mark().getMark(targetNotif.markId),
                    DataBase.getImage(UserOps.fbStorage ,targetNotif.image, false),
                    DataBase.getImage(UserOps.fbStorage ,targetNotif.rescueRequestBy+".png", true),
                    UserOps.getUser(targetNotif.rescueRequestBy)
                ])
                
                if(markFetch.isSuccess && notifImg.isSuccess){
                    let markImg = await DataBase.getImage(UserOps.fbStorage, markFetch.mark.image, false)
                    return <NotifDetails
                                isInjured={markFetch.mark.isInjured}
                                forAdoption={markFetch.mark.isForAdoption}
                                isSeen={targetNotif.isSeen}
                                type={targetNotif.type}
                                isApproved={targetNotif.isApproved}
                                markTitle={markFetch.mark.title}
                                msg={targetNotif.msg}
                                markId={targetNotif.markId}
                                notificationId={targetNotif.id}
                                requestorId={targetNotif.rescueRequestBy}
                                requestorName={requetor.user.firstName+" "+requetor.user.lastName}
                                imgBuf={"data:type=image/*;base64,"+Buffer.from(notifImg.buf).toString('base64')}
                                markImgBuf={userImg.isSuccess ? "data:type=image/*;base64,"+Buffer.from(markImg.buf).toString('base64') : "/placeholder.jpg"}
                                requestorImgBuf={userImg.isSuccess ? "data:type=image/*;base64,"+Buffer.from(userImg.buf).toString('base64') : "/placeholder.jpg"}
                     />
                }else return <h3>Something went wrong, comeback later please</h3>

            }else return <>Page not found</>


        }else if(!userFetch.isExisting) return redirect("/login") 
        else return <h3>Page not working, comeback later !</h3>
    }else{
        return redirect("/login")
    }
    
}