import { DataBase, User } from "@/utils/firebase";
import { isValidAge, isValidPhone, isValidName, apiRouteTokenValidationHandler } from "@/utils/utilsFuncts";
import { NextRequest } from "next/server";
import crypto from "crypto"

export async function POST(request){

    let reqData = await request.json()
    let isValidData = validateRequestPayload(reqData)
    let UserOps = DataBase.UserOps()
    
    let isImgUploaded = false
    let userAdded = false
    try{

        if(isValidData.isSuccess){
            let isExistingUser = await UserOps.userAlreadyExists(reqData.phone)
            if(isExistingUser.isSuccess){
                if(isExistingUser.isExisting){
                    return new Response(JSON.stringify({isSuccess: false, msg: `User already exists with phone: ${reqData.phone}`}))
                }else{
                    let userProfileUpload = await DataBase.uploadImg(UserOps.fbStorage, `${reqData.phone}.png`, Buffer.from(reqData.imgBuf.data), true)
                    if(userProfileUpload){
                        isImgUploaded = true
                        let userObjToAdd = User.UserObject(
                            reqData.age,
                            reqData.firstName,
                            reqData.lastName,
                            reqData.phone,
                            [],
                            [],
                            `${reqData.phone}.png`,
                            reqData.password,
                            0,
                            []
                        )

                        userAdded = await UserOps.addUser(userObjToAdd) 

                        if(userAdded) return await getSuccessResponse(reqData.phone) 
                        else throw new Error("Error adding user")
                    } 
                }
            }else{
                return new Response(JSON.stringify({isSuccess: false, msg: "Unexpected Error"}))
            }
        }else return new Response(JSON.stringify(isValidData))
    
    }catch(e){
        try{
            if(isImgUploaded && !userAdded) await DataBase.deleteImg(UserOps.fbStorage, reqData.profile, true)
            console.log("POST(): Error:-", e)
            return new Response(JSON.stringify({isSuccess: false, msg: "Error in adding new user, try again later"}))
        }catch(ee){
            console.log("POST(): Unexpected Error adding user and deleting uploaded object")
            return new Response(JSON.stringify({isSuccess: false, msg: "Unexpected Error"}))
        }
    }


}


// export async function UPDATE(request: NextRequest){
export async function PUT(request){ 

      const onUpdate = async (isPhoneChanged, currentUserPhone, UserOps, updatedUser, isImageUpdated, imgBuf)=>{

        let isUserUpdated = false
        console.log("Cahnged PHONE: ", isPhoneChanged, currentUserPhone, updatedUser.phone)


        if(isPhoneChanged){
            let userAlreadyExists = await UserOps.userAlreadyExists(updatedUser.phone)
            if(userAlreadyExists.isSuccess && userAlreadyExists.isExisting == true){
                return {isSuccess: false, msg: "User with this phone number already exists"}
            }

            let marksUpdate = await updateMarksPhoneFields(currentUserPhone, updatedUser.phone)
            if(marksUpdate.isSuccess){
                let userUpdate = await UserOps.addUser(updatedUser)
                if(!userUpdate) return {isSuccess: false, msg: "Unable to update profile, try again later"}
                else isUserUpdated = true
                
                let delOldDoc = await UserOps.removeUser(currentUserPhone)
                
                if(!delOldDoc){ 
                    await UserOps.removeUser(updatedUser.phone)
                    isUserUpdated = false
                    return {isSuccess: false, msg: "Unable to update profile, try again later"}
                }
                
                if(isUserUpdated){
                    await DataBase.deleteImg(UserOps.fbStorage, currentUserPhone+".png", true)
                    await DataBase.uploadImg(UserOps.fbStorage, updatedUser.phone+".png", imgBuf, true)
                }
            }else return {isSuccess: false, msg: "Unable to update Phone in marks"}
        }else{
            let userUpdate = await UserOps.updateSpecific(currentUserPhone, {
                firstName: updatedUser.firstName,
                age: updatedUser.age,
                lastName: updatedUser.lastName,
            })

            if(userUpdate.isSuccess){
                isUserUpdated = true
            }else return userUpdate 
        }
        
        if(!isPhoneChanged && isImageUpdated && isUserUpdated){
            await DataBase.deleteImg(UserOps.fbStorage, currentUserPhone+".png", true)
            await DataBase.uploadImg(UserOps.fbStorage, updatedUser.phone+".png", imgBuf, true)
        }

        return {isSuccess: true}

      }

      let reqData = await request.json();
      let userToken = request.cookies.get("token");
  
      let validation = await apiRouteTokenValidationHandler(userToken)
      let reqDataValidation = validateUpdateReqData(reqData)
      if(reqDataValidation.isSuccess){
        if(validation.isSuccess){
            let UserOps = DataBase.UserOps()
            let userFetch = await UserOps.getUser(validation.id)
            if(userFetch.isSuccess){
                if(userFetch.isExisting){
                    var user = userFetch.user
                    let userUpdateTask = await onUpdate( 
                        (user.phone != reqData.phone), 
                        user.phone, 
                        UserOps,
                        User.UserObject(
                            reqData.age, 
                            reqData.firstName,
                            reqData.lastName,
                            reqData.phone,
                            user.marksAdded,
                            user.rescued,
                            `${reqData.phone}.png`,
                            user.password,
                            user.karma,
                            user.notifications
                        ), 
                        reqData.isImageUpdated, Buffer.from(reqData.imgBuf.data)
                    )

                    if(userUpdateTask.isSuccess){
                        return new Response(JSON.stringify({isSuccess: true}))
                    }else return new Response(JSON.stringify(userUpdateTask))
                }else return new Response(JSON.stringify({isSuccess: false, msg: "User Doesn't Exists"}))
            }else return new Response(JSON.stringify(userFetch))

        }else{
            return validation.resp
        }
    }else{
        return new Response(JSON.stringify(reqDataValidation))
    }
    
}


