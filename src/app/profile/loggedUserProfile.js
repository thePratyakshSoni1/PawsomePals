"use client";
import styles from "./profile.module.css";
import Image from "next/image";
import { SimpleTopBar } from "@/components/simpleToBar";
import { Divider } from "@/components/divider";
import {
  Button,
  ChangeUploadImageButton,
  SingleLineInputField,
  UploadImageButton,
} from "@/components";
import { useEffect, useState } from "react";
import { LoadingDialog } from "@/components/loadingDialog";
import { useRouter } from "next/navigation";
import { User } from "@/utils/firebase";
import Link from "next/link";

export default function LoggedUserProfile({ user }) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [age, setAge] = useState(user.age);
  const [phone, setPhone] = useState(user.phone);
  const [imgBuf, setImgBuf] = useState(user.imgBuf);
  const marksAdded = [...user.marksAdded];
  const rescued = [...user.rescued];
  const [isLoading, setLoading] = useState(true);

  const [isEditingMode, setEditingMode] = useState(false);

  const resetStates = () => {
    setLoading(true);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setAge(user.age);
    setPhone(user.phone);
    setImgBuf(user.imgBuf);
    setLoading(false);
  };
  const router = useRouter()

  return (
    <>
    <SimpleTopBar title={isEditingMode ?  "Edit Profile" : "Profile"} onBackClick={()=>{ isEditingMode ? setEditingMode(false) : router.back() }}/>
    <div className={styles.contentContainer}>
      {isEditingMode ? (
        <EditProfileDialog
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          age={age}
          setAge={setAge}
          phone={phone}
          setPhone={setPhone}
          imgBuf={imgBuf}
          setImgBuf={setImgBuf}
          setEditMode={setEditingMode}
          setLoading={setLoading}
          resetStates={resetStates}
        />
      ) : (
        <UserProfile
          firstName={firstName}
          lastName={lastName}
          phone={phone}
          karma={user.karma}
          marksAdded={marksAdded}
          marksRescued={rescued}
          setLoading={setLoading}
          setEditMode={setEditingMode}
          imgBuf={imgBuf}
        />
      )}
      {isLoading ? <LoadingDialog /> : ""}
    </div>
    </>
  );
}

