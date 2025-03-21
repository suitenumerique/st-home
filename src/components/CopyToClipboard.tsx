"use client";

import { useState } from "react";
import styles from "./CodeBlock.module.css";

export default function CopyToClipboard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Error copying to clipboard", error);
    }
  };

  return (
    <button
      className={styles.copyButton}
      onClick={copyToClipboard}
      style={copied ? { opacity: 1 } : {}}
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 256 256"
          fill="#4caf50"
        >
          <path d="M104,192a8.5,8.5,0,0,1-5.7-2.3l-56-56a8.1,8.1,0,0,1,11.4-11.4L104,172.7,202.3,74.3a8.1,8.1,0,0,1,11.4,11.4l-104,104A8.5,8.5,0,0,1,104,192Z" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="#fff"
          viewBox="0 0 256 256"
        >
          <path d="M216,40V168H168V88H88V40Z" opacity="0.2"></path>
          <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path>
        </svg>
      )}
    </button>
  );
}
