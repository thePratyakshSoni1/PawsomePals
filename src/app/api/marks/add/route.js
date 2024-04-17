import { DataBase, Mark } from "@/utils/firebase";
import { apiRouteTokenValidationHandler } from "@/utils/utilsFuncts";
import { NextRequest } from "next/server";

export async function POST(request) {
  let reqData = await request.json();
  let userToken = request.cookies.get("token");
  if (userToken) {
    try {
      let userId = await DataBase.LoginSession().getUserIdFromtoken(
        userToken.value
      );

    //   console.log("REQDATA: ", reqData)

      if (userId.isSuccess) {
        let isValid = validateRequestPayload(reqData)
        if(isValid.isSuccess){
            await DataBase.addNewMark(
                Mark.MarkObject(
                    reqData.title,
                    reqData.description,
                    `${crypto.randomUUID()}.png`,
                    reqData.breed,
                    reqData.age,
                    reqData.isForAdoption,
                    reqData.isInjured,
                    false,
                    [reqData.location.lat, reqData.location.lng],
                    "undefined",
                    userId.userId,
                    "undefined",
                    "undefined",
                    []
                ),
                reqData.imgBuf.data
            )
            return new Response(JSON.stringify({isSuccess: true}))
        }else{
            return new Response(JSON.stringify(isValid))
        }
      } else {
        return new Response(
          JSON.stringify({ isSuccess: false, mag: userId.msg })
        );
      }
    } catch (e) {
        console.log(e)
      return new Response(JSON.stringify({isSuccess: false, msg: "Unexpected error"}));
    }
  }
}



function validateRequestPayload(reqData){
    try{
    if (
        reqData.title &&
        reqData.description &&
        reqData.breed &&
        reqData.age &&
        reqData.location &&
        reqData.imgBuf &&
        (reqData.isForAdoption == true || reqData.isForAdoption == false) &&
        (reqData.isInjured == true || reqData.isInjured == false)
      ) {
        const imgTypes = ["png", "jpg", "jpeg", "ico"]
            if(reqData.title.length > 5 && /[A-Za-z]/.test(reqData.title)){
                if(reqData.description.length > 20 && /[A-Za-z]/.test(reqData.description)){
                    if(reqData.age == "Don't know" || (parseFloat(reqData.age) && parseFloat(reqData.age) < 100 && parseFloat(reqData.age) > 0 ) ){
                            if(reqData.isForAdoption || reqData.isInjured){
                                if(reqData.location){
                                    if(reqData.imgBuf){
                                        if(reqData.breed == "Don't know" || (reqData.breed && reqData.length > 2 && /[A-Za-z]/.test(reqData.breed))){
                                            return {isSuccess: true} // :)
                                        }else throw new Error("Invalid Breed")
                                    }else throw new Error("Invalid Image To Upload")
                                }else throw new Error("Invalid Location")
                            }else throw new Error("Invalid choice, at least one option should be selected - 'For Adoption' or 'Is Injured'")
                    }else throw new Error("Invalid age")
                }else throw new Error("Invalid description, should be genuine and at least 20 characters long")
            }else throw new Error("Invalid title, should be genuine and at least 20 characters long")
        }else return {isSuccess: false, msg: "Request missing required data."}
    }catch(e){
        console.log(e)
        return {isSuccess: false, msg: e.message}
    }
    
}