import styles from "./components.module.css"
export function Divider({ height = "5px", width = "5px" }) {
    return (
      <div
        className={styles.divider}
        style={{ height: height, width: width }}
      ></div>
    );
  }