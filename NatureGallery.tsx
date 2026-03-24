/**
 * NatureGallery — Framer Code Component
 * Inspired by lewahouse.com/wildlife/
 * ─────────────────────────────────────
 * Framer → Assets → Code → New Component → paste toàn bộ file này
 */

import React, { useRef, useEffect, useState, useCallback } from "react"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface Scene {
  id: number
  label: string
  name: string
  w: number
  h: number
  /** Dùng màu hoặc URL ảnh thật */
  image?: string
  color: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Data — thay image: "URL_ANH" bằng link ảnh thật của bạn
// ─────────────────────────────────────────────────────────────────────────────
const scenes: Scene[][] = [
  [
    { id: 1,  label: "Landscape 01", name: "Rừng Nhiệt Đới", w: 360, h: 240, color: "#6b7c5e" },
    { id: 2,  label: "Landscape 02", name: "Bầu Trời Vàng",  w: 240, h: 240, color: "#8c7355" },
    { id: 3,  label: "Landscape 03", name: "Con Suối Rừng",  w: 300, h: 240, color: "#4a6352" },
    { id: 4,  label: "Landscape 04", name: "Sương Sớm Mai",  w: 220, h: 240, color: "#7a8c6e" },
    { id: 5,  label: "Landscape 05", name: "Đàn Chim Bay",   w: 280, h: 240, color: "#5c6e7a" },
  ],
  [
    { id: 6,  label: "Landscape 06", name: "Những Tán Cây",  w: 220, h: 200, color: "#7c6b4a" },
    { id: 7,  label: "Landscape 07", name: "Thác Nước",      w: 320, h: 200, color: "#4a6b5c" },
    { id: 8,  label: "Landscape 08", name: "Rừng Tre Xanh",  w: 260, h: 200, color: "#5e7a6b" },
    { id: 9,  label: "Landscape 09", name: "Đêm Ngàn Sao",   w: 340, h: 200, color: "#3a4a5c" },
    { id: 10, label: "Landscape 10", name: "Thung Lũng Sương",w: 220, h: 200, color: "#6b7c6e" },
  ],
  [
    { id: 11, label: "Landscape 11", name: "Rừng Lá Thu",    w: 280, h: 220, color: "#8c6b4a" },
    { id: 12, label: "Landscape 12", name: "Phản Chiếu Hồ",  w: 220, h: 220, color: "#4a6b7c" },
    { id: 13, label: "Landscape 13", name: "Mưa Nhiệt Đới",  w: 330, h: 220, color: "#5e7a5c" },
    { id: 14, label: "Landscape 14", name: "Bình Minh Rừng", w: 250, h: 220, color: "#8c7c5e" },
    { id: 15, label: "Landscape 15", name: "Đá Phủ Rêu",     w: 220, h: 220, color: "#5c6b52" },
  ],
]

// ─────────────────────────────────────────────────────────────────────────────
// Hook: useScrollReveal — fade + slide up khi element vào viewport
// ─────────────────────────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook: useDragScroll — drag to scroll row
// ─────────────────────────────────────────────────────────────────────────────
function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const row = ref.current
    if (!row) return
    let isDown = false
    let startX = 0
    let scrollLeft = 0
    let velocity = 0
    let lastX = 0
    let rafId = 0

    const onDown = (e: MouseEvent) => {
      isDown = true
      startX = e.pageX - row.offsetLeft
      scrollLeft = row.scrollLeft
      lastX = e.pageX
      velocity = 0
      cancelAnimationFrame(rafId)
      row.style.cursor = "grabbing"
    }
    const onUp = () => {
      if (!isDown) return
      isDown = false
      row.style.cursor = "grab"
      // momentum
      const momentum = () => {
        if (Math.abs(velocity) < 0.5) return
        row.scrollLeft += velocity
        velocity *= 0.92
        rafId = requestAnimationFrame(momentum)
      }
      rafId = requestAnimationFrame(momentum)
    }
    const onMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      velocity = (lastX - e.pageX) * 1.4
      lastX = e.pageX
      const x = e.pageX - row.offsetLeft
      row.scrollLeft = scrollLeft + (startX - x) * 1.4
    }

    row.addEventListener("mousedown", onDown)
    window.addEventListener("mouseup", onUp)
    row.addEventListener("mousemove", onMove)
    return () => {
      row.removeEventListener("mousedown", onDown)
      window.removeEventListener("mouseup", onUp)
      row.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return ref
}

