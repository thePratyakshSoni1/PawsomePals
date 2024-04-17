import { DataBase } from "@/utils/firebase";
import { redirect } from "next/navigation";
import {RescuePage} from "./rescuePage";

export default async function Page({params}){
    const markFetchReq = await DataBase.Mark().getMark(params.id)
    if(markFetchReq.isSuccess){
        if(markFetchReq.mark.isRescued == false){
            return <RescuePage params={{id: params.id}} />
        }else{
            return redirect(`/mark/${params.id}`)
        }
    }else{
        return <>Page not working at the moment, please comeback later!</>
    }
}