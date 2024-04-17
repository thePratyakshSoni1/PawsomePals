"use client"
import Script from "next/script";
import { useEffect } from "react";

export function MapDisplay({location}) {
  const initMap = ()=>{
    console.log("HELLOW");
    console.log("Script Loaded!");

    var theMap = L.map("detailsMapView", { zoomControl: false });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(theMap);
    document.getElementsByClassName("leaflet-control-attribution")[0].remove()
    
    theMap.setView(location, 12);

    var pinIcon = L.icon({
      iconUrl: "/ic_custom_mark.png",

      iconSize: [40, 50], // size of the icon
      shadowSize: [50, 64], // size of the shadow
      iconAnchor: [20, 50], // point of the icon which will correspond to marker's location
      shadowAnchor: [4, 62], // the same for the shadow
      popupAnchor: [1, -48], // point from which the popup should open relative to the iconAnchor
    });

    L.marker(location, { icon: pinIcon }).addTo(theMap);
  }

  return (
    <>
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

      <div
        id={"detailsMapView"}
        style={{ width: "100%", height: "14rem", borderRadius: "18px", marginTop: "1rem" }}
      ></div>
    </>
  );
}
