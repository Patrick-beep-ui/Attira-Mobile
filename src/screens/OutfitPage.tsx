import { Box, TextLabel, Picture, Composition } from "@/components/ui/native";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@/navigators/routeAdapter";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { AiBadge } from "@/components/AiBadge";
import { TagChip } from "@/components/TagChip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getOutfitById,
  getOutfitItems,
  shareOutfit,
  getCommentCount,
  toggleLike,
  getLikeCount,
  getUserLikes,
} from "@/services/outfit-service";
import { CommentDialog } from "@/components/CommentDialog";
import { getProfile } from "@/services/profile-service";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  User,
  X,
  Heart,
  MessageCircle,
  Share2,
  Globe,
  Lock,
} from "@/components/ui/icons";
import { toast } from "@/platform/notifications";
interface OutfitData {
  id: string;
  user_id: string;
  occasion: string | null;
  formality: string | null;
  confidence: number | null;
  styling_notes: string | null;
  created_at: string;
  composition_url: string | null;
  is_public: boolean;
}
interface ProfileData {
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  profile_picture_url: string | null;
  [key: string]: any;
}
interface OutfitItem {
  wardrobe_item_id: string;
  wardrobe_items: any;
}
function adjustSvg(svgString: string): string {
  const adjusted = svgString
    .replace(/width="500"/g, 'width="100%"')
    .replace(/height="600"/g, 'height="100%"');
  if (!adjusted.includes('style="background-color')) {
    return adjusted.replace("<svg", '<svg style="background-color: #DEDAD9"');
  }
  return adjusted;
}
export default function OutfitPage() {
  const { id } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, tValue, language } = useLanguage();
  const [outfit, setOutfit] = useState<OutfitData | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<ProfileData | null>(
    null,
  );
  const [items, setItems] = useState<any[]>([]);
  const [wardrobeItems, setWardrobeItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [liking, setLiking] = useState(false);
  useEffect(() => {
    if (!id) return;
    const fetchOutfit = async () => {
      setLoading(true);
      const { data, error } = await getOutfitById(id);
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setOutfit(data as OutfitData);
      const profile = await getProfile((data as OutfitData).user_id);
      setCreatorProfile(profile as unknown as ProfileData | null);
      const { data: itemsData } = await getOutfitItems(id);
      setItems(itemsData || []);
      const wardrobeItemsList =
        itemsData
          ?.filter((item) => item.wardrobe_item)
          .map((item) => item.wardrobe_item) || [];
      setWardrobeItems(wardrobeItemsList);
      const { count: lc } = await getLikeCount(id);
      setLikeCount(lc || 0);
      const { count: cc } = await getCommentCount(id);
      setCommentCount(cc || 0);
      if (user) {
        const likes = await getUserLikes(user.id, [id]);
        setIsLiked(likes.includes(id));
      }
      setLoading(false);
    };
    fetchOutfit();
  }, [id, user]);
  if (loading) {
    return (
      <AppShell>
        <HeaderBar title="Outfit" showBack />
        <Box className="p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-96 rounded-lg" />
          <Box className="space-y-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </Box>
        </Box>
      </AppShell>
    );
  }
  if (notFound || !outfit) {
    return (
      <AppShell>
        <HeaderBar title="Outfit" showBack />
        <Box className="flex h-[60vh] items-center justify-center flex-row">
          <Box className="text-center">
            <TextLabel className="text-body text-muted-foreground">
              Outfit not found
            </TextLabel>
            <Button
              variant="outline"
              onPress={() => navigate("/")}
              className="mt-4"
            >
              Go Home
            </Button>
          </Box>
        </Box>
      </AppShell>
    );
  }
  const compositionUrl = outfit.composition_url;
  const hasCanvas = !!compositionUrl;
  return (
    <AppShell>
      <HeaderBar title="Outfit" showBack />

      <Box className="space-y-6 px-4 pb-8 pt-14">
        {/* User Info */}
        <Box className="flex items-center gap-3 flex-row">
          {creatorProfile?.profile_picture_url ? (
            <Picture
              src={creatorProfile.profile_picture_url}
              alt="Profile"
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <Box className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center flex-row">
              <User className="h-6 w-6 text-primary" />
            </Box>
          )}
          <Box>
            <TextLabel className="text-body font-medium text-foreground">
              {creatorProfile?.username ||
                creatorProfile?.first_name ||
                "Anonymous"}
            </TextLabel>
            <TextLabel className="text-caption text-muted-foreground">
              {new Date(outfit.created_at).toLocaleDateString()}
              {!outfit.is_public && " · Private"}
            </TextLabel>
          </Box>
        </Box>

        {/* Outfit Preview */}
        <Box className="aspect-[0.833333] rounded-xl overflow-hidden bg-[#DEDAD9]">
          {hasCanvas ? (
            <Composition
              className="w-full h-full overflow-hidden"
              xml={adjustSvg(
                decodeURIComponent(
                  compositionUrl!.replace("data:image/svg+xml;utf8,", ""),
                ),
              )}
            />
          ) : (
            <Box className="w-full h-full flex items-center justify-center flex-row">
              <Box className="grid grid-cols-2 gap-2">
                {items.slice(0, 4).map((item) => (
                  <Box
                    key={item.wardrobe_item_id}
                    className="h-24 w-20 rounded-lg flex items-center justify-center flex-row"
                    style={{
                      backgroundColor: item.wardrobe_items?.color || "#eee",
                    }}
                  >
                    {item.wardrobe_items?.image_url && (
                      <Picture
                        src={item.wardrobe_items.image_url}
                        alt={item.wardrobe_items.name}
                        className="h-full w-full object-cover rounded-lg"
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Occasion & Formality */}
        <Box className="flex flex-wrap gap-2 flex-row">
          {outfit.occasion && (
            <TagChip label={tValue("occasions", outfit.occasion)} active />
          )}
          {outfit.formality && (
            <TagChip
              label={tValue("formality", outfit.formality)}
              active={false}
            />
          )}
        </Box>

        {/* Confidence */}
        {outfit.confidence && (
          <AiBadge label={`${Math.round(outfit.confidence * 100)}% match`} />
        )}

        {/* Styling Notes */}
        {outfit.styling_notes && (
          <Box className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <AiBadge label="Styling Notes" className="mb-2" />
            <TextLabel className="text-body text-foreground">
              {outfit.styling_notes}
            </TextLabel>
          </Box>
        )}

        {/* Items */}
        <Box className="space-y-3">
          <TextLabel className="text-caption font-medium uppercase text-muted-foreground">
            {t("outfit_page.items_in_outfit")}
          </TextLabel>
          {wardrobeItems.length > 0 ? (
            wardrobeItems.map((item: any) => (
              <Box
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 flex-row"
              >
                {item.image_url ? (
                  <Picture
                    src={item.image_url}
                    alt={item.name}
                    className="h-12 w-12 rounded-lg border border-border object-cover"
                  />
                ) : (
                  <Box
                    className="h-12 w-12 rounded-lg border border-border"
                    style={{ backgroundColor: item.color || "#eee" }}
                  />
                )}
                <Box>
                  <TextLabel className="text-body font-medium text-foreground">
                    {item.name}
                  </TextLabel>
                  <TextLabel className="text-caption uppercase text-muted-foreground">
                    {item.clothing_categories?.name
                      ? tValue("categories", item.clothing_categories.name)
                      : "Clothing"}
                  </TextLabel>
                </Box>
              </Box>
            ))
          ) : (
            <TextLabel className="text-body-sm text-muted-foreground">
              {t("outfit_page.no_item_details")}
            </TextLabel>
          )}
        </Box>

        {/* Actions */}
        <Box className="flex gap-3 flex-row">
          <Button
            variant="outline"
            className={`flex-1 gap-2 ${isLiked ? "text-red-500 border-red-200" : ""}`}
            onPress={async () => {
              if (!user || liking) return;
              setLiking(true);
              const wasLiked = isLiked;
              setIsLiked(!wasLiked);
              setLikeCount(wasLiked ? likeCount - 1 : likeCount + 1);
              try {
                await toggleLike(user.id, outfit.id);
              } catch {
                setIsLiked(wasLiked);
                setLikeCount(likeCount);
              }
              setLiking(false);
            }}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            {likeCount > 0 ? likeCount : t("home.like")}
          </Button>
          {outfit.is_public && (
            <CommentDialog
              outfitId={outfit.id}
              outfitOwnerId={outfit.user_id}
              commentCount={commentCount}
              onCommentAdded={() => setCommentCount((c) => c + 1)}
            />
          )}
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onPress={async () => {
              await shareOutfit(compositionUrl, outfit.id, language);
            }}
          >
            <Share2 className="h-4 w-4" />
            {t("outfit.share")}
          </Button>
        </Box>
      </Box>
    </AppShell>
  );
}
