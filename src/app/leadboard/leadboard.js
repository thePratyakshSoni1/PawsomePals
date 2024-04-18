"use client"
import { IconButton, TopPlayerCard } from "@/components"
import styles from "./leadboard.module.css"
import { useRouter } from "next/navigation"
import { LoadingDialog } from "@/components/loadingDialog"
import Link from "next/link"


export default function Leadboard({list}){
    const mRouter = useRouter()
    return <div className={styles.mainContainer}>
            <div className={styles.topBar}>
                <IconButton iconLink={"/back.png" } imgStyle={{ padding: "12px", backgroundColor: "transparent"}} onBtnClick={()=>mRouter.back()}/>
                <span style={{color: "white", fontWeight: "bold", fontSize: "1.2rem"}}>Rescue Gods</span>
            </div>
            <div style={{overflowY: "scroll", height: "93vh"}}>
                <div className={styles.playersList}>
                    {
                        list.map((it, indx)=>{
                            return <Link style={{textDecoration: "none"}} href={`/mark/${it.id}`} key={indx}><TopPlayerCard name={it.name} karmaPoints={it.karma} rank={indx+1} imgSrc={it.imgBuf}/></Link> 
                        })
                    }
                </div>
            </div>
    </div>
}
