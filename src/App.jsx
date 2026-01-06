import { useEffect, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
} from "framer-motion";
import "./App.css";
import Infographic from "./staticinfograph.svg?react";


function CoverText() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div style={{ textAlign: "left" }}>
      <h1
  style={{
    color: "#FFF",
    margin: "100px",
    fontFamily: '"Helvetica Neue", sans-serif',
    fontSize: "150px",
    fontStyle: "normal",
    fontWeight: 350,
    lineHeight: "normal",
    textTransform: "capitalize",
  }}
>

        
          The ocean has begun
          <br />
          misprinting the seashells.
        </h1>
      <p
  style={{
    color: "#FFF",
    margin: 100,
    fontFamily: '"Helvetica Neue", sans-serif',
    fontSize: "40px",
    fontStyle: "italic",
    fontWeight: 500,
    lineHeight: "normal",
  }}
>Data story inspired by risograph printing technique.
</p>

      </div>
    </div>
  );
}

export default function App() {
  const { scrollYProgress } = useScroll();

  // React-side copy of tProgress from the p5 sketch
  const [shellProgress, setShellProgress] = useState(0);
  const shellT = useMotionValue(0);

  // which sketch to show
  const [mode, setMode] = useState("formation"); // "formation" | "data"

  // When shell is basically done, switch to data sketch
  useEffect(() => {
    if (shellProgress >= 1 && mode === "formation") {
      setMode("data");
    }
  }, [shellProgress, mode]);

  useEffect(() => {
    function handleMessage(event) {
      const data = event.data;
      if (!data || data.type !== "shell-progress") return;

      const p = Math.max(0, Math.min(1, data.progress));
      setShellProgress(p);
      shellT.set(p);
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [shellT]);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      // when user scrolls near the very top, reset shell + text
      if (v < 0.1) {
        const iframe = document.querySelector(
          'iframe[title="Shell Formation"]'
        );
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({ type: "reset-shell" }, "*");
        }
        shellT.set(0);
        setShellProgress(0);
        setMode("formation"); // also go back to formation view
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, shellT]);

  // cover lifts up; adjust [0, 0.4] etc. for speed
  const coverY = useTransform(
    scrollYProgress,
    [0, 0.08],
    [0, -window.innerHeight]
  );

  // Text timing is driven by shellT (shell’s own time), not scroll
  function useLineMotion(index, total) {
    const slice = 1 / total; // leave a 10% buffer at the end
    const start = index * slice;
    const end = start + slice;

    const mid1 = start + (end - start) * 0.1;
    const mid2 = start + (end - start) * 0.8;

    const y = useTransform(shellT, [start, end], [500, -500]);

    const opacity = useTransform(
      shellT,
      [start, mid1, mid2, end],
      [0, 1, 1, 0]
    );

    return { y, opacity };
  }

  const lines = [
    "Our planet is full of delicate mathematical patterns and evolved balances.",
    "Shells often grow in logarithmic spirals, where the radius expands smoothly as the organism grows, keeping its overall form self‑similar.",
    "Laboratory and field experiments show that under lower pH, shells can become thinner, lighter, and more pitted, with subtle changes in shape and strength that increase vulnerability even before catastrophic damage appears. ",
    "Since the late 1980s, the average pH of the global surface ocean has fallen by about 0.06–0.08 units, from roughly 8.11 to around 8.03. ",
    "The ocean currently absorbs about 25–30% of this CO₂, acting as a major carbon sink and slowing atmospheric warming.",
    "When CO₂ dissolves in seawater it reacts with water to form carbonic acid, which then dissociates into bicarbonate and hydrogen ions.",
    "More hydrogen ions mean lower pH, so as more CO₂ enters the ocean, average surface pH falls even though seawater is still slightly alkaline overall.",
    "Between 1985 and 2024 ocean acidity has increased by 17.5% The pH scale is logarithmic, which means that a small drop in pH represents a big increase in acidity.",
    "If we go back to the pre-industrial era, this percentage is as high as 40%. ",
  ];

  return (
    <div
      style={{
        minHeight: "200vh", // enough to scroll sticky scene + infographic
        margin: 0,
        background: "#f5f5f5",
        overflowX: "visible",
      }}
    >
      {/* wrapper so sticky section can unstick */}
      <section
        style={{
          height: "350vh", // controls how long the shell scene is pinned
          position: "relative",
        }}
      >
        {/* sticky shell / data scene */}
        <div
          style={{
            position: "sticky",
            top: 0,
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {mode === "formation" && (
            <iframe
              src="/formation/index.html"
              title="Shell Formation"
              style={{
                width: "100vw",
                height: "100vh",
                border: "none",
                zIndex: 1,
              }}
            />
          )}

          {mode === "data" && (
            <iframe
              src="/data/index.html"
              title="Shell Data"
              style={{
                width: "100vw",
                height: "100vh",
                border: "none",
                zIndex: 1,
              }}
            />
          )}

          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              overflow: "hidden",
              y: coverY,
              zIndex: 3,
              boxShadow: "0px 20px 60px rgba(0, 0, 0, 0.35)",
            }}
          >
            <iframe
              src="/cover/index.html"
              title="Shell Cover"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                border: "none",
              }}
            />
            <CoverText />
          </motion.div>

          {lines.map((text, i) => {
            const { y, opacity } = useLineMotion(i, lines.length);
            return (
              <motion.p
                key={i}
                style={{
                  position: "absolute",
                  left: "30%",
                  top: "50%",
                  y,
                  opacity,
                  pointerEvents: "none",
                  color: "#2d2d2dff",
                   fontFamily: '"Helvetica Neue", sans-serif',
                  fontSize: "20px",
                  textAlign: "left",
                  maxWidth: "50rem",
                  zIndex: 2,
                }}
              >
                {text}
              </motion.p>
            );
          })}
        </div>
      </section>

      {/* infographic section immediately after shell/data scene */}
            {/* infographic section immediately after shell/data scene */}
      <section
        style={{
          width: "100vw",
          minHeight: "100vh",
          padding: "40px 0 80px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f5f5f5",
        }}
      >
        <div style={{ width: "100vw" }}>
          <Infographic
            style={{
              width: "100vw",
              maxWidth: "100vw",
              height: "auto",
              display: "block",
            }}
          />
        </div>
      </section>
</div>   // <- closes the outer <div>
  );          // <- closes the return ( ... )
}            // <- closes function App
