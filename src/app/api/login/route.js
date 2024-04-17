import { DataBase } from "@/utils/firebase";
import { NextRequest } from "next/server";
import fs from "fs"
import { randomUUID } from "crypto";
import { getStorage } from "firebase/storage";

export async function POST(request){

    let data = await request.json()
    let userVerificationRes = await verifyUser(data.userId, data.password)
    let LoginSessions = DataBase.LoginSession()

    if(userVerificationRes.isSuccess ){
        let resp
        if( userVerificationRes.isVerified){
            let token = `token#${randomUUID()}`
        
            let d = new Date()
            d.setMonth( d.getMonth() + 2 )
            resp = new Response(JSON.stringify({isSuccess: true, isVerified: true}))
            let task = await LoginSessions.addSession(token, data.userId, d)
            if(task.isSuccess){
                resp.headers.append("set-cookie", `token=${token}; expires=${d.toUTCString()}; httpOnly; path=/;`)
            }else{
                resp = new Response(JSON.stringify({isSuccess: false, msg: task.msg}))
            }
        }else{
            resp.body = new Response(JSON.stringify({isSuccess: true, isVerified: false, msg: userVerificationRes.msg}))
        }
        
        return resp
        
    }else{
        return new Response(JSON.stringify({isSuccess: false, msg: userVerificationRes.msg}))
    }


}

export async function GET(request){
    let token = request.cookies.get('token')
    let configHeader = request.headers.has('image_buf_config')
    let sendImg = configHeader ? request.headers.get('image_buf_config') == 'true' : false
    if(token){
        let userId = await DataBase.LoginSession().getUserIdFromtoken(token.value)
        console.log("HOME FETCH: ",token, userId)
        if(userId.isSuccess){
            if(sendImg){
                let imgBuf = await DataBase.getImage(getStorage(DataBase.getFirebaseInstance()), `${userId.userId}.png`, true)
                if(imgBuf.isSuccess) return new Response(JSON.stringify({...userId, imgBuf: Buffer.from(imgBuf.buf)}))
                else return new Response(JSON.stringify(userId))
            }else{
                return new Response(JSON.stringify(userId))
            }
        }else return new Response(JSON.stringify(userId))
    }else{
        return new Response(JSON.stringify({isSuccess: false, msg: "Bad Request"}))
    }
}


export async function DELETE(req){
    let resp = new Response("lOGOUT")
    let token = req.cookies.get('token')
    if(token) await DataBase.LoginSession().removeSession(token.value)
    console.log("TK: ", token.value)
    resp.headers.append("set-cookie", `token=null; expires=${(new Date(0)).toUTCString()}; path=/; httpOnly;`)
    return resp
}

async function verifyUser( userId, passsword ){
    let UserOps = DataBase.UserOps()
    let userSearchRes = await UserOps.userAlreadyExists(userId)
    if(userSearchRes.isSuccess && userSearchRes.isExisting){
        if(userSearchRes.password == passsword){
            return {isSuccess: true, isVerified: true}
        }else if(!userSearchRes.isExisting){
            return {isSuccess: false, isVerified: false, msg: "User doesn't exists"}
        }else{
            return {isSuccess: false, isVerified: false, msg: "Wrong Password"}
        }
    }else{
        return {isSuccess: false, msg: userSearchRes.msg}
    }
}


export function giveMe(){
    let f = fs.readFileSync("./public/medal.png") 
    return Uint8Array.from(f) 
  }