function EditProfileDialog({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  age,
  setAge,
  phone,
  setPhone,
  imgBuf,
  setImgBuf,
  setEditMode,
  setLoading,
  resetStates,
}) {
  const [isImageUpdated, setImgUpdated] = useState(false);
  const router = useRouter();
  const onUpdate = async () => {
    setLoading(true);
    try {
      if (firstName && firstName.length > 2 && !/[^A-Za-z]/.test(firstName)) {
        if (lastName && lastName.length > 2 && !/[^A-Za-z]/.test(lastName)) {
          if (phone.length == 10 && !/[^0-9]/.test(phone)) {
            if (parseInt(age) && parseInt(age) > 17 && parseInt(age) < 120) {
              if (imgBuf) {
                let bodyPayload = User.UserObject(
                  age,
                  firstName,
                  lastName,
                  phone,
                  [],
                  [],
                  phone + ".png",
                  "",
                  0,
                  []
                );

                let getImgBuffFromBase64 = function (img) {
                  return Buffer.from(img.split("data:type=image/*;base64,")[1], 'base64')
                };

                let imgBuftoSend = typeof imgBuf == "string"
                    ? imgBuf.includes("data:type=image/*;base64,")
                      ? getImgBuffFromBase64(imgBuf)
                      : Buffer.from(imgBuf)
                    : imgBuf;
                let payload = JSON.stringify({
                  ...bodyPayload,
                  isImageUpdated: isImageUpdated,
                  imgBuf: imgBuftoSend,
                });
                let updateReq = await (
                  await fetch("/api/user/add", {
                    method: "PUT",
                    credentials: "include",
                    body: payload,
                  })
                ).json();

                if (updateReq.isSuccess) {
                  alert("Profile Updated Successfully !,\nYou may have to login again only if you have changed your phone number");
                  location.replace("/home");
                } else {
                  alert(updateReq.msg);
                  setLoading(false);
                }
              } else throw new Error("Please add photo for your profile !");
            } else throw new Error("Please add a valid age !");
          } else throw new Error("Please add a valid phone !");
        } else throw new Error("Please add a valid last name!");
      } else throw new Error("Please add a valid first name !");
    } catch (e) {
      alert(e.message);
      setLoading(false);
    }
  };

  return (
      <div className={styles.main}>
        <div>
          <Divider height="2rem" />
          <ChangeUploadImageButton
            buf={imgBuf}
            setBuf={(buf) => {
              setImgBuf(buf);
              setImgUpdated(true);
            }}
            text="Add Profile Photo"
            imageStyles={{
              marginTop: "6px",
              clipPath: "circle()",
              border: "none",
              width: "12rem",
              objectFit: "cover",
              padding: "0px",
            }}
            imgAlwaysVisible={{ visible: true, imgBuf: imgBuf }}
          />
          <SingleLineInputField
            onChange={setFirstName}
            placeholder={"First Name"}
            value={firstName}
            inputStyles={{backgroundColor: "white"}}
          />
          <SingleLineInputField
            onChange={setLastName}
            placeholder={"Last Name"}
            value={lastName}
            inputStyles={{backgroundColor: "white"}}
          />
          <SingleLineInputField
            onChange={setAge}
            placeholder={"Age"}
            value={age}
            type="number"
            inputStyles={{backgroundColor: "white"}}
          />
          <SingleLineInputField
            onChange={setPhone}
            placeholder={"Phone"}
            value={phone}
            type="number"
            inputStyles={{backgroundColor: "white"}}
          />
          <Divider height="22px" />
          <Button
            fillWidth={true}
            onClick={() => {
              onUpdate();
            }}
            text="Update"
            color="orange"
            buttonStyles={{ marginTop: "auto", marginBottom: "6px" }}
          />
          <Button
            fillWidth={true}
            onClick={() => {
              resetStates();
              setImgUpdated(false);
              setEditMode(false);
            }}
            text="Cancel"
            color="red"
            buttonStyles={{
              marginTop: "auto",
              backgroundColor: "transparent",
              border: "solid red",
              color: "red",
              marginBottom: "1.5rem"
            }}
          />
        </div>
      </div>
  );
}

