import { SimpleTopBar } from "@/components/simpleToBar";
import { DataBase } from "@/utils/firebase";
import styles from "./page.module.css";
import Image from "next/image";
import { Button } from "@/components/button";
import Link from "next/link";
import { MapDisplay } from "./mapSetup";


export default async function MarkDetails({ params }) {
  const MarkOps = DataBase.Mark();
  var markDetails = await MarkOps.getMark(params.id);
  // var markDetails = (await MarkOps.getMark(params.id)).mark
  if (markDetails.isSuccess) {
    markDetails = markDetails.mark;
    const markImgBuf = await DataBase.getImage(
      MarkOps.fbStorage,
      markDetails.image
    );
    const rescuedImgBuf = markDetails.isRescued ? await DataBase.getImage(
          MarkOps.fbStorage,
          markDetails.rescuedImg
        )
      : { isSuccess: false };
    // if (markImgBuf.isSuccess && rescuedImgBuf.isSuccess) {

    

    if (markImgBuf.isSuccess && true) {
      return (
        <>
        
          

          <SimpleTopBar title={markDetails.title.substring(0, 15) + "..."} />
          <div className={styles.main}>
            <div>
              <Image alt=""
                id={styles.animalImg}
                src={
                  "data:type=image/*;base64," + Buffer.from(markImgBuf.buf).toString("base64")
                }
                height={100}
                width={100}
              />
              <span id={styles.title}>{markDetails.title}</span>

              <div className={styles.tagContainer}>
              {markDetails.isInjured ? <span style={{backgroundColor: "red"}} id={styles.tag}>Injured</span> : "" }
              {markDetails.isForAdoption ? <span style={{backgroundColor: "purple"}} id={styles.tag}>Adopt</span> : "" } 
              </div>

              <div className={styles.tagContainer}>
                <span id={styles.subDetails}>Age: {markDetails.age} approx</span>
                <span id={styles.subDetails}>Breed: {markDetails.breed}</span>
              </div>

              <span id={styles.description}>{markDetails.description}</span>

              <MapDisplay location={markDetails.location}/>

              <br></br>

              {markDetails.isRescued ? (
                <div className={styles.rescueContainer}>
                  <div style={{display: "flex", flexDirection: "row", columnGap: "6px", alignItems: "center"}}>
                    <Image src={"/ic_check.png"} width={60} height={60} alt=""/>
                    <span>Successfully Rescued by {markDetails.saviourName}</span>
                  </div>
                  <Image alt=""
                    id={styles.animalImg}
                    src={
                      "data:type=image/*;base64," +
                      Buffer.from(rescuedImgBuf.buf).toString("base64")
                    }
                    height={100}
                    width={100}
                    style={{marginTop: "0.5rem"}}
                  />
                  <Link href={`/profile/${markDetails.rescuedBy}`}>
                    <Button text={"View Saviour's Profile"} fillWidth={true}/>
                  </Link>
                </div>
              ) : <>
                <br></br>
                <br></br>
                <Link href={`/mark/${params.id}/rescue`} style={{marginTop: "auto", width: "100%"}}>
                  <Button text={"RESCUE"} fillWidth={true}/>
                </Link>
                </>
              }
              <br></br>
            </div>
          </div>
        </>
      );
    }else{
      return <>Something Went Wrong</>
    }
  }else{
    return <>{markDetails.msg}</>;
  }
}
