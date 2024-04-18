import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import styles from "./components.module.css";
import Image from "next/image";
export function OsmMap({
  markers = [],
  mapWidth = "100%",
  mapHeight = "100%",
  initPosition = [0, 0],
  initZoom = 2,
  setMap,
  map,
  setMapInitState,
  mapInitState,
  mapCss = {},
  mapId,
  isRevisit = false
}) {
  useEffect(() => {

    // setTimeout(()=>{initMap()}, 1000)
    // console.log(
    //   "GOT: ",
    //   "\n=> ",
    //   markers,
    //   "\n=> ",
    //   mapWidth,
    //   "\n=> ",
    //   mapHeight,
    //   "\n=> ",
    //   initPosition,
    //   "\n=> ",
    //   initZoom
    // );
  }, []);

  useEffect(() => {
    if (mapInitState && map) {
      console.log("MAP INITED");
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      map.setView(initPosition, initZoom);
      try{
        document.getElementsByClassName("leaflet-control-attribution")[0].remove()
      }catch(e){}
      
      console.log("Setting View to: ", initPosition)
      
    } else if (mapInitState) {
      console.log("ERROR")
      console.log("ERROR")
      setMapInitState(false)
      initMap()
    }
  }, [mapInitState, map]);

  var initMap = () => {
    console.log("Script Loaded!");
    console.log(markers.length);

    var theMap = L.map(mapId, { zoomControl: false });
    setMap(theMap)
    setMapInitState(true);
  };

  return (
    <>
      <div
        id={mapId}
        style={{ width: mapWidth, height: mapHeight, ...mapCss }}
      ></div>

        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin="anonymous"
        />

        <Script
          src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
          integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
          crossOrigin="anonymous"
          onReady={()=>{ setTimeout(()=>{initMap()}, 100) }}
        />
      
    </>
  );
}

export function Divider({ height = "5px", width = "5px" }) {
  return (
    <div
      className={styles.divider}
      style={{ height: height, width: width }}
    ></div>
  );
}

export function PlaceHolder({ height, width, bgColor = "white", styles }) {
  return (
    <div
      style={{
        height: height,
        width: width,
        backgroundColor: bgColor,
        ...styles,
      }}
    ></div>
  );
}

export function IconButton({
  iconLink,
  width,
  height,
  imgStyle,
  bgColor,
  onBtnClick,
}) {
  return (
    <Image
      className={styles.imgButton}
      style={{
        width: width,
        height: height,
        backgroundColor: bgColor,
        ...imgStyle,
      }}
      src={iconLink}
      width={100}
      height={100}
      alt=""
      onClick={onBtnClick}
    />
  );
}

export function TopPlayerCard({ name, karmaPoints, rank, style, imgSrc }) {
  return (
    <div className={styles.topPlayerCard} style={{ ...style }}>
      <span id={styles.rank}>{rank}</span>
      <Image src={imgSrc} alt="" height={60} width={60} style={{width: "3rem", marginLeft: "0.5rem", clipPath: 'circle()', objectFit: "cover"}}/>
      <span id={styles.name}>{name}</span>
      <span id={styles.points}>{karmaPoints}</span>
    </div>
  );
}

export function SimpleTopBar({ title, zIndex = 10, onBackClick }) {
  return (
    <div
      className={styles.topBar}
      style={{ zIndex: zIndex, height: "fit-content" }}
    >
      <Image
        src={"/back.png"}
        width={100}
        height={100}
        alt=""
        style={{ width: "22px", height: "22px", padding: "10px 10px" }}
        onClick={onBackClick}
      />
      <Divider width="18px" />
      {title}
    </div>
  );
}

export function MultiLineInputField({
  value,
  onChange,
  placeholder,
  inputStyles = {},
}) {
  return (
    <textarea
      className={styles.singleLineInputField}
      style={{ height: "20rem", borderRadius: "32px", ...inputStyles }}
      placeholder={placeholder}
      value =  {value}
      onChange={(ev) => onChange(ev.target.value)}
    />
  );
}

