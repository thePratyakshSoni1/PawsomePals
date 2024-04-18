import { DataBase, LoginSessions, RescueNotification } from "@/utils/firebase";
import { cookies } from "next/headers";
import { HomePage } from "./homepage";
import { redirect } from "next/navigation";
import { apiRouteTokenValidationHandler } from "@/utils/utilsFuncts";

export default async function Page(){
  let cooks = cookies().get('token')
  try{
    let validation = await apiRouteTokenValidationHandler(cooks)
    if(validation.isSuccess){
          let MarkOps = DataBase.Mark()

          let [marks, user] = await Promise.all([MarkOps.getAllMarks(), DataBase.UserOps().getUser(validation.id)])

          if(marks.isSuccess){

            let hasNewNotifs = false
            for(var j=0; j<user.user.notifications.length; j++){
              if((user.user.notifications[j].isSeen == true && user.user.notifications[j].type == RescueNotification.TYPES.RequestResponse && user.user.notifications[j].responseReceived == false) || user.user.notifications[j].isSeen == false){
                hasNewNotifs = true
                break
              }
            }

            // console.log("MMs: ", listOfMarks.length)
            return <HomePage hasNewNotifications={hasNewNotifs}/>
          }else{
            return <>PAGE NOT WORKING...</>
          }
      }else{
        return redirect("/login")
      }
  }catch(e){
    console.log("Unexpected error: ", e)
    return redirect("/login")
  }

  // return <HomePage />
} 