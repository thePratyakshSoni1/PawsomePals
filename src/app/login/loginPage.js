"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./login.module.css";
import { Divider, OsmMap } from "@/components";
import { isValidPhone, isValidPssword } from "@/utils/utilsFuncts";
import { loginRequest } from "@/utils/requests";
import Link from "next/link";
import { LoadingDialog } from "@/components/loadingDialog";
import Image from "next/image";
export function LoginPage() {
  let router = useRouter();
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setLoading] = useState(false)
  const onLogin = async ()=>{
    setLoading(true)
    if(isValidPhone(userId)){
      if(isValidPssword(password)){
        
        let resp = await (await loginRequest(userId, password)).json()
        if(resp.isSuccess){
          if(resp.isVerified){
            router.push("/home")
          }else{
            alert(resp.msg)
            setLoading(false)
          }
        }else{
            alert(resp.msg)
            setLoading(false)
        }

      }else{
        alert("Enter a vali 8 character long password with at least a letter, a number and a special character")
        setLoading(false)
      }
    }else{
      alert("Enter a valid 10 digit phone number")
      setLoading(false)
    }
  }
  return (
    <>
      <Image alt="" src="/loginBg.png" height={2000} width={2000} style={{position: "absolute", zIndex: 0, width: "100vw", height: "100vh", objectFit: "cover", filter: "blur(2px)"}}/>
      <div className={styles.mainBG}>
        <div id={styles.mainContainer}>
          <div style={{display: "flex", flexDirection: "row", alignItems: "center", columnGap: "12px"}}>
            <Image alt="" src="/favicon.ico" height={100} width={100} />
            <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start", color: "white"}}>
              <p style={{fontWeight: "bold", fontSize: "1.4rem", margin: "0px"}}>Pawsome Pals</p>
              <span style={{fontSize: "0.85rem"}}>A map to rescue animals ❤️</span>
            </div>
          </div>
          <br></br>
          <input
            className={styles.inputField}
            placeholder="Phone"
            style={{ width: "-webkit-fill-available" }}
            value={userId}
            onChange={(ev)=>{
              setUserId(ev.target.value)
            }}
          />
          <Divider height="0px" />
          <input
            className={styles.inputField}
            placeholder="Password"
            style={{ width: "-webkit-fill-available" }}
            value={password}
            type="password"
            onChange={(ev)=>{
              setPassword(ev.target.value)
            }}
          />
          <Divider height="18px" />
          <Link href={"/signup"}>
            <div className={styles.button} style={{border: "solid 1px", borderColor: "white", backgroundColor: "transparent"}}>SignUp</div>
          </Link>
          <div
            className={styles.button}
            onClick={() => {
              isLoading ? ()=>{} : onLogin()
            }}
          >
            Login
          </div>
        </div>
        {isLoading ? <LoadingDialog />: ""}
      </div>
    </>
  );
}
