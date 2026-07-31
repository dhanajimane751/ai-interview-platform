import { motion, AnimatePresence } from "framer-motion";

function WarningOverlay({ warning, onDismiss }) {
  return (
    <AnimatePresence>
      {warning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md"
        >
          <span className="text-lg">⚠️</span>
          <p className="text-sm">{warning.message}</p>
          <button onClick={onDismiss} className="text-white/70 hover:text-white ml-2 text-sm">
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default WarningOverlay;