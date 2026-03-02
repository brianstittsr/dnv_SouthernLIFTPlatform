"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

interface KdmLogoAnimatedProps {
  /** Width of the logo in px. Height scales proportionally. */
  width?: number;
  /** If true, renders without animation (instant display). */
  static?: boolean;
  className?: string;
  /** Trigger re-animation on hover */
  hoverEffect?: boolean;
}

const BLUE = "#1e3a8a";
const DARK = "#0a0a0a";
const GLOW_BLUE = "rgba(30, 58, 138, 0.6)";

// Matches the original logo icon: a cube-like network with 7 nodes
// viewBox 0 0 100 100
// Nodes: top-center, top-left, top-right, mid-left, mid-right, bot-left, bot-right, center
const NODES = {
  topCenter:  { x: 50, y:  8 },
  topLeft:    { x: 18, y: 26 },
  topRight:   { x: 82, y: 26 },
  midLeft:    { x: 10, y: 52 },
  midRight:   { x: 90, y: 52 },
  botLeft:    { x: 22, y: 76 },
  botRight:   { x: 78, y: 76 },
  center:     { x: 50, y: 50 },
};

// Connections matching the original logo's cube-network pattern
const LINES = [
  // Top triangle
  { x1: NODES.topCenter.x,  y1: NODES.topCenter.y,  x2: NODES.topLeft.x,   y2: NODES.topLeft.y   },
  { x1: NODES.topCenter.x,  y1: NODES.topCenter.y,  x2: NODES.topRight.x,  y2: NODES.topRight.y  },
  { x1: NODES.topLeft.x,    y1: NODES.topLeft.y,    x2: NODES.topRight.x,  y2: NODES.topRight.y  },
  // Left side
  { x1: NODES.topLeft.x,    y1: NODES.topLeft.y,    x2: NODES.midLeft.x,   y2: NODES.midLeft.y   },
  { x1: NODES.midLeft.x,    y1: NODES.midLeft.y,    x2: NODES.botLeft.x,   y2: NODES.botLeft.y   },
  // Right side
  { x1: NODES.topRight.x,   y1: NODES.topRight.y,   x2: NODES.midRight.x,  y2: NODES.midRight.y  },
  { x1: NODES.midRight.x,   y1: NODES.midRight.y,   x2: NODES.botRight.x,  y2: NODES.botRight.y  },
  // Bottom
  { x1: NODES.botLeft.x,    y1: NODES.botLeft.y,    x2: NODES.botRight.x,  y2: NODES.botRight.y  },
  // Center spokes
  { x1: NODES.center.x,     y1: NODES.center.y,     x2: NODES.topLeft.x,   y2: NODES.topLeft.y   },
  { x1: NODES.center.x,     y1: NODES.center.y,     x2: NODES.topRight.x,  y2: NODES.topRight.y  },
  { x1: NODES.center.x,     y1: NODES.center.y,     x2: NODES.midLeft.x,   y2: NODES.midLeft.y   },
  { x1: NODES.center.x,     y1: NODES.center.y,     x2: NODES.midRight.x,  y2: NODES.midRight.y  },
  { x1: NODES.center.x,     y1: NODES.center.y,     x2: NODES.botLeft.x,   y2: NODES.botLeft.y   },
  { x1: NODES.center.x,     y1: NODES.center.y,     x2: NODES.botRight.x,  y2: NODES.botRight.y  },
];

// Node render order: outer first, center last
const OUTER_NODE_LIST = [
  NODES.topCenter,
  NODES.topLeft,
  NODES.topRight,
  NODES.midLeft,
  NODES.midRight,
  NODES.botLeft,
  NODES.botRight,
];

function makeLineAnim(delay: number, isStatic: boolean) {
  return {
    initial: { pathLength: 0, opacity: 0 },
    animate: {
      pathLength: 1,
      opacity: 1,
      transition: { 
        duration: 0.5, 
        delay,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
      },
    },
  };
}

function makeNodeAnim(delay: number, isStatic: boolean) {
  return {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { 
        duration: 0.4, 
        delay,
        type: "spring" as const,
        stiffness: 200,
        damping: 15
      },
    },
  };
}

function makeFadeUpAnim(delay: number, isStatic: boolean) {
  return {
    initial: { opacity: 0, y: 20, filter: "blur(10px)" },
    animate: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { 
        duration: 0.6, 
        delay,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
      },
    },
  };
}

