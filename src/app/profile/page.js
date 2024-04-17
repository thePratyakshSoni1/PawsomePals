import { DataBase } from "@/utils/firebase"
import { redirect } from "next/navigation"
import { cookies, headers } from "next/headers"
import LoggedUserProfile from "./loggedUserProfile"
import { apiRouteTokenValidationHandler } from "@/utils/utilsFuncts"

export default async function Page(){

  let cook = cookies().get('token')
  if(cook){
    let validation = await apiRouteTokenValidationHandler(cook)
    if(validation.isSuccess){
        let UserOps = DataBase.UserOps()
        let res = await UserOps.getUser(validation.id)
        if(res.isSuccess){
            let userProfBuf = await DataBase.getImage(UserOps.fbStorage, res.user.profile, true)
            if(userProfBuf.isSuccess){
              userProfBuf = `data:type=image/*;base64,${Buffer.from(userProfBuf.buf).toString('base64')}`
            }else userProfBuf = "/placeholder.jpg"
            
            return <LoggedUserProfile user={{firstName: res.user.firstName, lastName: res.user.lastName, age: res.user.age, marksAdded: res.user.marksAdded, rescued: res.user.rescued, phone: res.user.phone, imgBuf: userProfBuf, karma: res.user.karma}}/>
        
        }else{
            if(res.isExisting && res.isExisting == false){
              return redirect("/login")
            }else return <h3>Something went wrong!, plz comeback later</h3>
        }
      }
  }
  
  return redirect("/login")
  
}