export function SingleLineInputField({
  value,
  onChange,
  placeholder,
  inputStyles = {},
  type = "text",
}) {
  return (
    <input
      type={type}
      className={styles.singleLineInputField}
      style={{ ...inputStyles }}
      value={value}
      placeholder={placeholder}
      onChange={(ev) => onChange(ev.target.value)}
    />
  );
}

export function CheckBox({ text, isChecked, onChange, chekcBoxStyle = {}, color="black"}) {
  return (
    <div style={{ display: "inline-block", width: "fit-content" }}>
      <span className={styles.checkBoxContainer} style={{ color: color, ...chekcBoxStyle }} >
        {text}
        <span
          id={styles.checkbox}
          style={{borderColor: color }}
          onClick={() => onChange(!isChecked)}
        >
          <Image
            onClick={() => {
              onChange(!isChecked);
            }}
            style={{ visibility: isChecked ? "visible" : "hidden"}}
            src={"/ic_check.png"}
            width={100}
            height={100}
          />
        </span>
      </span>
    </div>
  );
}

export function ChooseLocationDialog({
  mapId,
  map,
  setMap,
  mapInited,
  setMapInitState,
  zIndex,
  isVisible,
  location,
  setLocation,
  onConfirm,
}) {

  useEffect(()=>{
    document.currentChoosedMarker = undefined
  }, [])

  let onFetchMyLocation = async ()=>{

    let permit = await navigator.permissions.query({ name: "geolocation" })
    let shouldAsk = false
    switch(permit.state){
      case 'denied':
        alert("You have denied to our site's permission to fetch your location, Please allow from browser settings to continue use this feature")
        break;
      case 'granted':
        shouldAsk = true
        break;
      case 'prompt':
        shouldAsk = true
        break;
    }

    if(shouldAsk && map && mapInited){
      navigator.geolocation.getCurrentPosition(
        (it)=>{
          map.flyTo([it.coords.latitude, it.coords.longitude], 12)
        },
        (it)=>{
          alert("Unable to fetch your location ", it.message)  
        },
        {enableHighAccuracy: true}
      )
    }
  }

  useEffect(()=>{
    if(isVisible && mapInited && map){
      console.log("MAP IS CHANGED")
      map.on('click', (ev)=>{
        var pinIcon = L.icon({
              iconUrl: '/ic_custom_mark.png',

              iconSize:     [40, 50], // size of the icon
              shadowSize:   [50, 64], // size of the shadow
              iconAnchor:   [20, 50], // point of the icon which will correspond to marker's location
              shadowAnchor: [4, 62],  // the same for the shadow
              popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
          });

        console.log("Map Clicked")
        if(document.currentChoosedMarker){
          console.log("MK: ", document.currentChoosedMarker)
          document.currentChoosedMarker.remove()
        }
        document.currentChoosedMarker = L.marker(ev.latlng, {icon: pinIcon}).addTo(map)
        setLocation({lat: ev.latlng.lat, lng: ev.latlng.lng})
      })
    }
  }, [map, mapInited])

  // useEffect(()=>{
  //   if(map && mapInited){
      
  //   }
  // }, [mapInited])

  return (
    isVisible ? <div
      className={styles.chooseLocation}
      style={{ zIndex: zIndex}}
    >
      <div id={styles.choseLocDialogContainer}>
        <h3>Choose Location</h3>
        <p>Tap on map to select the location</p>
        <OsmMap
          markers={[location]}
          mapWidth={"100%"}
          mapHeight={"100%"}
          initPosition={[location.lat, location.lng]}
          initZoom={2}
          setMap={setMap}
          map={map}
          setMapInitState={setMapInitState}
          mapInitState={mapInited}
          mapCss={{}}
          mapId={mapId}
          isRevisit = {isVisible && mapInited && (map==undefined)}
        />

        <IconButton
          iconLink={"/myLocation.png"}
          imgStyle={{
            position: "absolute",
            right: "1.5rem",
            bottom: "14vh",
            zIndex: "400"
          }}
          bgColor={"rgb(15, 15, 15)"}
          onBtnClick={onFetchMyLocation} 
        />

        <Button text={"Confirm Location"} onClick={()=>{
          delete document.currentChoosedMarker
          onConfirm()
        }} color="green"/>
      </div>
    </div> : <></>
  );
}

