import { DataBase } from "@/utils/firebase";
import { apiRouteTokenValidationHandler } from "@/utils/utilsFuncts";
import { NextRequest } from "next/server";

export async function GET(req, params){
    let cook = req.cookies.get('token')
    
    let validation = await apiRouteTokenValidationHandler(cook)

    if(validation.isSuccess){
        let MarkOps = DataBase.Mark()
        let markFetch = await MarkOps.getMark(params.params.markid)
        return new Response(JSON.stringify(markFetch))
    }else{
        return validation.resp
    }
}