import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { LanguageProvider } from "@/context/LanguageContext";
import Onboarding from "@/screens/Onboarding";
import Auth from "@/screens/Auth";
import StepPhysical from "@/components/setup/StepPhysical";
import StepName from "@/components/setup/StepName";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  Tap,
  TextLabel,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/native";
import es from "@/i18n/es.json";
const mockNavigate = jest.fn();
const mockSignIn = jest.fn().mockResolvedValue({ error: null });
const mockSignUp = jest.fn().mockResolvedValue({ error: null });
const mockReset = jest.fn().mockResolvedValue({ error: null });
const mockCheckUsername = jest.fn().mockResolvedValue(true);
jest.mock("@/navigators/routeAdapter", () => ({
  useNavigate: () => mockNavigate,
}));
jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    resetPassword: mockReset,
  }),
}));
jest.mock("@/services/profile-service", () => ({
  checkUsernameAvailable: (name: string) => mockCheckUsername(name),
  GENDER_OPTIONS: ["female", "male", "other"],
}));
function app(node: React.ReactNode) {
  return render(<LanguageProvider>{node}</LanguageProvider>);
}
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});
afterEach(() => {
  act(() => jest.runOnlyPendingTimers());
  jest.useRealTimers();
});
it("walks the original onboarding steps and opens authentication", async () => {
  const screen = app(<Onboarding />);
  await waitFor(() =>
    expect(screen.getByText(es.onboarding.step1_title)).toBeTruthy(),
  );
  fireEvent.press(screen.getByText(es.onboarding.continue));
  expect(screen.getByText(es.onboarding.step2_title)).toBeTruthy();
  fireEvent.press(screen.getByText(es.onboarding.continue));
  expect(screen.getByText(es.onboarding.step3_title)).toBeTruthy();
  fireEvent.press(screen.getByText(es.onboarding.get_started));
  expect(mockNavigate).toHaveBeenCalledWith("/auth");
});
it("submits native auth inputs and preserves password recovery mode", async () => {
  const screen = app(<Auth />);
  await act(async () => {});
  fireEvent.changeText(
    screen.getByPlaceholderText(es.auth.email_placeholder),
    "patrick@example.com",
  );
  fireEvent.changeText(
    screen.getByPlaceholderText(es.auth.password_placeholder),
    "example-password",
  );
  fireEvent.press(screen.getByText(es.auth.sign_in));
  await waitFor(() =>
    expect(mockSignIn).toHaveBeenCalledWith(
      "patrick@example.com",
      "example-password",
    ),
  );
  fireEvent.press(screen.getByText(es.auth.forgot_password));
  fireEvent.press(screen.getByText(es.auth.send_reset_link));
  await waitFor(() =>
    expect(mockReset).toHaveBeenCalledWith("patrick@example.com"),
  );
});
it("keeps measurement validation and the profile-step payload", async () => {
  const update = jest.fn(),
    next = jest.fn();
  const screen = app(<StepPhysical data={{}} onNext={update} next={next} />);
  await act(async () => {});
  fireEvent.changeText(
    screen.getByPlaceholderText(es.step_physical.height_placeholder),
    "100",
  );
  fireEvent.changeText(
    screen.getByPlaceholderText(es.step_physical.weight_placeholder),
    "70",
  );
  fireEvent.press(screen.getByText(es.step_physical.continue));
  expect(next).not.toHaveBeenCalled();
  fireEvent.changeText(
    screen.getByPlaceholderText(es.step_physical.height_placeholder),
    "175",
  );
  fireEvent.press(screen.getByText(es.step_physical.continue));
  expect(update).toHaveBeenCalledWith("physical", {
    height_cm: 175,
    weight_kg: 70,
  });
  expect(next).toHaveBeenCalledTimes(1);
});
it("checks username availability before advancing from the name step", async () => {
  const update = jest.fn(),
    next = jest.fn();
  const screen = app(<StepName data={{}} onNext={update} next={next} />);
  await act(async () => {});
  fireEvent.changeText(
    screen.getByPlaceholderText(es.step_name.first_name_placeholder),
    "Patrick",
  );
  fireEvent.changeText(
    screen.getByPlaceholderText(es.step_name.last_name_placeholder),
    "Solis",
  );
  fireEvent.changeText(
    screen.getByPlaceholderText(es.step_name.username_placeholder),
    "Patrick_Solis",
  );
  fireEvent.press(screen.getByText(es.step_name.continue));
  await waitFor(() => expect(next).toHaveBeenCalledTimes(1));
  expect(mockCheckUsername).toHaveBeenCalledWith("Patrick_Solis");
  expect(update).toHaveBeenCalledWith(
    "name",
    expect.objectContaining({
      username: "patrick_solis",
      first_name: "Patrick",
      last_name: "Solis",
    }),
  );
});
it("opens and dismisses a native modal through the original compound API", () => {
  const screen = render(
    <Dialog>
      <DialogTrigger asChild>
        <Tap>
          <TextLabel>Open detail</TextLabel>
        </Tap>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Detail</DialogTitle>
      </DialogContent>
    </Dialog>,
  );
  expect(screen.queryByText("Detail")).toBeNull();
  fireEvent.press(screen.getByText("Open detail"));
  expect(screen.getByText("Detail")).toBeTruthy();
  fireEvent.press(screen.getAllByLabelText("Cerrar / Close")[0]);
  expect(screen.queryByText("Detail")).toBeNull();
});
it("shows native select choices and preserves the selected label", () => {
  function Sample() {
    const [value, setValue] = React.useState("es");
    return (
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="es">Español</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    );
  }
  const screen = render(<Sample />);
  fireEvent.press(screen.getByText("Español"));
  fireEvent.press(screen.getByText("English"));
  expect(screen.getByText("English")).toBeTruthy();
  expect(screen.queryByText("Español")).toBeNull();
});
