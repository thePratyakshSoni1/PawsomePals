"use client";
import styles from "./home.module.css";
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
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mark } from "@/utils/firebase";
import { LoadingDialog } from "@/components/loadingDialog";

export const fetchCache = "force-no-store";
export function HomePage({mapMarkers, hasNewNotifications}) {
  var [allMarkers, setAllMarkers] = useState([]);
  var [markersToShow, setMarkersToShow] = useState([]);
  var [map, setMap] = useState();
  var [mapInited, setInit] = useState(false);
  var [currentUserId, setCurrentUserID] = useState()
  var [currentUserrImage, setCurrentUserrImage] = useState()
  var [isFirstMapLoad, setFirstMapLoad] = useState(true)

  var [currentFilter, setCurrentFilter] = useState({allMarks: true, injured: false, adopt: false})
  var [showFilterDialog, setFilterDialogVisible] = useState(false)

  var [isLoadingState, setLoading] = useState(false)

  var mRouter = useRouter();

  var [isAddSheetVisible, setSheetVisibe] = useState(false);
  var [isRefreshed, setRefreshed] = useState(false)

  const onRefreshMarks = ()=>{
    
    setLoading(true)
    fetch("/api/marks", {
      credentials: "include",
      method: "GET"
    }).then(it=>it.json().then(marks=>{
      if(marks.isSuccess){
        setRefreshed(true)
        setAllMarkers(marks.markers)
      }else{
        alert("Something went wrong, ", marks.msg)
      }
      setLoading(false)
    }))

  }

  const updateMarkersToShow = (newMarks)=>{
    
    console.log("Markers Update call")
    markersToShow.forEach(it=>{
      map._layers[it.layer_id].remove()
      console.log("removing: ", it.id)
    })

    let updatedMarks = []
    var pinIcon = L.icon({
          iconUrl: '/ic_custom_mark.png',

          iconSize:     [40, 50], // size of the icon
          shadowSize:   [50, 64], // size of the shadow
          iconAnchor:   [20, 50], // point of the icon which will correspond to marker's location
          shadowAnchor: [4, 62],  // the same for the shadow
          popupAnchor:  [1, -48] // point from which the popup should open relative to the iconAnchor
      });
    newMarks.forEach((it, indx) => {
        console.log("MM: ", it)
        var m = L.marker(it.location, {icon: pinIcon})
                .addTo(map)
                .bindPopup(PopUp(it.imgBuf, it.title, it.isForAdoption, it.isInjured, it.id))

        updatedMarks.push({...m, layer_id: m._leaflet_id})
        console.log("adding: ", m._leaflet_id)
    });

    setMarkersToShow(updatedMarks)
  }

  useEffect(()=>{
    if(isRefreshed){
      if(map && mapInited){
        console.log("Setting filter")
        if(currentFilter.allMarks){
          updateMarkersToShow(allMarkers)
        }else if(currentFilter.injured){
          let injuredMarks = []
          allMarkers.forEach(it=>{
            if(it.isInjured){
              injuredMarks.push(it)
            }
          })
          updateMarkersToShow(injuredMarks)
        }else if(currentFilter.adopt){
          let adoptMarks = []
          allMarkers.forEach(it=>{
            if(it.isForAdoption){
              adoptMarks.push(it)
            }
          })
          updateMarkersToShow(adoptMarks)
        }
      }else if(!isFirstMapLoad){
        alert("Something went wrong try refreshing the page")
      }
      console.log("Refreshing...")
    }else{
      console.log("NOT REFRESHED")
    }
  }, [allMarkers])

  useEffect(()=>{
    if(!isAddSheetVisible && map && mapInited){
      console.log("Going to refresh...")
      onRefreshMarks()
    }
  }, [isAddSheetVisible])

  useEffect(()=>{
    fetch("/api/login", { 
      method: "GET",
      credentials: "include",
      headers: {
        "image_buf_config": "true"
      }
    }).then(it=>it.json().then(resp=>{
      if(resp.isSuccess){
        if(resp.imgBuf){
          console.log("imgBuf: ", Buffer.from(resp.imgBuf))
          setCurrentUserrImage(`data:type=image/*;base64,${Buffer.from(resp.imgBuf).toString('base64')}`)
          setCurrentUserID(resp.userId)
        }else{
          setCurrentUserrImage(`/placeholder.jpg`)
          setCurrentUserID(resp.userId)
        }
        console.log("Set: ", resp.userId)
      }
    }))
    setAllMarkers(mapMarkers)
  }, [])

  useEffect(() => {
    if (mapInited && map) {
      console.log("First Init")
      updateMarkersToShow(allMarkers)

      if(isFirstMapLoad){
        setFirstMapLoad(false)
        navigator.geolocation.getCurrentPosition(
          (it)=>{
             if(map && mapInited){
               map.flyTo([it.coords.latitude, it.coords.longitude], 5)
             }
          },
          (it)=>{
            console.log("Unable to fetch your location, ", it.message)  
          }
        )
      }
    }
  }, [map, mapInited]);

  useEffect(()=>{
    console.log("FILTER CHANGE RESET")
      if(map && mapInited){
        console.log("Setting filter")
        if(currentFilter.allMarks){
          updateMarkersToShow(allMarkers)
        }else if(currentFilter.injured){
          let injuredMarks = []
          allMarkers.forEach(it=>{
            if(it.isInjured){
              injuredMarks.push(it)
            }
          })
          updateMarkersToShow(injuredMarks)
        }else if(currentFilter.adopt){
          let adoptMarks = []
          allMarkers.forEach(it=>{
            if(it.isForAdoption){
              adoptMarks.push(it)
            }
          })
          updateMarkersToShow(adoptMarks)
        }
      }else if(!isFirstMapLoad){
        alert("Something went wrong try refreshing the page")
      }
  }, [currentFilter])

  return (
    <div className={styles.main}>
      <OsmMap
        setMap={setMap}
        marker={allMarkers}
        initPosition={[20, 20]}
        initZoom={2}
        mapHeight={"100vh"}
        mapWidth={"100vw"}
        map={map}
        mapCss={{ zIndex: "0" }}
        setMapInitState={setInit}
        mapInitState={mapInited}
        isFromHomeScreen={true}
        mapId={"homeScreenMainMap"}
      />

      {isAddSheetVisible ? (
        <AddanimalSheet setSheetVisibe={setSheetVisibe} setLoading={setLoading}/>
      ) : (
        <IconButton
          iconLink={"/add.png"}
          imgStyle={{
            position: "absolute",
            right: "1.25rem",
            bottom: "5vh",
          }}
          bgColor={"rgb(15, 15, 15)"}
          onBtnClick={() => {
            setSheetVisibe(true);
          }}
        />
      )}

      <IconButton
        iconLink={ showFilterDialog ? "/ic_check_white.png" : "/filter.png"}
        imgStyle={{
          position: "absolute",
          right: "1.25rem",
          bottom: "13.5vh",
          zIndex: "1",
          clipPath: `${showFilterDialog ? "none" : "circle()"}`,
          borderRadius: `${showFilterDialog ? "12px 0px 22px" : "0px"}`
        }}
        onBtnClick={()=>{setFilterDialogVisible(!showFilterDialog)}}
        bgColor={ showFilterDialog ? "rgb(42, 42, 42)" : "rgb(15, 15, 15)"}
      />

      <IconButton
        iconLink={"/myLocation.png"}
        imgStyle={{
          position: "absolute",
          right: "1.25rem",
          bottom: "22vh",
        }}
        bgColor={"rgb(15, 15, 15)"}
        onBtnClick={()=>{

          navigator.permissions.query({ name: "geolocation" }).then(permit=>{
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

              if(shouldAsk){
                navigator.geolocation.getCurrentPosition(
                  (it)=>{
                    if(map && mapInited){
                      map.flyTo([it.coords.latitude, it.coords.longitude], 12)
                    }
                  },
                  (it)=>{
                    alert("Unable to fetch your location ", it.message)  
                  }
                )
              }
          })
          
        }}
      />

      <LeadboardButton router={mRouter} />
      <NotificationButton hasNewNotifs={hasNewNotifications} />
      {showFilterDialog ? <FilterDialog currentFilter={currentFilter} setFilter={setCurrentFilter}/> : ""}
      {(currentUserId) ? <ProfileButton imgBuf={currentUserrImage}/> : <></>} 
      {isLoadingState ? <LoadingDialog zIndex="11"/> : ""}
    </div>
  );
}


