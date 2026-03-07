import React from "react";
import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div style={styles.container}>
      <motion.div
        style={styles.spinner}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      <p style={styles.text}>Loading...</p>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    color: "white",
  },
  spinner: {
    width: 60,
    height: 60,
    border: "6px solid #334155",
    borderTop: "6px solid #7c3aed",
    borderRadius: "50%",
    marginBottom: 20,
  },
  text: {
    fontSize: "18px",
    letterSpacing: "1px",
  },
};