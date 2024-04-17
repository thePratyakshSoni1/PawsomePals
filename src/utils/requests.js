export async function loginRequest(phone, pass){
    return await fetch(`/api/login`, {
        method: "POST",
        body: JSON.stringify({userId: phone, password: pass}),
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include"
    })

}

export async function verifyLoginSession(){
    return await fetch(`/api/verify`, {credentials: "include"})
}