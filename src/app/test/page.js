"use client"
import { useEffect, useState } from "react";

import {
    Button,
    CheckBox,
    ChooseLocationDialog,
    Divider,
    IconButton,
    MultiLineInputField,
    OsmMap,
    PlaceHolder,
    SimpleTopBar,
    SingleLineInputField,
    UploadImageButton,
  } from "@/components";

import Image from "next/image";
import styles from "../home/home.module.css"


export default function TheTest(){
    return <Button onClick={()=>{
      fetch("/api/test", {
        method: "GET",
        credentials: "include",
        headers: {
          "MyRandomHeader": "USELESS_vaLUE  is present Here",
          "sendRandom": "true"
        }
      }).then(it=>{it.json().then(i=>console.log(i))})
    }} text={"Send"} />
}


function AddanimalSheet({ setSheetVisibe=true, onAdd }) {
  
    return (
      <>
        <SimpleTopBar
          title={"My Profile"}
          zIndex={11}
          onBackClick={() => {
          }}
        />
        <div className={styles.addAnimalSheet}>
          <div>
            <Divider height="2rem" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Image
                id={styles.addAnimalSheetImg}
                src={`/tiger.jpg`}
                width={100}
                height={100}
                alt=""
              />
              <Divider height="12px" width="18px" />
              <SingleLineInputField
                value={""}
                onChange={()=>{}}
                placeholder="Mark Title"
              />
              <SingleLineInputField
                value={""}
                onChange={()=>{}}
                placeholder="Breed (Optional)"
              />
              <SingleLineInputField
                value={""}
                onChange={()=>{}}
                placeholder="Age (approx)"
                type="number"
              />
              <Divider height="4px" width="18px" />
              <div style={{ width: "100%" }}>
                <CheckBox
                  text="Is Injured"
                  isChecked={true}
                  onChange={()=>{}}
                />
                <CheckBox
                  text="Can be Adopted"
                  isChecked={false}
                  onChange={()=>{}}
                />
              </div>
              <Divider height="4px" width="18px" />
              <MultiLineInputField
                value={""}
                onChange={()=>{}}
                placeholder={"Describe more about the Pal"}
              />
            </div>
            <Divider height="12px" width="0px" />
            {/* <OsmMap
              markers={[]}
              mapWidth={"100%"}
              mapHeight={"14rem"}
              setMap={setAnimalMap}
              map={animalMap}
              setMapInitState={setMapInited}
              mapInitState={isMapInited}
              mapCss={{ borderRadius: "18px" }}
              mapId={"addAnimalSheetMap"}
            /> */}
            <PlaceHolder height={"14rem"} width={"100%"} bgColor="#ffc76061" styles={{ borderRadius: "18px" }} />
            <Divider height="12px" width="0px" />
            <Button
              onClick={() => {
              }}
              text="Choose Location"
              color="#ff9a02"
            />
            <UploadImageButton imgWidth="-webkit-fill-available" setBuf={()=>{}} buf={""}/>
            <Divider height="22px" />
                
            <Button text={"Add To Map"} onClick={()=>{()=>{}}} buttonStyles={{width: "-webkit-fill-available", backgroundColor: "#00ff4e", boxShadow: "2px 2px 5px 0px #000000eb"}}/>
          </div>
        </div>
  
      </>
    );
  }
  