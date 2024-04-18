import { DataBase } from "@/utils/firebase"
import Leadboard from "./leadboard"
import { cookies } from "next/headers"
import { apiRouteTokenValidationHandler } from "@/utils/utilsFuncts"
import { redirect } from "next/navigation"

export default async function Page(){

    let cook = cookies().get('token')
    if(cook){
      let validation = await apiRouteTokenValidationHandler(cook)
      if(validation.isSuccess){
          let UserOps = DataBase.UserOps()
          try{
              let listOfUsers = await UserOps.getAllUsers()
              listOfUsers = listOfUsers.sort((a, b)=>{
                if(a.karma > b.karma) return -1 
                else if(a.karma == b.karma) return 0
                else return 1
              })

              let listToReturn = []

                for(let y=0; (y<listOfUsers.length && y<10); y++){
                    let userProfBuf = await DataBase.getImage(UserOps.fbStorage, listOfUsers[y].profile, true)
                      listToReturn.push({
                            name: listOfUsers[y].firstName+" "+listOfUsers[y].lastName,
                            imgBuf: userProfBuf.isSuccess ? `data:type=image/*;base64,${Buffer.from(userProfBuf.buf).toString('base64')}` : `/placeholder.jpg`,
                            karma: listOfUsers[y].karma,
                            id: listOfUsers[y].phone
                       })
                }

                  
                return <Leadboard list={listToReturn}/>
              
          }catch(e){
            console.log(e)
            return <>Something Went wrong, try refreshing the page or comeback later :)</>
          }
        }
    }
    
    return redirect("/login")
    
  }