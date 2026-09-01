import {
  useState,
  useEffect,
  useCallback,
} from "react";

function useProctoring() {
  const [warnings, setWarnings] =
    useState([]);
  const [tabSwitchCount, setTabSwitchCount] =
    useState(0);
  const [isFullscreen, setIsFullscreen] =
    useState(
      Boolean(document.fullscreenElement)
    );

  const addWarning = useCallback(
    (message, type = "other") => {
      setWarnings((prev) => [
        ...prev,
        {
          type,
          message,
          timestamp:
            new Date().toISOString(),
        },
      ]);
    },
    []
  );

  useEffect(() => {
    const handleVisibilityChange =
      () => {
        if (document.hidden) {
          setTabSwitchCount(
            (prev) => prev + 1
          );

          addWarning(
            "Tab switch detected. Please stay on the interview page.",
            "tab_switch"
          );
        }
      };

    const handleBlur = () => {
      addWarning(
        "Window lost focus. Please remain on the interview screen.",
        "window_blur"
      );
    };

    const handleFullscreenChange =
      () => {
        const active =
          Boolean(
            document.fullscreenElement
          );

        setIsFullscreen(active);

        if (!active) {
          addWarning(
            "Fullscreen mode exited. Please return to fullscreen.",
            "fullscreen_exit"
          );
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "blur",
      handleBlur
    );

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "blur",
        handleBlur
      );

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, [addWarning]);

  const enterFullscreen =
    useCallback(() => {
      const element =
        document.documentElement;

      if (
        element.requestFullscreen
      ) {
        element
          .requestFullscreen()
          .catch(() => {});
      }
    }, []);

  const exitFullscreen =
    useCallback(() => {
      if (
        document.exitFullscreen &&
        document.fullscreenElement
      ) {
        document.exitFullscreen();
      }
    }, []);

  const clearLatestWarning =
    useCallback(() => {
      setWarnings((prev) =>
        prev.slice(0, -1)
      );
    }, []);

  const getProctoringEvents =
    useCallback(() => {
      return warnings.map(
        (warning) => ({
          type:
            warning.type || "other",
          message:
            warning.message,
          timestamp:
            warning.timestamp,
        })
      );
    }, [warnings]);

  return {
    warnings,
    tabSwitchCount,
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    clearLatestWarning,
    addWarning,
    getProctoringEvents,
  };
}

export default useProctoring;