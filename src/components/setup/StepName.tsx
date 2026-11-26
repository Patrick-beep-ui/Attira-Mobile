import { Box, TextLabel, Input } from "@/components/ui/native";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TagChip } from "@/components/TagChip";
import { useLanguage } from "@/context/LanguageContext";
import {
  checkUsernameAvailable,
  GENDER_OPTIONS,
  GenderType,
} from "@/services/profile-service";
import { Loader2 } from "@/components/ui/icons";
export default function StepName({ data, onNext, next }: any) {
  const { t, tValue } = useLanguage();
  const [firstName, setFirstName] = useState(data.first_name || "");
  const [lastName, setLastName] = useState(data.last_name || "");
  const [username, setUsername] = useState(data.username || "");
  const [gender, setGender] = useState<GenderType | "">(data.gender || "");
  const [checking, setChecking] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [usernameVerified, setUsernameVerified] = useState(false);
  const handleContinue = async () => {
    if (!firstName || !lastName || !username || username.length < 3) return;
    setChecking(true);
    setUsernameError("");
    setUsernameVerified(false);
    try {
      const available = await checkUsernameAvailable(username);
      if (!available) {
        setUsernameError(t("step_name.username_taken"));
        setChecking(false);
        return;
      }
      setUsernameVerified(true);
      onNext("name", {
        first_name: firstName,
        last_name: lastName,
        username: username.toLowerCase(),
        gender: gender || undefined,
      });
      next();
    } catch (error) {
      setUsernameError(t("step_name.check_error"));
    } finally {
      setChecking(false);
    }
  };
  const isValid = firstName && lastName && username.length >= 3;
  return (
    <Box className="space-y-6">
      <TextLabel className="font-display text-display-3">
        {t("step_name.title")}
      </TextLabel>
      <TextLabel className="text-muted-foreground text-sm">
        {t("step_name.subtitle")}
      </TextLabel>

      <Input
        className="rounded-xl border border-border bg-card w-full py-3 px-3"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder={t("step_name.first_name_placeholder")}
      />

      <Input
        className="rounded-xl border border-border bg-card w-full py-3 px-3"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder={t("step_name.last_name_placeholder")}
      />

      <Box>
        <Input
          className={`rounded-xl border border-border bg-card w-full py-3 px-3 ${usernameError ? "border-red-500" : ""}`}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""));
            setUsernameError("");
            setUsernameVerified(false);
          }}
          placeholder={t("step_name.username_placeholder")}
        />
        {checking && (
          <Box className="flex items-center gap-2 mt-2 text-sm text-muted-foreground flex-row">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("step_name.checking")}
          </Box>
        )}
        {usernameError && (
          <TextLabel className="text-red-500 text-sm mt-2">
            {usernameError}
          </TextLabel>
        )}
      </Box>

      <Box>
        <TextLabel className="text-sm font-medium mb-2">
          {t("step_name.gender")}
        </TextLabel>
        <Box className="flex flex-wrap gap-2 flex-row">
          {GENDER_OPTIONS.map((g) => (
            <TagChip
              key={g}
              label={tValue("genders", g)}
              active={gender === g}
              onClick={() => setGender(gender === g ? "" : g)}
            />
          ))}
        </Box>
      </Box>

      <Button
        onPress={handleContinue}
        disabled={!isValid || checking}
        className="w-full"
      >
        {checking ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          t("step_name.continue")
        )}
      </Button>
    </Box>
  );
}
