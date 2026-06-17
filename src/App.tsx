import { AnimatePresence, motion } from "framer-motion";
import { useTripStore } from "@/store/useTripStore";
import { AppShell } from "@/components/AppShell";
import PreTripPage from "@/pages/PreTripPage";
import DrivingPage from "@/pages/DrivingPage";
import PostTripPage from "@/pages/PostTripPage";
import RecordPage from "@/pages/RecordPage";
import RecordListPage from "@/pages/RecordListPage";
import SupervisorDashboard from "@/pages/SupervisorDashboard";

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function App() {
  const scene = useTripStore((s) => s.scene);
  const viewMode = useTripStore((s) => s.viewMode);

  const viewKey =
    viewMode === "driver"
      ? `driver-${scene}`
      : viewMode === "detail"
      ? `list-detail`
      : viewMode;

  function renderView() {
    if (viewMode === "supervisor") return <SupervisorDashboard />;
    if (viewMode === "list" || viewMode === "detail") return <RecordListPage />;

    switch (scene) {
      case "pre-trip":
        return <PreTripPage />;
      case "driving":
        return <DrivingPage />;
      case "post-trip":
        return <PostTripPage />;
      case "completed":
      default:
        return <RecordPage />;
    }
  }

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={viewKey}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="h-full w-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
