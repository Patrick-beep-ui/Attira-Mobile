import { useAuth } from "@/context/AuthContext";
import { Box, TextLabel, Form } from "@/components/ui/native";
import { useState } from "react";
import { useNavigate } from "@/navigators/routeAdapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/platform/notifications";
export default function ResetPassword() {
  const { finishRecovery } = useAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (password.length < 6)
      return toast.error("Password must contain at least 6 characters");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated!");
    finishRecovery();
  };
  return (
    <Box className="flex flex-1 flex-col justify-center bg-background px-6">
      <Box className="mb-8">
        <TextLabel className="text-caption uppercase tracking-widest text-primary">
          Attira
        </TextLabel>
        <TextLabel className="mt-2 font-display text-display-1 text-foreground">
          New Password
        </TextLabel>
        <TextLabel className="mt-2 text-body text-muted-foreground">
          Choose a new password for your account.
        </TextLabel>
      </Box>

      <Form onSubmit={handleSubmit} className="space-y-4">
        <Box className="space-y-2">
          <Label className="text-body-sm text-muted-foreground">
            New Password
          </Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-xl border-border bg-card py-5"
          />
        </Box>
        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl py-6 text-body font-medium"
        >
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </Form>
    </Box>
  );
}
