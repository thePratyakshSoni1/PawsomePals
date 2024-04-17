import { DataBase } from "@/utils/firebase"
import { apiRouteTokenValidationHandler } from "@/utils/utilsFuncts"
import { NextRequest } from "next/server"

// export async function GET(request:NextRequest){
export async function GET(request){
    let validation = await apiRouteTokenValidationHandler(request.cookies.get('token'))

    if(validation.isSuccess){
        let MarkOps = DataBase.Mark()
        let marks = await MarkOps.getAllMarks()
        let listOfMarks = []
        if(marks.isSuccess){    
            for(let i=0; i<marks.list.length; i++){
                let img = await DataBase.getImage(MarkOps.fbStorage, marks.list[i].image, false)
                if(img.isSuccess){
                    listOfMarks.push({...marks.list[i], imgBuf: `data:type=image/*;base64,${Buffer.from(img.buf).toString('base64')}`})
                }else{
                    listOfMarks.push({...marks.list[i], imgBuf: `/placeholder.jpg`})
                }
            }
            return new Response(JSON.stringify({isSuccess: true, markers: listOfMarks}))
        }else{
            return new Response(JSON.stringify(marks))
        }
    }else{
        return validation.resp
    }

}