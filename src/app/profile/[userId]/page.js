import { DataBase, Mark } from "@/utils/firebase"
import styles from "../profile.module.css"
import { SimpleTopBar } from "@/components/simpleToBar"
import Image from "next/image"
import { Divider } from "@/components/divider"
import crypto from "crypto"

export default async function PublicUserProfile({params}){
    let userId = params.userId
    let isSuccess = false
    let user
    let userImg
    let animalsRescued = []
    let animalsAdded = []
    let msg = "User not found"

    let rescuedFetchError = false
    let markAddedFetchError = false

    if(userId && userId.length == 10){
        let MarkOps = DataBase.Mark()

        let rescuedMarkFetcher = async (markId)=>{
            var mark = await MarkOps.getMark(markId)
            try{
                if(mark.isSuccess){
                    let animalImg = await DataBase.getImage(MarkOps.fbStorage, mark.mark.image, false)
                    if(animalImg.isSuccess){
                        animalsRescued.push({...mark.mark, id:markId, imgBuf: `data:type=image/*;base64,${Buffer.from(animalImg.buf).toString('base64')}`})
                    }else animalsRescued.push({...mark.mark, imgBuf: `/placeholder.jpg`, id: markId})
                }else throw new Error("ERROR")
            }catch(e){
                rescuedFetchError = true
            }
        }

        let addedMarkFetcher = async (markId)=>{
            var mark = await MarkOps.getMark(markId)
            try{
                if(mark.isSuccess){
                    let animalImg = await DataBase.getImage(MarkOps.fbStorage, mark.mark.image, false)
                    if(animalImg.isSuccess){
                        animalsAdded.push({...mark.mark, id: markId, imgBuf: `data:type=image/*;base64,${Buffer.from(animalImg.buf).toString('base64')}`})
                    }else animalsAdded.push({...mark.mark, id: markId, imgBuf: `/placeholder.jpg`})
                }else throw new Error("ERROR")
            }catch(e){
                markAddedFetchError = true
            }
        }

        let UserOps = DataBase.UserOps()
        let task = await UserOps.getUser(userId)
        if(task.isSuccess){
            user = task.user
            let userImgReq = await DataBase.getImage(UserOps.fbStorage, user.phone+`.png`, true)
            if(userImgReq.isSuccess){
                userImg = `data:type=image/*;base64,${Buffer.from(userImgReq.buf).toString('base64')}`
            }
            isSuccess = true
            try{
                for(let i=0; i<user.marksAdded.length; i++){
                    await addedMarkFetcher(user.marksAdded[i])
                    if(markAddedFetchError) break;
                }
                for(let j=0; j<user.rescued.length; j++){
                    await rescuedMarkFetcher(user.rescued[j])
                    if(rescuedFetchError) break
                }

                // console.log("SIZE: ", animalsAdded.length, animalsRescued.length)
            }catch(e){
                isSuccess = false
                console.log("\n\nError: ", e)
            }

        }else{ msg = task.msg }
    }

    // console.log(isSuccess, "&&", user ? true : false)
    if(isSuccess && user){
        return (<>
            <SimpleTopBar title={user.firstName} />
            <div className={styles.contentContainer}>
            <div className={styles.main}>
                <div>
                    <Divider height="2rem" />
                    <div className={styles.profileContainer}>
                        <div className={styles.personalDetails}>
                            <Image width={100} height={100} alt="" src= {userImg ? userImg : "/placeholder.jpg"} />
                    
                            <div id={styles.nameAndNumber}>
                                <p id={styles.name}>{user.firstName + " " + user.lastName}</p>
                                <span id={styles.contact}>Phone: {user.phone}</span>
                            </div>
                                
                        </div>
                        <div id={styles.karmaPoints}>
                            <span>{user.karma}</span>
                            <p>Karmas</p>
                        </div>

                        <p id={styles.divTitle}>Animals Rescued</p>
                        <div className={styles.animalsRescued}>
                        <div id={styles.animalList}>
                            {
                                rescuedFetchError ? <h4>ERROR</h4> : animalsRescued.length>0 ? animalsRescued.map((it)=>{
                                    return <a href={`/mark/${it.id}`} key={it.id}> 
                                                <div className={styles.markCard} >
                                                    <Image width={100} height={100} alt="" src={it.imgBuf} />
                                                    <div className={styles.titleAndTag}>
                                                    <span id={styles.title}>{it.title}</span>
                                                    <div>
                                                        <span id={styles.subText}> {it.isForAdoption ? "Adopt" : ""} </span>
                                                        <span id={styles.subText}> {it.isInjured ? "Injured" : ""} </span>
                                                    </div>
                                                    </div>
                                                    <Image
                                                        width={100}
                                                        height={100}
                                                        alt=""
                                                        id={styles.backBtn}
                                                        src="/back.png"
                                                    />
                                                </div>
                                            </a>
                                }) : <>{"NONE :("}</>
                            }  
                        </div>
                        </div>
                
                        <br></br>
                        <p id={styles.divTitle}>Animal Added</p>
                        <div className={styles.animalsAddedToMap}>
                        <div id={styles.animalList}>
                        {
                                markAddedFetchError ? <h4>ERROR</h4> : animalsAdded.length > 0 ? animalsAdded.map((it)=>{
                                    return <a href={`/mark/${it.id}`} key={it.id}> 
                                                <div className={styles.markCard}>
                                                    <Image width={100} height={100} alt="" src={it.imgBuf} />
                                                    <div className={styles.titleAndTag}>
                                                    <span id={styles.title}>{it.title}</span>
                                                    <div>
                                                        <span id={styles.subText} style={{color: "pink"}}> {it.isForAdoption ? "Adopt" : ""} </span>
                                                        <span id={styles.subText}> {it.isInjured ? "Injured" : ""} </span>
                                                    </div>
                                                    </div>
                                                    <Image
                                                        width={100}
                                                        height={100}
                                                        alt=""
                                                        id={styles.backBtn}
                                                        src="/back.png"
                                                    />
                                                </div>
                                            </a>
                                }) : <>{"NONE :("}</>
                            }  
                        </div>
                        </div>
                    </div>
                </div>
            </div></div> </>)
    }else{
        return <h2>{msg}</h2>
    }
  
}