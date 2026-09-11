import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X, Image as ImageIcon, Video as VideoIcon, Eye, EyeOff } from "lucide-react";

/**
 * АДВЕНТ-КАЛЕНДАРЬ — прототип
 * ---------------------------------------------------------
 * Как заменить контент на реальный:
 * 1. Найди массив SURPRISES ниже.
 * 2. У каждого дня меняй поля:
 *    - type: "photo" | "video" | "text"
 *    - caption: подпись/сообщение (для text — это и есть сам сюрприз)
 *    - mediaUrl: для photo/video — ссылка на файл (при переносе в свой
 *      проект просто положи файлы в /public/media/ и укажи путь,
 *      например "/media/day5.jpg")
 * 3. Кнопка "Предпросмотр" вверху временно открывает все окошки
 *    независимо от даты — удобно для проверки анимаций. Выключи её,
 *    чтобы окошки открывались только в свой день по-настоящему.
 * ---------------------------------------------------------
 */

const PLACEHOLDER_LINES = [
  "Сегодня просто: я тебя люблю.",
  "Вспомни нашу первую поездку вдвоём.",
  "Обещание на выходные — впиши своё.",
  "Маленькая причина, почему мне повезло с тобой.",
  "Свободный вечер только для нас двоих.",
  "То, что я никогда не говорил вслух.",
  "Один твой момент, который я не забуду.",
  "Купон на завтрак в постель.",
];

function buildSurprises() {
  const types = ["photo", "video", "text"];
  return Array.from({ length: 25 }, (_, i) => {
    const day = i + 1;
    const type = types[day % 3];
    const caption =
      type === "photo"
        ? `Фото № ${day} — замени на своё`
        : type === "video"
        ? `Видео № ${day} — замени на своё`
        : PLACEHOLDER_LINES[day % PLACEHOLDER_LINES.length];
    return { day, type, caption, mediaUrl: null };
  });
}

function getUnlockDate(day) {
  const now = new Date();
  let year = now.getFullYear();
  const dec25 = new Date(year, 11, 25, 23, 59, 59);
  if (now > dec25) year += 1;
  return new Date(year, 11, day);
}

function hueFor(day) {
  return (day * 47) % 360;
}

