import { DataBase } from "@/utils/firebase";
import { getStorage } from "firebase/storage";
import { NextRequest } from "next/server";

export async function GET(request){
    console.log("STARTED AT: ", (new Date()).toLocaleString(), "\n\n")
    let [t1, t2, t3, t4] = await Promise.all([task("1"), task("2"), task("3"), task("4")])
    console.log("COMPLETE ALL: ", t2)

    // console.log("SYC: \n")
    // console.log(await task("1"))
    // console.log(await task("2"))
    // console.log(await task("3"))
    // console.log(await task("4"))
    return new Response("HELLAO")
}

async function task(msg){
    let resp = await DataBase.getImage(getStorage(DataBase.getFirebaseInstance()), `317e74ae-d0aa-4395-aa7d-216700ea55f7.png`, false)
    // console.log(msg, ": FINISHED - ", (new Date()).toLocaleString()," Success: ", resp.isSuccess)
    return {id: msg, success: resp.isSuccess, at: (new Date()).toLocaleString()}
}


/**

1 : FINISHED -  4/12/2024, 12:36:12 AM  Success:  true
2 : FINISHED -  4/12/2024, 12:36:15 AM  Success:  true
3 : FINISHED -  4/12/2024, 12:36:20 AM  Success:  true
4 : FINISHED -  4/12/2024, 12:36:22 AM  Success:  true

 */