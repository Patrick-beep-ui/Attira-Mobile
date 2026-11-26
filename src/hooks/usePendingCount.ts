import { useEffect, useState } from "react";
import { getPendingActionsCount } from "@/services/pendingQueue";
import { useOnlineStatus } from "./useOnlineStatus";
export function usePendingCount() {
  const [count, setCount] = useState(0);
  const { isOnline } = useOnlineStatus();
  useEffect(() => {
    let active = true;
    const update = async () => {
      const count = await getPendingActionsCount();
      if (active) setCount(count);
    };
    void update();
    const interval = setInterval(update, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [isOnline]);
  return { count };
}