// ─────────────────────────────────────────────────────────────────────────────
// Component: Thumb
// ─────────────────────────────────────────────────────────────────────────────
function Thumb({ scene, delay = 0 }: { scene: Scene; delay?: number }) {
  const [hovered, setHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const { ref, visible } = useScrollReveal()

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }, [])

  // Parallax shift on hover (subtle)
  const imgShiftX = hovered ? (mousePos.x - 0.5) * 12 : 0
  const imgShiftY = hovered ? (mousePos.y - 0.5) * 8 : 0

  return (
    <div
      ref={ref}
      style={{
        flexShrink: 0,
        width: scene.w,
        height: scene.h,
        borderRadius: 6,
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        // Scroll reveal
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered ? "translateY(-10px) scale(1.02)" : "translateY(0) scale(1)"
          : "translateY(40px) scale(0.96)",
        transition: visible
          ? `opacity 0.7s ease ${delay}ms, transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms, box-shadow 0.4s ease`
          : `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        boxShadow: hovered
          ? "0 20px 60px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.1)"
          : "0 4px 24px rgba(0,0,0,0.12)",
        zIndex: hovered ? 10 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Background image / color */}
      <div
        style={{
          position: "absolute",
          inset: -8,
          background: scene.image
            ? `url(${scene.image}) center/cover no-repeat`
            : scene.color,
          transform: `translate(${imgShiftX}px, ${imgShiftY}px) scale(1.06)`,
          transition: "transform 0.5s ease",
          filter: hovered ? "brightness(0.85)" : "brightness(0.72)",
        }}
      />

      {/* Grain texture overlay — gives the "editorial/handmade" feel */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, opacity: 0.06,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "120px",
      }} />

      {/* Bottom gradient — Lewa style: warm fade */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 2,
        background: "linear-gradient(to top, rgba(30,18,6,0.85) 0%, rgba(30,18,6,0.2) 50%, transparent 100%)",
        transition: "opacity 0.4s",
        opacity: hovered ? 1 : 0.7,
      }} />

      {/* Brush-stroke top accent — decorative top line on hover */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3, zIndex: 3,
        background: "linear-gradient(90deg, transparent, #c4522a, transparent)",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.4s",
      }} />

      {/* Label — slides up on hover */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 4,
        padding: "20px 18px 16px",
        transform: hovered ? "translateY(0)" : "translateY(6px)",
        opacity: hovered ? 1 : 0.6,
        transition: "transform 0.4s ease, opacity 0.4s ease",
        pointerEvents: "none",
      }}>
        <div style={{
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(240,220,200,0.65)",
          fontFamily: "'Raleway', sans-serif",
          marginBottom: 4,
        }}>
          {scene.label}
        </div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 17,
          fontWeight: 400,
          color: "#f0ede6",
          lineHeight: 1.2,
          fontStyle: hovered ? "italic" : "normal",
          transition: "font-style 0.3s",
        }}>
          {scene.name}
        </div>
        {/* Small animated underline */}
        <div style={{
          marginTop: 8, height: 1,
          background: "#c4522a",
          width: hovered ? "100%" : "0%",
          transition: "width 0.5s cubic-bezier(0.25,0.46,0.45,0.94) 0.1s",
        }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Component: ScrollRow — one horizontal scroll row
// ─────────────────────────────────────────────────────────────────────────────
function ScrollRow({ row, rowIdx }: { row: Scene[]; rowIdx: number }) {
  const dragRef = useDragScroll()
  // offset alternate rows for staggered visual
  const offset = rowIdx % 2 === 1 ? 40 : 0

  return (
    <div
      ref={dragRef}
      style={{
        display: "flex",
        gap: 14,
        overflowX: "auto",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        cursor: "grab",
        marginBottom: 14,
        paddingLeft: offset,
        paddingRight: 40,
        paddingBottom: 4,
        userSelect: "none",
      } as React.CSSProperties}
    >
      {row.map((scene, i) => (
        <Thumb
          key={scene.id}
          scene={scene}
          delay={i * 80}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function NatureGallery() {
  const headerRef = useScrollReveal()

  return (
    <div style={{
      position: "relative",
      // Lewa palette: warm sandy cream
      background: "#f0ede6",
      minHeight: "100vh",
      overflow: "hidden",
      fontFamily: "'Raleway', sans-serif",
    }}>

      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Raleway:wght@300;400;500&display=swap');
        *::-webkit-scrollbar { display: none; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes drawLine {
          from { width: 0; }
          to   { width: 60px; }
        }
        @keyframes rotateSeal {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── Subtle paper texture background ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px",
      }} />

      {/* ── Header ── */}
      <div
        ref={headerRef.ref}
        style={{
          position: "relative",
          zIndex: 10,
          padding: "72px 60px 56px",
          maxWidth: 900,
        }}
      >
        {/* Eyebrow */}
        <div style={{
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#c4522a",
          marginBottom: 16,
          animation: headerRef.visible ? "fadeIn 0.8s ease 0.1s both" : "none",
        }}>
          Khám Phá · Nature · Wilderness
        </div>

        {/* Large title — Lewa style: big serif, italic word */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(2.8rem, 6vw, 5rem)",
          fontWeight: 400,
          color: "#1a1410",
          lineHeight: 1.05,
          letterSpacing: "-0.01em",
          margin: "0 0 6px",
          animation: headerRef.visible ? "fadeUp 0.9s ease 0.2s both" : "none",
        }}>
          Landscapes
        </h1>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(2.8rem, 6vw, 5rem)",
          fontWeight: 400,
          fontStyle: "italic",
          color: "#c4522a",
          lineHeight: 1.05,
          margin: "0 0 28px",
          animation: headerRef.visible ? "fadeUp 0.9s ease 0.3s both" : "none",
        }}>
          at Wild
        </h1>

        {/* Animated separator line */}
        <div style={{
          height: 1,
          background: "#1a1410",
          width: 0,
          animation: headerRef.visible ? "drawLine 0.8s ease 0.6s forwards" : "none",
          marginBottom: 20,
        }} />

        {/* Subtitle */}
        <p style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "#4a3d34",
          maxWidth: 420,
          margin: 0,
          fontWeight: 300,
          animation: headerRef.visible ? "fadeUp 0.9s ease 0.7s both" : "none",
        }}>
          Kéo để khám phá từng khung cảnh thiên nhiên — mỗi ảnh là một câu chuyện riêng.
        </p>
      </div>

      {/* ── Decorative rotating seal (Lewa style) ── */}
      <div style={{
        position: "absolute", top: 80, right: 80, zIndex: 10,
        width: 90, height: 90,
        animation: "rotateSeal 18s linear infinite",
        opacity: 0.55,
      }}>
        <svg viewBox="0 0 100 100" fill="none">
          <path id="circle" d="M 50,50 m -35,0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none"/>
          <text fontSize="10" fill="#c4522a" fontFamily="'Raleway', sans-serif" letterSpacing="4">
            <textPath href="#circle">
              NATURE · WILDLIFE · LANDSCAPE · WILDERNESS ·{" "}
            </textPath>
          </text>
          {/* Center dot */}
          <circle cx="50" cy="50" r="3" fill="#c4522a"/>
        </svg>
      </div>

      {/* ── Drag hint ── */}
      <div style={{
        position: "relative", zIndex: 10,
        padding: "0 60px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 12,
        animation: "fadeIn 1s ease 1s both",
      }}>
        {/* Arrow left */}
        <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
          <path d="M 0 6 L 8 0 M 0 6 L 8 12 M 0 6 L 28 6" stroke="#4a3d34" strokeWidth="1" opacity="0.5"/>
        </svg>
        <span style={{
          fontSize: 10.5,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(74,61,52,0.5)",
        }}>kéo để khám phá</span>
        <svg width="28" height="12" viewBox="0 0 28 12" fill="none">
          <path d="M 28 6 L 20 0 M 28 6 L 20 12 M 28 6 L 0 6" stroke="#4a3d34" strokeWidth="1" opacity="0.5"/>
        </svg>
      </div>

      {/* ── Gallery Grid ── */}
      <div style={{ position: "relative", zIndex: 10, padding: "0 0 80px" }}>
        {scenes.map((row, rowIdx) => (
          <ScrollRow key={rowIdx} row={row} rowIdx={rowIdx} />
        ))}
      </div>

      {/* ── Bottom tagline ── */}
      <div style={{
        position: "relative", zIndex: 10,
        padding: "0 60px 60px",
        borderTop: "1px solid rgba(26,20,16,0.12)",
        marginTop: 8,
        paddingTop: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
          fontStyle: "italic",
          color: "#1a1410",
          margin: 0,
          opacity: 0.6,
        }}>
          "Always leave space for wilderness."
        </p>
        <div style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#c4522a",
        }}>
          Scroll to explore ↑
        </div>
      </div>
    </div>
  )
}
