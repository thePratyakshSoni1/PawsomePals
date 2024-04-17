import { apiRouteTokenValidationHandler } from "@/utils/utilsFuncts";

export async function GET(request){

    let cook = request.cookies.get('token')
    if(cook){
        let validation = await apiRouteTokenValidationHandler(cook)
        return validation.resp
    }else {
        return new Response(JSON.stringify({isSuccess: "false", msg: "Bas Request"}))
    }
    
}