function UserProfile({
  firstName,
  lastName,
  phone,
  imgBuf,
  setEditMode,
  karma,
  marksAdded,
  marksRescued,
  setLoading,
}) {
  const [animalsRescued, setRescued] = useState([]);
  const [animalsAdded, setAnimalsAdded] = useState([]);
  const [fetchErrors, setFetchErrors] = useState({
    rescued: false,
    added: false,
  });

  let rescuedMarkFetcher = async (markId) => {
    var mark = await (
      await fetch(`/api/marks/${markId}`, {
        credentials: "include",
        method: "GET",
      })
    ).json();
    if (mark.isSuccess) {
      let animalImg = await (
        await fetch("/api/images", {
          method: "POST",
          body: JSON.stringify({ name: mark.mark.image, fromProfile: false }),
          credentials: "include",
        })
      ).json();
      if (animalImg.isSuccess) {
        return {
          ...mark.mark, id: markId,
          imgBuf: `data:type=image/*;base64,${Buffer.from(
            animalImg.imgBuf.data
          ).toString("base64")}`,
        };
      } else return { ...mark.mark, imgBuf: `/placeholder.jpg`, id: markId };
    } else throw new Error("ERROR");
  };

  let addedMarkFetcher = async (markId) => {
    var mark = await (
      await fetch(`/api/marks/${markId}`, {
        credentials: "include",
        method: "GET",
      })
    ).json();
    if (mark.isSuccess) {
      let animalImg = await (
        await fetch("/api/images", {
          method: "POST",
          body: JSON.stringify({ name: mark.mark.image, fromProfile: false }),
          credentials: "include",
        })
      ).json();
      if (animalImg.isSuccess) {
        return {
          ...mark.mark, id: markId,
          imgBuf: `data:type=image/*;base64,${Buffer.from(
            animalImg.imgBuf.data
          ).toString("base64")}`,
        };
      } else return { ...mark.mark, imgBuf: `/placeholder.jpg`, id: markId };
    } else throw new Error("ERROR");
  };

  const onFetch = async () => {
    try {
      setLoading(true);
      setAnimalsAdded([]);
      setRescued([]);
      // console.log("Going for: ", marksRescued, marksAdded)

      let added = [];
      for (let i = 0; i < marksAdded.length; i++) {
        try {
          added.push(await addedMarkFetcher(marksAdded[i]));
        } catch (e) {
          console.log(e)
          setFetchErrors({ added: true, rescued: fetchErrors.rescued });
        }
        if (fetchErrors.added) break;
      }
      setAnimalsAdded(added);

      let rescued = [];
      for (let j = 0; j < marksRescued.length; j++) {
        try {
          rescued.push(await rescuedMarkFetcher(marksRescued[j]));
        } catch (e) {
          console.log(e)
          setFetchErrors({ rescued: true, added: fetchErrors.added });
        }
        if (fetchErrors.rescued) break;
      }
      setRescued(rescued);
      setLoading(false);

    } catch (e) {
      setLoading(false);
      console.log("\n\nError: ", e);
    }

  };

  useEffect(() => {
    onFetch();
  }, []);

  return (
    <div className={styles.main}>
        <div>
        <Divider height="2rem" />
        <div className={styles.profileContainer}>
          <div className={styles.personalDetails}>
            <Image
              width={100}
              height={100}
              alt=""
              src={imgBuf ? imgBuf : "/placeholder.jpg"}
            />

            <div id={styles.nameAndNumber}>
              <p id={styles.name}>{firstName + " " + lastName}</p>
              <span id={styles.contact}>Phone: {phone}</span>
            </div>
            
            <Button
              text={"edit"}
              onClick={() => {
                setEditMode(true);
              }}
              color="#343434"
              buttonStyles={{marginLeft: "auto"}}
            />
          </div>
            
          <div id={styles.karmaPoints}>
            <span>{karma}</span>
            <p>Karmas</p>  
          </div>
          
          <p id={styles.divTitle}>Animals Rescued</p>
          <div className={styles.animalsRescued}>
            <div id={styles.animalList}>
              {fetchErrors.rescued == true ? (
                <h4>ERROR</h4>
              ) : animalsRescued.length > 0 ? (
                animalsRescued.map((it) => {
                  return (
                    
                    <a href={`/mark/${it.id}`} key={it.id}>
                      <div className={styles.markCard} >
                        <Image width={100} height={100} alt="" src={it.imgBuf} />
                        <div className={styles.titleAndTag}>
                          <span id={styles.title}>{it.title}</span>
                          <div>
                            <span id={styles.subText}>
                              {" "}
                              {it.isForAdoption ? "Adopt" : ""}{" "}
                            </span>
                            <span id={styles.subText}>
                              {" "}
                              {it.isInjured ? "Injured" : ""}{" "}
                            </span>
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
                  );
                })
              ) : (
                <>{"NONE :("}</>
              )}
            </div>
          </div>

          <br></br>
          <p id={styles.divTitle}>Animal Added</p>
          <div className={styles.animalsAddedToMap}>
            <div id={styles.animalList}>
              {fetchErrors.added == true ? (
                <h4>ERROR</h4>
              ) : animalsAdded.length > 0 ? (
                animalsAdded.map((it) => {
                  return (
                    <a href={`/mark/${it.id}`} key={it.id}>
                      <div className={styles.markCard}>
                        <Image width={100} height={100} alt="" src={it.imgBuf} />
                        <div className={styles.titleAndTag}>
                          <span id={styles.title}>{it.title}</span>
                          <div>
                            <span id={styles.subText} style={{ color: "pink" }}>
                              {" "}
                              {it.isForAdoption ? "Adopt" : ""}{" "}
                            </span>
                            <span id={styles.subText}>
                              {" "}
                              {it.isInjured ? "Injured" : ""}{" "}
                            </span>
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
                  );
                })
              ) : (
                <>{"NONE :("}</>
              )}
            </div>
          </div>
        </div>
          <br></br>
          <br></br>
          <Button text={"logout"} color="transparent" textColor="red" fillWidth={true} buttonStyles={{marginTop: "1rem", border: "solid 2px red"}} onClick={()=>{
            fetch("/api/login", {method: "DELETE", credentials: "include"}).then(it=>{location.replace("/login")})
          }}/>
        </div>
          <br></br>
    </div>
  );
}
