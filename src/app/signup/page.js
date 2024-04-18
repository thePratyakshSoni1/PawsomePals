"use client"
import { Button, Divider, SingleLineInputField, UploadImageButton } from "@/components"
import { useEffect, useState } from "react"
import styles from "./signup.module.css"
import { User } from "@/utils/firebase"
import { useRouter } from "next/navigation"
import { LoadingDialog } from "@/components/loadingDialog"
import Link from "next/link"

export default function SignupPage(){
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [age , setAge] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPass, setConfirmPass] = useState("")
    const [imgBuf, setImgBuf] = useState()

    const [isLoading, setLoading] = useState(false)

    const router = useRouter()

    const onSignup = async()=>{
        setLoading(true)
        try{
            if(firstName && firstName.length > 2 && !(/[^A-Za-z]/).test(firstName)){
                if(lastName && lastName.length > 2 && !(/[^A-Za-z]/).test(lastName)){
                    if(phone.length == 10 && !(/[^0-9]/).test(phone)){
                        if(parseInt(age) && parseInt(age) > 17 && parseInt(age) < 120){
                            if(imgBuf){
                                if((/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/).test(password)){
                                    let bodyPayload = User.UserObject(
                                        age, firstName, lastName, phone, [], [], phone+".png",
                                        password, 0, []
                                    )

                                    let payload = JSON.stringify({...bodyPayload, imgBuf: imgBuf})
                                    let signUpReq = await (await fetch("/api/user/add", {
                                        method: "POST",
                                        credentials: "include",
                                        body: payload
                                    })).json()

                                    if(signUpReq.isSuccess){
                                        router.replace("/")
                                    }else{
                                        alert(signUpReq.msg)
                                        setLoading(false)
                                    }
                                }else throw new Error("Confirm Password and password should match, also the password should be at least 8 character long with at leas a number a alphabet and a special symbol")
                            }else throw new Error("Please add photo for your profile !")
                        }else throw new Error("Please add a valid age !")
                    }else throw new Error("Please add a valid phone !")
                }else throw new Error("Please add a valid last name!")
            }else throw new Error("Please add a valid first name !") 
        }catch(e){
            alert(e.message)
            setLoading(false)
        }
    }

    return <div className={styles.contentContainer}>
        <div className={styles.main}>
            <div>
                <UploadImageButton buf={imgBuf} setBuf={setImgBuf} text="Add Profile Photo" 
                    imageStyles={{
                        marginTop: "6px", clipPath: "circle()",
                        border: "none",
                        width: "12rem",
                        objectFit: "cover",
                        padding: "0px"
                    }}/>
                <SingleLineInputField onChange={setFirstName} placeholder={"First Name"} value={firstName} />
                <SingleLineInputField onChange={setLastName} placeholder={"Last Name"} value={lastName} />
                <SingleLineInputField onChange={setAge} placeholder={"Age"} value={age} type="number"/>
                <SingleLineInputField onChange={setPhone} placeholder={"Phone"} value={phone} type="number"/>
                <SingleLineInputField onChange={setPassword} placeholder={"Password"} value={password} type="password"/>
                <SingleLineInputField onChange={setConfirmPass} placeholder={"Confirm Password"} value={confirmPass} type="password" inputStyles={{marginBottom: "18px"}}/>
                <Button fillWidth={true} onClick={()=>{
                    isLoading ? ()=>{} : onSignup()
                }} text="Continue" color="orange" buttonStyles={{width: "-webkit-fill-available", marginTop: "auto", marginBottom: "1rem"}} />
                <Link href={"/login"}>
                    <Button
                        fillWidth={true}
                        onClick={() => {}}
                        text="login"
                        color="blue"
                        buttonStyles={{
                            marginTop: "auto",
                            backgroundColor: "transparent",
                            border: "solid blue",
                            color: "blue",
                            marginBottom: "1.5rem"
                        }}
                    />
                </Link>
            </div>
        </div>
    {isLoading ? <LoadingDialog /> : ""}
    </div>
}