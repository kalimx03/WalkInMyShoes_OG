import React, { useEffect } from "react";
import { motion } from "framer-motion";
import useAppStore from "./store/appStore";

import LandingPage from "./components/ui/LandingPage";
import MainMenu from "./components/ui/MainMenu";
import ScenarioSelector from "./components/ui/ScenarioSelector";
import VisualImpairmentScene from "./components/scenes/VisualImpairmentScene";
import HearingLossScene from "./components/scenes/HearingLossScene";
import MotorDisabilityScene from "./components/scenes/MotorDisabilityScene";
import ARAccessibilityAuditor from "./components/scenes/ARAccessibilityAuditor";
import ImpactDashboard from "./components/ui/ImpactDashboard";
import CertificateViewer from "./components/ui/CertificateViewer";
import AIGuidePanel from "./components/shared/AIGuidePanel";

function App() {
  const { currentScene, setGuestMode } = useAppStore();

  useEffect(() => {
    setGuestMode?.();

    if ("xr" in navigator) {
      navigator.xr.isSessionSupported("immersive-vr").then((supported) => {
        useAppStore.getState().updateSettings?.({ vrSupported: supported });
      });
    }
  }, []);

  const renderScene = () => {
    switch (currentScene) {
      case "menu":
        return <MainMenu />;
      case "selector":
        return <ScenarioSelector />;
      case "visual":
        return <VisualImpairmentScene />;
      case "hearing":
        return <HearingLossScene />;
      case "motor":
        return <MotorDisabilityScene />;
      case "ar":
        return <ARAccessibilityAuditor />;
      case "dashboard":
        return <ImpactDashboard />;
      case "certificate":
        return <CertificateViewer />;
      case "landing":
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <motion.div
        key={currentScene}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full h-full"
      >
        {renderScene()}
      </motion.div>

      {currentScene !== "landing" && currentScene !== "menu" && (
        <AIGuidePanel />
      )}
    </div>
  );
}

export default App;