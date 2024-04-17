import { DataBase } from "@/utils/firebase"
import { apiRouteTokenValidationHandler } from "@/utils/utilsFuncts";
import { getStorage } from "firebase/storage";
import { NextRequest } from "next/server";

export async function POST(req){
// export async function POST(req: NextRequest){

    let cook = req.cookies.get('token')
    
    let validation = await apiRouteTokenValidationHandler(cook)

    if(validation.isSuccess){
        let reqData = await req.json()
        if(
            reqData.name,
            reqData.fromProfile != undefined && (reqData.fromProfile == false || reqData.fromProfile == true)
        ){
            let img = await DataBase.getImage(getStorage(DataBase.getFirebaseInstance()), reqData.name, reqData.fromProfile)
            if(img.isSuccess){
                return new Response(JSON.stringify({isSuccess: true, imgBuf: Buffer.from(img.buf)}))
            }else {
                return new Response(JSON.stringify({...img, msg: "Unexpected Error"}))
            }
        }else{
            return new Response(JSON.stringify({isSuccess: false, msg: "Bad Request"}))
        }
    }else{
        return validation.resp
    }
    
    

}