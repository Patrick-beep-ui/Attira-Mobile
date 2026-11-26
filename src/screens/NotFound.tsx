import { Box, TextLabel, Tap } from "@/components/ui/native";
import { useNavigate, useLocation } from "@/navigators/routeAdapter";
import { useEffect } from "react";
const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);
  return (
    <Box className="flex flex-1 items-center justify-center bg-muted flex-row">
      <Box className="text-center">
        <TextLabel className="font-display mb-4 text-4xl font-bold">
          404
        </TextLabel>
        <TextLabel className="mb-4 text-xl text-muted-foreground">
          Oops! Page not found
        </TextLabel>
        <Tap
          onPress={() => navigate("/")}
          className="text-primary underline hover:text-primary/90"
        >
          Return to Home
        </Tap>
      </Box>
    </Box>
  );
};
export default NotFound;
