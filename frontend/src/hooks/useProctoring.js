import { useState, useEffect, useCallback } from "react";

function useProctoring() {
  const [warnings, setWarnings] = useState([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const addWarning = useCallback((message) => {
    setWarnings((prev) => [...prev, { message, timestamp: new Date().toISOString() }]);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        addWarning("Tab switch detected. Please stay on this page during the interview.");
      }
    };

    const handleBlur = () => {
      addWarning("Window lost focus. Please remain on the interview screen.");
    };

    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (!isFs) {
        addWarning("Fullscreen mode exited. Please return to fullscreen.");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [addWarning]);

  const enterFullscreen = useCallback(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, []);

  const clearLatestWarning = useCallback(() => {
    setWarnings((prev) => prev.slice(0, -1));
  }, []);

return {
  warnings,
  tabSwitchCount,
  isFullscreen,
  enterFullscreen,
  exitFullscreen,
  clearLatestWarning,
  addWarning,
};
}

export default useProctoring;