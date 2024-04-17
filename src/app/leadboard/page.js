"use client"
import { Divider, IconButton, TopPlayerCard } from "@/components"
import styles from "./leadboard.module.css"
import { useRouter } from "next/navigation"

export default function Leadboard(){
    const mRouter = useRouter()
    return <div className={styles.mainContainer}>
            <div className={styles.topBar}>
                <IconButton iconLink={"/back.png" } imgStyle={{ padding: "12px", backgroundColor: "transparent"}} onBtnClick={()=>mRouter.back()}/>
                <span style={{color: "white", fontWeight: "bold", fontSize: "1.2rem"}}>Top Players</span>
            </div>
            <div style={{overflowY: "scroll", height: "93vh"}}>
                <div className={styles.playersList}>
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                    <TopPlayerCard name={"Robert Downey Jr."} karmaPoints={9999} rank={1} />
                </div>
            </div>
    </div>
}