export default function AdventCalendar() {
  const surprises = useMemo(() => buildSurprises(), []);
  const [openedDays, setOpenedDays] = useState(() => new Set());
  const [flippingDay, setFlippingDay] = useState(null);
  const [shakingDay, setShakingDay] = useState(null);
  const [activeDay, setActiveDay] = useState(null);
  const [demoMode, setDemoMode] = useState(true);

  const snowflakes = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        delay: (i * 0.37) % 8,
        duration: 8 + ((i * 13) % 10),
        size: 3 + (i % 4),
      })),
    []
  );

  const isLocked = useCallback(
    (day) => !demoMode && new Date() < getUnlockDate(day),
    [demoMode]
  );

  const handleDoorClick = (day) => {
    if (isLocked(day)) {
      setShakingDay(day);
      setTimeout(() => setShakingDay(null), 500);
      return;
    }
    if (openedDays.has(day)) {
      setActiveDay(day);
      return;
    }
    setFlippingDay(day);
  };

  const finishFlip = (day) => {
    setFlippingDay(null);
    setOpenedDays((prev) => new Set(prev).add(day));
    setActiveDay(day);
  };

  const activeSurprise = surprises.find((s) => s.day === activeDay);

  return (
    <div className="advent-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Work+Sans:wght@400;500&display=swap');

        .advent-app {
          position: relative;
          min-height: 100vh;
          width: 100%;
          background: radial-gradient(ellipse at 50% -10%, #2A1F49 0%, #1B1330 55%, #150E26 100%);
          font-family: 'Work Sans', sans-serif;
          color: #F4EDE4;
          overflow: hidden;
          padding: 32px 16px 60px;
          box-sizing: border-box;
        }

        .snow-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .snowflake {
          position: absolute;
          top: -10px;
          border-radius: 50%;
          background: rgba(244, 237, 228, 0.55);
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes fall {
          0% { transform: translateY(-10px) translateX(0); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) translateX(18px); opacity: 0.2; }
        }

        .header {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 480px;
          margin: 0 auto 36px;
        }
        .flame-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(217,164,78,0.35) 0%, rgba(217,164,78,0) 70%);
          animation: flicker 3.2s ease-in-out infinite;
          margin-bottom: 10px;
        }
        @keyframes flicker {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        .title {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: clamp(26px, 6vw, 34px);
          margin: 0 0 6px;
          letter-spacing: 0.2px;
        }
        .subtitle {
          font-size: 14px;
          color: #C9BFE0;
          margin: 0 0 18px;
          line-height: 1.5;
        }
        .toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(244,237,228,0.08);
          border: 1px solid rgba(244,237,228,0.2);
          color: #F4EDE4;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-family: 'Work Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .toggle-btn:hover { background: rgba(244,237,228,0.14); }

        .grid {
          position: relative;
          z-index: 2;
          max-width: 640px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }
        @media (max-width: 520px) {
          .grid { grid-template-columns: repeat(3, 1fr); gap: 9px; }
        }

        .door-cell {
          perspective: 900px;
        }
        .door-cell.featured {
          grid-column: span 2;
          grid-row: span 2;
        }

        .door {
          width: 100%;
          height: 100%;
          min-height: 64px;
          border-radius: 10px;
          border: 1px solid rgba(244,237,228,0.16);
          background: linear-gradient(160deg, #2C2148 0%, #241C3C 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transform-style: preserve-3d;
          box-shadow: 0 6px 14px rgba(0,0,0,0.25);
        }
        .door.opened {
          background: linear-gradient(160deg, #3A2B5C 0%, #2C2148 100%);
          border-color: rgba(217,164,78,0.45);
        }
        .door.locked {
          opacity: 0.55;
        }
        .door-number {
          font-family: 'Fraunces', serif;
          font-weight: 600;
          font-size: 20px;
        }
        .door-cell.featured .door-number { font-size: 28px; }
        .door-glow {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #D9A44E;
          margin-top: 6px;
          box-shadow: 0 0 8px 2px rgba(217,164,78,0.7);
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(12, 8, 22, 0.72);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          padding: 20px;
        }
        .modal-card {
          width: 100%;
          max-width: 360px;
          background: linear-gradient(165deg, #2C2148 0%, #1F1836 100%);
          border: 1px solid rgba(217,164,78,0.3);
          border-radius: 16px;
          padding: 28px 22px;
          text-align: center;
          position: relative;
        }
        .close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          background: rgba(244,237,228,0.1);
          border: none;
          color: #F4EDE4;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .media-placeholder {
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .modal-day {
          font-family: 'Fraunces', serif;
          font-size: 15px;
          color: #D9A44E;
          margin-bottom: 8px;
        }
        .modal-caption {
          font-size: 16px;
          line-height: 1.55;
        }
      `}</style>

      <div className="snow-layer">
        {snowflakes.map((f) => (
          <div
            key={f.id}
            className="snowflake"
            style={{
              left: `${f.left}%`,
              width: f.size,
              height: f.size,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="header">
        <div className="flame-wrap">
          <Flame size={26} color="#D9A44E" />
        </div>
        <h1 className="title">Адвент-календарь</h1>
        <p className="subtitle">
          Открыто {openedDays.size} из 25 · коснись окошка своего дня
        </p>
        <button className="toggle-btn" onClick={() => setDemoMode((v) => !v)}>
          {demoMode ? <Eye size={15} /> : <EyeOff size={15} />}
          {demoMode ? "Предпросмотр: все открыты" : "По датам"}
        </button>
      </div>

      <div className="grid">
        {surprises.map((s) => {
          const featured = s.day % 5 === 0 || s.day === 24 || s.day === 25;
          const locked = isLocked(s.day);
          const opened = openedDays.has(s.day);
          const flipping = flippingDay === s.day;
          const shaking = shakingDay === s.day;

          return (
            <div key={s.day} className={`door-cell ${featured ? "featured" : ""}`}>
              <motion.button
                type="button"
                className={`door ${locked ? "locked" : ""} ${opened ? "opened" : ""}`}
                onClick={() => handleDoorClick(s.day)}
                onAnimationComplete={() => {
                  if (flipping) finishFlip(s.day);
                }}
                animate={
                  flipping
                    ? { rotateY: [0, -110], scale: [1, 0.92, 1] }
                    : shaking
                    ? { x: [0, -5, 5, -5, 5, 0] }
                    : { rotateY: 0 }
                }
                transition={
                  flipping
                    ? { duration: 0.55, ease: "easeInOut" }
                    : { duration: 0.4 }
                }
                whileTap={!locked ? { scale: 0.96 } : {}}
              >
                <span className="door-number">{s.day}</span>
                {opened && <span className="door-glow" />}
              </motion.button>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {activeDay && activeSurprise && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveDay(null)}
          >
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setActiveDay(null)}>
                <X size={16} />
              </button>
              <div className="modal-day">День {activeSurprise.day}</div>

              {activeSurprise.type !== "text" && (
                <div
                  className="media-placeholder"
                  style={{
                    background: `linear-gradient(160deg, hsl(${hueFor(
                      activeSurprise.day
                    )}, 45%, 30%), hsl(${hueFor(activeSurprise.day) + 30}, 45%, 18%))`,
                  }}
                >
                  {activeSurprise.type === "photo" ? (
                    <ImageIcon size={40} color="#F4EDE4" opacity={0.8} />
                  ) : (
                    <VideoIcon size={40} color="#F4EDE4" opacity={0.8} />
                  )}
                </div>
              )}

              <p className="modal-caption">{activeSurprise.caption}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
