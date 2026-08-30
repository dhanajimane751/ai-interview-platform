import { motion } from "framer-motion";

function LevelMeter({ active = true, bars = 5, size = "md" }) {
  const heights = size === "sm" ? [4, 8, 12, 8, 4] : [8, 16, 24, 16, 8];

  return (
    <div className="level-meter" style={{ height: Math.max(...heights) }}>
      {heights.map((h, i) => (
        <motion.span
          key={i}
          animate={active ? { height: [h * 0.4, h, h * 0.4] } : { height: h * 0.3 }}
          transition={{ repeat: active ? Infinity : 0, duration: 0.7, delay: i * 0.08 }}
          style={{ height: h }}
        />
      ))}
    </div>
  );
}

export default LevelMeter;