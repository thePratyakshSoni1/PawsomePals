import styles from "./components.module.css"

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