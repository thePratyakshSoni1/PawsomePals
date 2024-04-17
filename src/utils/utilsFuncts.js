import { DataBase } from "./firebase"

export function isValidPhone(phone){
    return phone.length == 10 && !(/[^0-9]/).test(phone)
}

export function isValidName(name){
    return name.length > 1 && !(/[^A-Za-z]/).test(name)
}

export function isValidAge(age){
    return !(/[^0-9]/).test(age) && parseInt(age) < 120 && parseInt(age) > 15
}

export function isValidPssword(pass){
    return (/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/).test(pass)
}

export async function apiRouteTokenValidationHandler(cook){
    if(cook){
        let loginSessions = await DataBase.LoginSession().isTokenValid(cook.value)
        if(loginSessions.isSuccess){
            if(loginSessions.isValidToken){
                let UserOps = DataBase.UserOps()
                let res = await UserOps.userAlreadyExists(loginSessions.id)
                let verificationResp = new Response(JSON.stringify({isSuccess: res.isSuccess, isVerified: res.isExisting}))
                if(res.isSuccess && !res.isExisting ){
                    verificationResp.headers.append("set-cookie", `token=null; expires=${(new Date(0)).toUTCString()}; httpOnly; path=/;`)
                }
                return { isSuccess: true && res.isExisting, resp: verificationResp, id: loginSessions.id }
            }else{
                let resp = (new Response(JSON.stringify({isSuccess: true, isVerified: false})))
                resp.headers.append("set-cookie", `token=null; expires=${(new Date(0)).toUTCString()}; httpOnly; path=/;`)
                return {isSuccess: false, resp: resp}
            }
        }else return {isSuccess: false, resp: new Response(JSON.stringify({isSuccess: false, msg: "Unexpected Error"}))}
    }else return {isSuccess: false, resp: new Response(JSON.stringify({isSuccess: "false", msg: "Bas Request"}))}
}