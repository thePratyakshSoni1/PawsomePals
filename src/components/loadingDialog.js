import styles from "./components.module.css"

export function LoadingDialog({zIndex=1}){
    return <>
        <div className={styles.dialog} style={{zIndex: zIndex}}>
        <div className={styles.dialogContent}>
            <div id={styles.loading}></div>
            <p>Just a Second...</p>
        </div>
    </div>
  </>
}

export function LoadingPlaceHolder({borderWidth="14px", width="", customCss={}}){
    return <div className={styles.pdialogContent} style={{width: width ,...customCss}}>
                    <div id={styles.ploading} style={{borderWidth: borderWidth}}></div>
            </div>
}