export function Button({
  text,
  textColor = "white",
  onClick,
  color = "black",
  buttonStyles = {},
  cornerRadius = "100px",
  fillWidth=false,
  fillHeight=false
}) {
  return (
    <button
      className={`${fillWidth ? styles.widthFill : ""} ${fillHeight ? styles.heightFill : ""}`} 
      style={{
        color: textColor,
        margin: "2px",
        backgroundColor: color,
        borderStyle: "none",
        borderRadius: cornerRadius,
        padding: "14px 18px",
        fontWeight: "bold",
        ...buttonStyles,
      }}
      onClick={onClick}
    >
      {text}
    </button>
  );
}

export function ChangeUploadImageButton({text="Add Image", setBuf, buf, imgWidth = "100%", imageStyles={}}){
  const inputButtonRf = useRef()
  const [isFirstImg, setFirstImg] = useState(typeof buf == 'string' ? buf : "/placehold")
  const onChangeImg = (event)=>{
      let imgFormData = new FormData()
      const selectedImg = event.target.files === null ? undefined : event.target.files[0]
      if (selectedImg) {
        selectedImg.target
          selectedImg?.arrayBuffer().then(it => {
              let imgBuf = Buffer.from(it)
              console.log(selectedImg)
              // let sreader = selectedImg?.stream().getReader()
              // onImageMsg(
              //     imgBuf,
              //     "Sending image: " + selectedImg.name,
              //     selectedImg.name
              // )
              setBuf(imgBuf)
          })


      }
  }
  return <div className={styles.uploadImageOption} style={{width: imgWidth, margin: "0px",alignItems: buf ? "center" : "start"}}>
    {
      buf ? <img src={ typeof buf == 'string' ? isFirstImg : `data:type=image/*;base64,${buf.toString('base64')}`} style={{marginTop: "6px", ...imageStyles}}/>
      : <></>  
    }
    <input ref={inputButtonRf} type="file" accept="image/*" onChange={onChangeImg} style={{display: "none"}}/>
    <Button text={ buf ? "Change Image" : text } onClick={()=>{inputButtonRf.current.click()}}/>
  </div>
}

export function UploadImageButton({text="Add Image", setBuf, buf, imgWidth = "100%", imageStyles={}, fillWidth=true, fillHeight=false, fillComponentWidth=false, fillCompoenentHeight=false, imgAlwaysVisible= {visible: false, imgBuf: ""}}){
  const inputButtonRf = useRef()
  const onChangeImg = (event)=>{
      let imgFormData = new FormData()
      const selectedImg = event.target.files === null ? undefined : event.target.files[0]
      if (selectedImg) {
        selectedImg.target
          selectedImg?.arrayBuffer().then(it => {
              let imgBuf = Buffer.from(it)
              console.log(selectedImg)
              // let sreader = selectedImg?.stream().getReader()
              // onImageMsg(
              //     imgBuf,
              //     "Sending image: " + selectedImg.name,
              //     selectedImg.name
              // )
              setBuf(imgBuf)
          })


      }
  }
  return <div className={`${styles.uploadImageOption} ${fillComponentWidth ? styles.widthFill : ""} ${fillCompoenentHeight ? styles.heightFill : ""}`} style={{width: `${ fillComponentWidth ? "" : imgWidth}`, margin: "0px",alignItems: buf ? "center" : "start"}}>
    {
      buf ? <img className={`${fillWidth ? styles.widthFill : ""} ${fillHeight ? styles.heightFill : ""}`} src={`data:type=image/*;base64,${buf.toString('base64')}`} style={{marginTop: "6px", objectFit: "cover", ...imageStyles}}/>
      : <></>  
    }
    {
      !buf && imgAlwaysVisible.visible ? <img className={`${fillWidth ? styles.widthFill : ""} ${fillHeight ? styles.heightFill : ""}`} src={imgAlwaysVisible.imgBuf} style={{marginTop: "6px", objectFit: "cover", ...imageStyles}}/>
      : <></>  
    }
    <input ref={inputButtonRf} type="file" accept="image/*" onChange={onChangeImg} style={{display: "none"}}/>
    <Button text={ buf ? "Change Image" : text } onClick={()=>{inputButtonRf.current.click()}}/>
  </div>
}

