import {
  Box,
  Picture,
  Input,
  TextLabel,
  Composition,
} from "@/components/ui/native";
import { pickImage, type NativeImage } from "@/platform/media";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "@/navigators/routeAdapter";
import { Button } from "@/components/ui/button";
import { TagChip } from "@/components/TagChip";
import {
  User,
  Loader2,
  Edit2,
  Image as ImageIcon,
  Camera,
  Upload,
  X,
} from "@/components/ui/icons";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  getProfileByUsername,
  getPublicOutfitsByUser,
  updateProfileBasic,
  uploadProfilePicture,
  deleteProfilePicture,
  GENDER_OPTIONS,
  GenderType,
  PublicProfile,
  PublicOutfit,
} from "@/services/profile-service";
import { toast } from "@/platform/notifications";
export default function ProfilePage() {
  const { t, tValue } = useLanguage();
  const { username } = useParams<{
    username: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwnProfile = !username || (user && username === "me");
  const isViewingOthers = !!username && username !== "me";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [outfits, setOutfits] = useState<PublicOutfit[]>([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    profile_picture_url: "",
  });
  const [gender, setGender] = useState<GenderType | "">("");
  const [savedGender, setSavedGender] = useState<GenderType | "">("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<NativeImage | null>(null);
  useEffect(() => {
    loadProfile();
  }, [username, user]);
  const loadProfile = async () => {
    setLoading(true);
    setGender("");
    setSavedGender("");
    try {
      const targetUsername = !username || username === "me" ? null : username;
      let profileData: PublicProfile | null = null;
      if (targetUsername) {
        profileData = await getProfileByUsername(targetUsername);
      } else if (user) {
        const { getProfile } = await import("@/services/profile-service");
        const fullProfile = await getProfile(user.id);
        if (fullProfile) {
          const rawGender = fullProfile.gender as GenderType | null;
          const validGender =
            rawGender && GENDER_OPTIONS.includes(rawGender) ? rawGender : "";
          setGender(validGender);
          setSavedGender(validGender);
          profileData = {
            id: fullProfile.id,
            user_id: fullProfile.user_id,
            username: (fullProfile as any).username || null,
            first_name: fullProfile.first_name || null,
            last_name: fullProfile.last_name || null,
            profile_picture_url: fullProfile.profile_picture_url || null,
            created_at: fullProfile.created_at,
            style_preferences: [],
          };
        }
      }
      if (!profileData) {
        toast.error(
          t("profile.profile") + " " + t("common.error").toLowerCase(),
        );
        navigate("/");
        return;
      }
      setProfile(profileData);
      setFormData({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        username: profileData.username || "",
        profile_picture_url: profileData.profile_picture_url || "",
      });
      const outfitsData = await getPublicOutfitsByUser(profileData.user_id);
      setOutfits(outfitsData);
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error(t("profile.profile") + " " + t("common.error").toLowerCase());
    } finally {
      setLoading(false);
    }
  };
  const handleFileSelect = async () => {
    if (!user) return;
    setUploading(true);
    try {
      const image = await pickImage();
      if (!image) return;
      const url = await uploadProfilePicture(user.id, image);
      setFormData((prev) => ({ ...prev, profile_picture_url: url }));
      setSelectedFile(null);
      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const oldUrl = profile?.profile_picture_url;
      await updateProfileBasic(user.id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        profile_picture_url: formData.profile_picture_url,
        gender: gender || null,
      });
      if (oldUrl && formData.profile_picture_url !== oldUrl) {
        deleteProfilePicture(oldUrl).catch(console.error);
      }
      toast.success(t("common.success") + "!");
      setEditing(false);
      loadProfile();
    } catch (err) {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  };
  const displayName =
    profile?.first_name || profile?.last_name
      ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
      : t("profile.anonymous");
  const handleOutfitClick = (outfitId: string) => {
    navigate(`/outfit/${outfitId}`);
  };
  if (loading) {
    return (
      <Box className="flex flex-1 items-center justify-center flex-row">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Box>
    );
  }
  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <Box className="flex items-center justify-between border-b border-border px-4 py-4 flex-row">
        <Button variant="ghost" size="sm" onPress={() => navigate(-1)}>
          {t("profile.back")}
        </Button>
        {isOwnProfile && !editing && (
          <Button variant="outline" size="sm" onPress={() => setEditing(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            {t("profile.edit")}
          </Button>
        )}
      </Box>

      <Box className="px-4 py-6">
        {/* Profile Header */}
        <Box className="mb-8 text-center">
          {/* Avatar */}
          <Box className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 flex-row">
            {profile?.profile_picture_url ? (
              <Picture
                src={profile.profile_picture_url}
                alt={displayName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-primary" />
            )}
          </Box>

          {editing ? (
            <Box className="space-y-4">
              <Input
                type="text"
                placeholder={t("profile.first_name")}
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-body text-foreground"
              />
              <Input
                type="text"
                placeholder={t("profile.last_name")}
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-body text-foreground"
              />
              <Input
                type="text"
                placeholder={t("profile.username")}
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-body text-foreground"
              />
              <Box>
                <TextLabel className="text-sm font-medium mb-2">
                  {t("profile.gender")}
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
              <Box className="space-y-2">
                <Box className="flex items-center gap-3 flex-row">
                  <Box className="h-16 w-16 rounded-full bg-primary/10 overflow-hidden flex-shrink-0">
                    {formData.profile_picture_url ? (
                      <Picture
                        src={formData.profile_picture_url}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-full w-full p-3 text-primary" />
                    )}
                  </Box>
                  <Box className="flex gap-2 flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onPress={handleFileSelect}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Upload
                    </Button>
                    {formData.profile_picture_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onPress={() =>
                          setFormData({ ...formData, profile_picture_url: "" })
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
              <Box className="flex gap-2 flex-row">
                <Button
                  variant="outline"
                  className="flex-1"
                  onPress={() => {
                    setEditing(false);
                    setFormData({
                      first_name: profile?.first_name || "",
                      last_name: profile?.last_name || "",
                      username: profile?.username || "",
                      profile_picture_url: profile?.profile_picture_url || "",
                    });
                    setGender(savedGender);
                  }}
                >
                  {t("profile.cancel")}
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground"
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t("profile.save")
                  )}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <TextLabel className="font-display text-display-2 text-foreground">
                {displayName}
              </TextLabel>
              {profile?.username && (
                <TextLabel className="text-body text-muted-foreground">
                  @{profile.username}
                </TextLabel>
              )}
              {profile?.style_preferences &&
                profile.style_preferences.length > 0 && (
                  <Box className="mt-3 flex flex-wrap justify-center gap-2 flex-row">
                    {profile.style_preferences.map((style) => (
                      <TagChip key={style} label={style} />
                    ))}
                  </Box>
                )}
              {isOwnProfile && gender && (
                <Box className="mt-3 flex flex-wrap justify-center gap-2 flex-row">
                  <TagChip label={tValue("genders", gender)} active />
                </Box>
              )}
              {isOwnProfile && !gender && (
                <Box className="mt-4">
                  <TextLabel className="text-body-sm text-muted-foreground">
                    {t("profile.gender_nudge")}
                  </TextLabel>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onPress={() => setEditing(true)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    {t("profile.gender")}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* Published Outfits */}
        <Box className="border-t border-border pt-6">
          <TextLabel className="font-display text-display-3 text-foreground mb-4">
            {t("profile.published_looks")}
          </TextLabel>

          {outfits.length === 0 ? (
            <Box className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="mb-2 h-12 w-12 text-muted-foreground" />
              <TextLabel className="text-body text-muted-foreground">
                {t("profile.no_published")}
              </TextLabel>
            </Box>
          ) : (
            <Box className="grid grid-cols-2 gap-3">
              {outfits.map((outfit) => (
                <Box
                  key={outfit.id}
                  onPress={() => handleOutfitClick(outfit.id)}
                  className="aspect-[3/4] cursor-pointer overflow-hidden rounded-lg bg-[#DEDAD9]"
                >
                  {outfit.composition_url?.startsWith("data:image/svg+xml") ? (
                    <Composition
                      className="h-full w-full overflow-hidden"
                      xml={(() => {
                        const svg = decodeURIComponent(
                          outfit.composition_url.replace(
                            "data:image/svg+xml;utf8,",
                            "",
                          ),
                        );
                        return svg
                          .replace(/width="500"/g, 'width="100%"')
                          .replace(/height="600"/g, 'height="100%"')
                          .replace(
                            /<svg/,
                            '<svg style="background-color: #DEDAD9"',
                          );
                      })()}
                    />
                  ) : outfit.composition_url ? (
                    <Picture
                      src={outfit.composition_url}
                      alt="Outfit"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Box className="flex h-full items-center justify-center flex-row">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