function AddanimalSheet({ setSheetVisibe, onAdd, setLoading }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [breed, setBreed] = useState("");
  const [isInjured, setInjured] = useState(false);
  const [age, setAge] = useState();
  const [isForAdption, setAdoption] = useState(false);
  const [animalImgBuf, setAnimalImgBuf] = useState()

  const [location, setLoc] = useState({ lat: 0, lng: 0 });
  const [animalMap, setAnimalMap] = useState();
  const [isMapInited, setMapInited] = useState(false);
  const [isChooseLocMode, setChooseLocMode] = useState(false);

  const [choseLocMap, setChoseLocMap] = useState()
  const [choseLocMapInited, setChoseLocMapInitState] = useState()

  useEffect(()=>{
    if(document.animalMapCurrMark){
      document.animalMapCurrMark.remove()
    }
    if(isMapInited){
        var pinIcon = L.icon({
          iconUrl: '/ic_custom_mark.png',

          iconSize:     [40, 50], // size of the icon
          shadowSize:   [50, 64], // size of the shadow
          iconAnchor:   [20, 50], // point of the icon which will correspond to marker's location
          shadowAnchor: [4, 62],  // the same for the shadow
          popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
      });

      document.animalMapCurrMark = L.marker([location.lat, location.lng], {icon: pinIcon}).addTo(animalMap)
      animalMap.flyTo([location.lat, location.lng], 5)
    }
  }, [location])

  const onAddMark = ()=>{
    setLoading(true)
    if(title.length > 5){
      if(description.length > 20){
        if((location.lat != 0 && location.lng != 0) && document.animalMapCurrMark && isMapInited){
          if(isForAdption || isInjured){
            if(animalImgBuf){
              
              let markToAdd = Mark.MarkObject(
                title,
                description,
                undefined,
                breed ? breed : "Don't know",
                age ? age : "Don't Know",
                isForAdption,
                isInjured,
                undefined,
                location,
                undefined,
                undefined,
                undefined,
                undefined,
                []
              )
              let payloadObj = {...markToAdd, imgBuf: animalImgBuf}
              let payload = JSON.stringify(payloadObj)
              fetch("/api/marks/add", {
                method: "POST",
                credentials: "include",
                body: payload
              }).then(it=>{
                  it.json().then(resp=>{
                      if(resp.isSuccess){
                        setSheetVisibe(false)
                        alert("Mark Added Successfully")
                        setLoading(false)
                      }else{
                        alert("ERROR: ", resp.msg)
                        setLoading(false)
                      }
                  })
              })

            }else alert("Plase add an image of that Pal (animal)")
          }else alert("Please select at least one option between, 'For Adoption' or 'Is Injured'") 
        }else alert("Please choose a location by clicking \"Choose location\" button")
      } else alert("Add a Valid suitable description") 
    } else alert("Add a Valid suitable title")

    setLoading(false)
  }

  return (
    <>
      <SimpleTopBar
        title={"Add a Pal"}
        zIndex={11}
        onBackClick={() => {
          setSheetVisibe(false);
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
            {animalImgBuf ? <Image
              id={styles.addAnimalSheetImg}
              src={`data:image/*;base64,${animalImgBuf.toString('base64')}`}
              width={100}
              height={100}
              alt=""
            /> : <></>}
            <Divider height="12px" width="18px" />
            <SingleLineInputField
              value={title}
              onChange={setTitle}
              placeholder="Mark Title"
            />
            <SingleLineInputField
              value={breed}
              onChange={setBreed}
              placeholder="Breed (Optional)"
            />
            <SingleLineInputField
              value={age}
              onChange={setAge}
              placeholder="Age (approx)"
              type="number"
            />
            <Divider height="4px" width="18px" />
            <div style={{ width: "100%" }}>
              <CheckBox
                text="Is Injured"
                isChecked={isInjured}
                onChange={setInjured}
              />
              <CheckBox
                text="Can be Adopted"
                isChecked={isForAdption}
                onChange={setAdoption}
              />
            </div>
            <Divider height="4px" width="18px" />
            <MultiLineInputField
              value={description}
              onChange={setDescription}
              placeholder={"Describe more about the Pal"}
            />
          </div>
          <Divider height="12px" width="0px" />
          <OsmMap
            markers={[]}
            mapWidth={"100%"}
            mapHeight={"14rem"}
            setMap={setAnimalMap}
            map={animalMap}
            setMapInitState={setMapInited}
            mapInitState={isMapInited}
            mapCss={{ borderRadius: "18px" }}
            mapId={"addAnimalSheetMap"}
          />
          <Divider height="12px" width="0px" />
          <Button
            onClick={() => {
              setChooseLocMode(true);
            }}
            text="Choose Location"
            color="#ff9a02"
          />
          <UploadImageButton fillComponentWidth={true} setBuf={setAnimalImgBuf} buf={animalImgBuf}/>
          <Divider height="22px" />
              
          <Button fillWidth={true} text={"Add To Map"} onClick={()=>{onAddMark()}} buttonStyles={{backgroundColor: "#00ff4e", boxShadow: "2px 2px 5px 0px #000000eb"}}/>
          <br></br>
        </div>
      </div>
      <ChooseLocationDialog
        map={choseLocMap}
        setMap={setChoseLocMap}
        mapInited={choseLocMapInited}
        setMapInitState={setChoseLocMapInitState}
        mapId={"homeScrChoseDialog"}
        zIndex={12}
        isVisible={isChooseLocMode}
        location={location}
        setLocation={setLoc}
        setVisibility={setChooseLocMode}
        onConfirm={() => { 
          setChooseLocMode(false)
        }}
      />

    </>
  );
}

function PopUp(imgBuf, title, isAdoptable, isInjured, id) {
  return `<div>
  <script>
  function me(){ console.log("ME TIME") }
  </script>
            <div id=${styles.markerPopUp}>
              <img src="${imgBuf}" style="border-radius: 100px"/>
              <div id=${styles.popupContent}>
                <p>${title}</p>
                <div>
                ${isInjured ? `<span id=${styles.injuredTag}>Injured</span>` : ""}
                ${isAdoptable ? `<span id=${styles.adoptableTag}>Adopt</span>` : ""}
              </div>
                </div>
            </div>
            <a href="/mark/${id}">
              <button id="${styles.markBTN}" >View</button>
            </a>
          </div>`;
}

function FilterDialog({
  currentFilter,
  setFilter
}){

  return <div className={styles.filterDialog}>
    <CheckBox chekcBoxStyle={{backgroundColor: "#2a2a2a"}} color= "white" isChecked={currentFilter.allMarks} text="All Marks" onChange={(it)=>setFilter({allMarks: it, injured: false, adopt: false})}/>
    <CheckBox chekcBoxStyle={{backgroundColor: "#2a2a2a"}} color= "white" isChecked={currentFilter.injured} text="Injured" onChange={(it)=>setFilter({...currentFilter.allMarks, allMarks: false, injured: it})}/>
    <CheckBox chekcBoxStyle={{backgroundColor: "#2a2a2a"}} color= "white" isChecked={currentFilter.adopt} text="Adopt" onChange={(it)=>setFilter({...currentFilter.allMarks, allMarks: false, adopt: it})}/>
  </div>

}

function LeadboardButton() {
  return (
    <Link href={"/leadboard"}>
      <div id={styles.leadBoardButton}>
        <span>Leadboard</span>
        <Image src="/medal.png" width={100} height={100} alt="" />
      </div>
    </Link>
  );
}

function ProfileButton({imgBuf}) {
  return (
      <Link href={`/profile`}>
        <Image
          src={imgBuf}
          width={100}
          height={100}
          alt="Profile"
          style={{
            padding: "0px",
            width: "35px",
            height: "35px",
            position: "absolute",
            top: "1.5vh",
            right: "1.5rem",
            border: "solid 2px black",
            borderRadius: "100px",
            objectFit: "cover"
          }}
        />
      </Link>
    );
}

function NotificationButton({hasNewNotifs}){
  return (
    <a href={`/notifications`}>
      <Image
        src={ hasNewNotifs ? "/ic_bell_ring.png" : "/ic_bell.png"}
        width={100}
        height={100}
        alt="Notifications"
        style={{
          padding: "0px",
          width: "40px",
          height: "40px",
          position: "absolute",
          top: "1.5vh",
          right: "4.4rem",
          objectFit: "cover"
        }}
      />
    </a>
  );
}
