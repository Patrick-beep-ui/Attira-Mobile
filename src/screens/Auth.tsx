import { Box, TextLabel, Form, Tap } from "@/components/ui/native";
import { useState } from "react";
import { useNavigate } from "@/navigators/routeAdapter";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/platform/notifications";
export default function Auth() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!email.includes("@") || (mode !== "forgot" && password.length < 6))
      return toast.error(t("common.error"));
    setLoading(true);
    if (mode === "forgot") {
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success(t("auth.check_email_reset"));
      setMode("login");
      return;
    }
    const action = mode === "login" ? signIn : signUp;
    const { error } = await action(email, password);
    setLoading(false);
    if (error) return toast.error(error.message);
    if (mode === "signup") {
      toast.success(t("auth.check_email_confirm"));
    } else {
      // RootNavigator reacts to the new session and profile state.
    }
  };
  const getTitle = () => {
    if (mode === "forgot") return t("auth.reset_password");
    if (mode === "login") return t("auth.welcome_back");
    return t("auth.create_account");
  };
  const getSubtitle = () => {
    if (mode === "forgot") return t("auth.forgot_subtitle");
    if (mode === "login") return t("auth.sign_in_subtitle");
    return t("auth.sign_up_subtitle");
  };
  const getButtonText = () => {
    if (loading) return t("auth.loading");
    if (mode === "forgot") return t("auth.send_reset_link");
    if (mode === "login") return t("auth.sign_in");
    return t("auth.create_account_btn");
  };
  return (
    <Box className="flex flex-1 flex-col justify-center bg-background px-6">
      <Box className="mb-12">
        <TextLabel className="text-caption uppercase tracking-widest text-primary">
          Attira
        </TextLabel>
        <TextLabel className="mt-2 font-display text-display-1 text-foreground">
          {getTitle()}
        </TextLabel>
        <TextLabel className="mt-2 text-body text-muted-foreground">
          {getSubtitle()}
        </TextLabel>
      </Box>

      <Form onSubmit={handleSubmit} className="space-y-4">
        <Box className="space-y-2">
          <Label className="text-body-sm text-muted-foreground">
            {t("auth.email")}
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.email_placeholder")}
            className="rounded-xl border-border bg-card py-5"
          />
        </Box>

        {mode !== "forgot" && (
          <Box className="space-y-2">
            <Label className="text-body-sm text-muted-foreground">
              {t("auth.password")}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.password_placeholder")}
              className="rounded-xl border-border bg-card py-5"
            />
          </Box>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-6 text-body font-medium"
        >
          {getButtonText()}
        </Button>
      </Form>

      <Box className="mt-6 space-y-3 text-center">
        {mode === "login" && (
          <>
            <Tap
              onPress={() => setMode("forgot")}
              className="text-body-sm text-muted-foreground hover:text-foreground"
            >
              {t("auth.forgot_password")}
            </Tap>
            <TextLabel className="text-body-sm text-muted-foreground">
              {t("auth.no_account")}{" "}
              <Tap
                onPress={() => setMode("signup")}
                className="font-medium text-primary"
              >
                {t("auth.sign_up")}
              </Tap>
            </TextLabel>
          </>
        )}
        {mode === "signup" && (
          <TextLabel className="text-body-sm text-muted-foreground">
            {t("auth.have_account")}{" "}
            <Tap
              onPress={() => setMode("login")}
              className="font-medium text-primary"
            >
              {t("auth.sign_in_link")}
            </Tap>
          </TextLabel>
        )}
        {mode === "forgot" && (
          <Tap
            onPress={() => setMode("login")}
            className="text-body-sm font-medium text-primary"
          >
            {t("auth.back_to_signin")}
          </Tap>
        )}
      </Box>
    </Box>
  );
}