async function updateMarksPhoneFields(oldPhone, newPhone){
    let MarkOps = DataBase.Mark()
    let allMarks = await MarkOps.getAllMarks()
    let marksToUpdate = []
    if(allMarks.isSuccess){
        allMarks.list.forEach((it, indx)=>{
            let shouldBeUpdated = false
            let targetMark
            if(it.addedBy == oldPhone){
                targetMark = it 
                targetMark.addedBy = newPhone
                shouldBeUpdated = true
            }

            if(it.rescuedBy == oldPhone){
                if(shouldBeUpdated){
                    targetMark.rescuedBy = newPhone
                }else{
                    targetMark = it
                    targetMark.rescuedBy = newPhone
                    shouldBeUpdated = true
                }
            }

            if(shouldBeUpdated){
                marksToUpdate.push({id: targetMark.id, payload: {addedBy: targetMark.addedBy, rescuedBy: targetMark.rescuedBy}})
            }

        })

        let isSuccess = true
        for(let y=0; y<marksToUpdate.length; y++){
            let updateTask = await MarkOps.updateSpecific(marksToUpdate[y].id, marksToUpdate[y].payload)
            if(!updateTask.isSuccess){
                isSuccess = false
                for(let z=0; z<=y; z++){
                    let revertPayload = {
                        addedBy: (marksToUpdate[z].addedBy == newPhone) ? oldPhone : marksToUpdate[z].addedBy, 
                        rescuedBy: (marksToUpdate[z].rescuedBy == newPhone) ? oldPhone : marksToUpdate[z].rescuedBy 
                    }
                    await MarkOps.updateSpecific(marksToUpdate[y].id, revertPayload)
                }
                break;
            }
        }

        return {isSuccess: isSuccess}
    }else{
        return allMarks
    }
}

async function getSuccessResponse(userId){
    let resp = new Response(JSON.stringify({isSuccess: true}))
    
    let token = `token#${crypto.randomUUID()}`
        
    let d = new Date()
    d.setMonth( d.getMonth() + 2 )
    let task = await DataBase.LoginSession().addSession(token, userId, d)
    if(task.isSuccess){
        resp.headers.append("set-cookie", `token=${token}; expires=${d.toUTCString()}; httpOnly; path=/; Secure;`)
    }else{
        resp = new Response(JSON.stringify({isSuccess: true, msg: "Try Logging in..."}))
    }

    return resp
}

function validateUpdateReqData(reqData){
    try{
        if (
            reqData.firstName &&
            reqData.lastName &&
            reqData.age && 
            reqData.imgBuf &&
            reqData.phone &&
            reqData.isImageUpdated == true || reqData.isImageUpdated == false
          ){

            if(isValidName(reqData.firstName)){
                if(isValidName(reqData.lastName)){
                    if(isValidAge(reqData.age)){
                        if(isValidPhone(reqData.phone)){
                            if(reqData.imgBuf){
                                return {isSuccess: true}
                            }else throw new Error("Invalid Image To Upload")
                        }else throw new Error("Invalid Phone")
                    }else throw new Error("Invalid age")
                }else throw new Error("Invalid last name")
            }else throw new Error("Invalid first name")
            
        }else throw new Error("Request missing required data.")
    }catch(e){
        console.log(e)
        return {isSuccess: false, msg: e.message}
    }
}

function validateRequestPayload(reqData){
    try{
        if (
            reqData.firstName &&
            reqData.lastName &&
            reqData.age && 
            reqData.profile &&
            reqData.imgBuf &&
            reqData.phone
        ) {
            const imgTypes = ["png", "jpg", "jpeg", "ico"]
                if(isValidName(reqData.firstName)){
                    if(isValidName(reqData.lastName)){
                        if(isValidPhone(reqData.phone)){
                            if(isValidAge(reqData.age)){
                                if(reqData.profile.length > 3 && reqData.profile.split(".").length == 2 && (imgTypes.find(it=> it == reqData.profile.split(".")[1]))){
                                    if(reqData.imgBuf){
                                        return { isSuccess: true } // :)
                                    }else throw new Error("Invalid Image To Upload")
                                }else throw new Error("Invalid Image name")
                            }else throw new Error("Invalid age")
                        }else throw new Error("Invalid Phone")
                    }else throw new Error("Invalid last name")
                }else throw new Error("Invalid first name")
            }else throw new Error("Request missing required data.")
    }catch(e){
        console.log(e)
        return {isSuccess: false, msg: e.message}
    }
    
}