export function KdmLogoAnimated({
  width = 300,
  static: isStatic = true,
  className = "",
  hoverEffect = false,
}: KdmLogoAnimatedProps) {
  // Icon is square, ~28% of total width
  const iconSize = Math.round(width * 0.28);
  const gap = Math.round(width * 0.03);
  const [isHovered, setIsHovered] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (!isStatic) {
      controls.start("animate");
    }
  }, [controls, isStatic]);

  const handleHover = () => {
    if (hoverEffect && !isStatic) {
      setIsHovered(true);
      controls.start("hover");
    }
  };

  const handleHoverEnd = () => {
    if (hoverEffect && !isStatic) {
      setIsHovered(false);
      controls.start("animate");
    }
  };

  return (
    <motion.div
      className={`inline-flex items-center select-none flex-shrink-0 ${className}`}
      style={{ width }}
      aria-label="KDM & Associates – A Team Approach to Your Success"
      onHoverStart={handleHover}
      onHoverEnd={handleHoverEnd}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* ── Network Icon ── */}
      <motion.svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Glow filter definition */}
        <defs>
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Lines drawn first (behind nodes) */}
        {LINES.map((l, i) => {
          const anim = makeLineAnim(isStatic ? 0 : 0.08 * i, isStatic);
          return (
            <motion.line
              key={`line-${i}`}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke={BLUE}
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#lineGlow)"
              initial={anim.initial}
              animate={anim.animate}
              whileHover={{ strokeWidth: 4, opacity: 1 }}
            />
          );
        })}

        {/* Outer nodes with spring animation */}
        {OUTER_NODE_LIST.map((n, i) => {
          const anim = makeNodeAnim(isStatic ? 0 : 0.6 + i * 0.1, isStatic);
          return (
            <motion.circle
              key={`node-${i}`}
              cx={n.x} cy={n.y} r="6"
              fill={BLUE}
              filter="url(#nodeGlow)"
              initial={anim.initial}
              animate={anim.animate}
              whileHover={{ scale: 1.5, fill: "#2563eb" }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            />
          );
        })}

        {/* Center node — largest, last with pulse effect */}
        {(() => {
          const anim = makeNodeAnim(isStatic ? 0 : 1.2, isStatic);
          return (
            <motion.circle
              cx={NODES.center.x} cy={NODES.center.y} r="8"
              fill={BLUE}
              filter="url(#nodeGlow)"
              initial={anim.initial}
              animate={isStatic ? anim.animate : {
                opacity: 1,
                scale: isHovered ? [1, 1.3, 1] : 1,
              }}
              transition={{ 
                scale: {
                  repeat: isHovered ? Infinity : 0,
                  duration: 1,
                  ease: "easeInOut"
                }
              }}
              whileHover={{ scale: 1.4, fill: "#2563eb" }}
            />
          );
        })()}
      </motion.svg>

      {/* ── Text Block ── */}
      <div
        style={{
          marginLeft: gap,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          lineHeight: 1.15,
          minWidth: 0,
        }}
      >
        {/* Row 1: KDM & Associates — single line, no wrap */}
        <div style={{ display: "flex", alignItems: "baseline", whiteSpace: "nowrap" }}>
          {(() => {
            const anim = makeFadeUpAnim(isStatic ? 0 : 1.0, isStatic);
            return (
              <motion.span
                style={{
                  fontFamily: "'Arial Black', 'Arial Bold', Arial, sans-serif",
                  fontWeight: 900,
                  fontSize: Math.round(iconSize * 0.62),
                  color: DARK,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
                initial={anim.initial}
                animate={anim.animate}
                whileHover={{ 
                  color: BLUE,
                  transition: { duration: 0.2 }
                }}
              >
                KDM
              </motion.span>
            );
          })()}

          {(() => {
            const anim = makeFadeUpAnim(isStatic ? 0 : 1.2, isStatic);
            return (
              <motion.span
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontWeight: 400,
                  fontSize: Math.round(iconSize * 0.38),
                  color: DARK,
                  marginLeft: "0.3em",
                  lineHeight: 1,
                }}
                initial={anim.initial}
                animate={anim.animate}
                whileHover={{ 
                  color: BLUE,
                  transition: { duration: 0.2 }
                }}
              >
                &amp; Associates
              </motion.span>
            );
          })()}
        </div>

        {/* Row 2: Tagline */}
        {(() => {
          const anim = makeFadeUpAnim(isStatic ? 0 : 1.4, isStatic);
          return (
            <motion.span
              style={{
                fontFamily: "Arial, sans-serif",
                fontWeight: 400,
                fontSize: Math.round(iconSize * 0.26),
                color: BLUE,
                marginTop: Math.round(iconSize * 0.06),
                whiteSpace: "nowrap",
                letterSpacing: "0.01em",
              }}
              initial={anim.initial}
              animate={anim.animate}
              whileHover={{ 
                letterSpacing: "0.05em",
                transition: { duration: 0.3 }
              }}
            >
              A Team Approach to Your Success
            </motion.span>
          );
        })()}
      </div>
    </motion.div>
  );
}
