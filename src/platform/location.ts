import * as Location from "expo-location";
export async function getCurrentPosition(
  success: (position: {
    coords: { latitude: number; longitude: number };
  }) => void,
  failure: () => void,
) {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      failure();
      return;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    success(location);
  } catch {
    failure();
  }
}
