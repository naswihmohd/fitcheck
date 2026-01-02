import React from "react";

const spinnerStyle: React.CSSProperties = {
    width: 20,
    height: 20,
    border: "2.5px solid #e3e6f0",
    borderTop: "2.5px solid #43a047", // green
    borderRadius: "50%",
    animation: "countspin-rotate 0.7s linear infinite",
    boxSizing: "border-box",
    display: "inline-block",
};

// Add keyframes via a style tag (since no CSS file)
const styleSheet = `
@keyframes countspin-rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

if (typeof document !== "undefined" && !document.getElementById("countspin-keyframes")) {
    const style = document.createElement("style");
    style.id = "countspin-keyframes";
    style.innerHTML = styleSheet;
    document.head.appendChild(style);
}

const CountSpin: React.FC = () => {
    return <div style={spinnerStyle} />;
};

export default CountSpin;
