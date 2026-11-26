import { queryClient } from "@/lib/queryCache";
import { Box, Presence, FadeBox } from "@/components/ui/native";
import { useState } from "react";
import { useNavigate } from "@/navigators/routeAdapter";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { updateUserProfile } from "@/services/profile-service";
import StepIntro from "@/components/setup/StepIntro";
import StepName from "@/components/setup/StepName";
import StepPhysical from "@/components/setup/StepPhysical";
import StepStyle from "@/components/setup/StepStyle";
import StepLocation from "@/components/setup/StepLocation";
import StepGeo from "@/components/setup/StepGeo";
import StepReview from "@/components/setup/StepReview";
import { toast } from "@/platform/notifications";
export default function ProfileSetup() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [state, setState] = useState<any>({
    name: {},
    physical: {},
    style: {},
    location: {},
    geo: {},
  });
  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);
  const update = (section: string, data: any) => {
    setState((prev: any) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };
  const handleSubmit = async () => {
    if (!user) {
      toast.error(t("profile.toast_must_be_logged_in"));
      return;
    }
    const payload = {
      ...state.name,
      ...state.physical,
      ...state.style,
      ...state.location,
      ...state.geo,
    };
    const { error } = await updateUserProfile(user.id, payload);
    if (error) return toast.error(error.message);
    toast.success(t("profile.toast_profile_completed"));
    await queryClient.invalidateQueries({
      queryKey: ["profile-completion", user.id],
    });
  };
  const steps = [
    <StepIntro onNext={next} />,
    <StepName data={state.name} onNext={update} next={next} />,
    <StepPhysical data={state.physical} onNext={update} next={next} />,
    <StepStyle data={state.style} onNext={update} next={next} back={back} />,
    <StepLocation
      data={state.location}
      onNext={update}
      next={next}
      back={back}
    />,
    <StepGeo data={state.geo} onNext={update} next={next} back={back} />,
    <StepReview data={state} onSubmit={handleSubmit} back={back} />,
  ];
  return (
    <Box className="flex-1 flex flex-col justify-between px-6 py-10">
      {/* Animated Step */}
      <Box className="flex-1 flex items-center flex-row">
        <Presence mode="wait">
          <FadeBox
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {steps[step]}
          </FadeBox>
        </Presence>
      </Box>

      {/* Progress Bar */}
      <Box className="flex gap-2 mt-6 flex-row">
        {steps.map((_, i) => (
          <Box
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${i === step ? "bg-primary w-8" : "bg-muted w-4"}`}
          />
        ))}
      </Box>
    </Box>
  );
}
