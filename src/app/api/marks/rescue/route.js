import { DataBase, RescueNotification } from "@/utils/firebase";
import { apiRouteTokenValidationHandler } from "@/utils/utilsFuncts";
import { NextRequest } from "next/server";
import crypto from "crypto"

export async function POST(req){
// export async function GET(req:NextRequest, params){
    let reqData = await req.json()
    if(reqData.markId && reqData.imgBuf && reqData.msg ){
        let validation = await apiRouteTokenValidationHandler(req.cookies.get('token'))
        if(validation.isSuccess){
            let markFetch = await DataBase.Mark().getMark(reqData.markId)
            try{
                if(markFetch.isSuccess && !markFetch.mark.isRescued){
                    if(validation.id != markFetch.mark.addedBy){
                        let hasAlreadyOpted = markFetch.mark.optedToRescue.includes(validation.id)
                        if(!hasAlreadyOpted){
                            let UserOps = DataBase.UserOps()
                            let rescueImgName = crypto.randomUUID()+".png"
                            let task1 = await Promise.all([ 
                                UserOps.addNotification(
                                    new RescueNotification(
                                        validation.id,
                                        reqData.markId,
                                        new Date(),
                                        false,
                                        new Date(0),
                                        RescueNotification.TYPES.RescueApprovalRequest,
                                        reqData.msg,
                                        crypto.randomUUID(),
                                        markFetch.mark.addedBy,
                                        rescueImgName
                                    )
                                ),
                                DataBase.uploadImg(UserOps.fbStorage, rescueImgName, Buffer.from(reqData.imgBuf.data), false)
        
                            ])
            
                            if(task1[0].isSuccess){
                                await DataBase.Mark().updateSpecific(reqData.markId, {optedToRescue: [...markFetch.mark.optedToRescue, validation.id]})
                                return new Response(JSON.stringify({isSuccess: true}))
                            }else{
                                return new Response(JSON.stringify({isSuccess: false, msg: task1.msg}))
                            }
                        }else return new Response(JSON.stringify({isSuccess: false, msg: "You have already opted for rescue, please wait for response"}))
                    }else{
                        return new Response(JSON.stringify({isSuccess: false, msg: "You can't rescue from the mark you added yourself !"}))
                    }
                }else if(markFetch.isSuccess && markFetch.mark.isRescued){
                    return new Response(JSON.stringify({isSuccess: false, msg: `Pal (animal) has already been rescued by ${markFetch.mark.saviourName}`}))
                }else return new Response(JSON.stringify(markFetch))
            }catch(e){
                console.log(e)
                return new Response(JSON.stringify({isSuccess:false, msg: "Something went really wrong"}))
            }
                
        }else{
            return validation.resp
        }
    }else{
        return new Response(JSON.stringify({isSuccess: false, msg: "Request missing required credentials"}))
    }

}


export async function PUT(req){
// export async function PUT(req: NextRequest, params){

    let validation = await apiRouteTokenValidationHandler(req.cookies.get('token'))
    if(validation.isSuccess){
        let reqData = await req.json()
        if(
            reqData.markId &&
            (reqData.isApproved == true || reqData.isApproved == false) &&
            reqData.notificationId &&
            reqData.msg
        ){
            if(reqData.msg.length > 40){
                const UserOps = DataBase.UserOps()
                let user = await DataBase.UserOps().getUser(validation.id)
                if(user.isSuccess && user.isExisting){
                    let targetReq = user.user.notifications.find((it)=>it.id == reqData.notificationId)
                    if(targetReq){
                        if(!targetReq.isSeen){
                            try{
                                let notfiUpdate = await UserOps.updateRescueRequestStatus(
                                    validation.id,
                                    reqData.notificationId,
                                    reqData.isApproved,
                                    reqData.markId,
                                    reqData.msg
                                )
                                console.log("RETURNING notifUpdate: ", notfiUpdate)
                                return new Response(JSON.stringify(notfiUpdate))
                            }catch(e){
                                console.log(e)
                                
                                console.log("RETURNING notifUpdate: ", JSON.stringify({isSuccess:false, msg: "Something went really wrong"}))
                                return new Response(JSON.stringify({isSuccess:false, msg: "Something went really wrong"}))
                            }
                        }else return new Response(JSON.stringify({isSuccess: false, msg: `You have already ${targetReq.isApproved ? "Approved" : "Rejected"} the request !`}))
                    }else return new Response(JSON.stringify({isSuccess: false, msg: "No such requests"}))
                }else return new Response(JSON.stringify(user))
            }else return new Response(JSON.stringify({isSuccess: false, msg: "Message should be at least 40 character long and genuine"}))
        }else{
            return new Response(JSON.stringify({isSuccess: false, msg: "Request missing required credentials"}))
        } 
    }else{
        return validation.resp
    } 
}

export async function UPDATE(req){

    let reqData = await req.json()
    let validation = await apiRouteTokenValidationHandler(req.cookies.get('token'))
    if(validation.isSuccess && reqData.notificationId){
        let UserOps =  DataBase.UserOps()
        let {notifFetch, user} = await UserOps.getUser(validation.id)
        if(notifFetch.isSuccess && notifFetch.isExisting){
            for(let i =0; i < [...user.notifications].length; i++){
                if(user.notifications[i].id == notificationId && user.notifications[i].rescueRequestBy == validation.id && !user.notifications[i].responseReceived){
                    await UserOps.updateSpecific(validation.id, {responseReceived: true})
                    break;
                }
            }
            return new Response(JSON.stringify({isSuccess: true}))
        }else return new Response(JSON.stringify({isSuccess: false}))

    }else{
        return new Response(JSON.stringify({isSuccess: false, msg: "Missing data pieces"}))
    }
}

/**
 *
  On Approve or Reject:- 
 > Author NotificationStatus Update
 > Requestor Notification status update
    - Seen
    - Seen At
    - isApproved
 > Mark Status Update
    - isRescued / optedForRescue (List)
 > 

 * 
 */