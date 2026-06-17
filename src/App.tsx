import { AnimatePresence, motion } from "framer-motion";
import { useTripStore } from "@/store/useTripStore";
import { AppShell } from "@/components/AppShell";
import PreTripPage from "@/pages/PreTripPage";
import DrivingPage from "@/pages/DrivingPage";
import PostTripPage from "@/pages/PostTripPage";
import RecordPage from "@/pages/RecordPage";

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function App() {
  const scene = useTripStore((s) => s.scene);

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={scene}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="h-full w-full"
        >
          {scene === "pre-trip" && <PreTripPage />}
          {scene === "driving" && <DrivingPage />}
          {scene === "post-trip" && <PostTripPage />}
          {scene === "completed" && <RecordPage />}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
