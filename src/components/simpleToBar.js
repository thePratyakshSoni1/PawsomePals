"use client"
import styles from "./components.module.css"
import Image from "next/image";
import { Divider } from "./divider";
import { useRouter } from "next/navigation";

export function SimpleTopBar({ title, zIndex = 10, onBackClick }) {
  const router = useRouter()
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
          onClick={onBackClick ? onBackClick : function(){router.back()}}
        />
        <Divider width="18px" />
        {title}
      </div>
    );
  }