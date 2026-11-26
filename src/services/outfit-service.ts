import * as Sharing from "expo-sharing";
import { File, Paths } from "expo-file-system";
import * as Crypto from "expo-crypto";
import { supabaseUrl } from "@/config/supabase";
import { Share } from "react-native";
import { supabase } from "@/integrations/supabase/client";

const SHARE_MESSAGES: Record<string, { title: string; text: string }> = {
  en: {
    title: "My Attira Outfit",
    text: "Look at my outfit made with Attira 🤩✨",
  },
  es: {
    title: "Mi Outfit de Attira",
    text: "Mira mi outfit creado con Attira 🤩✨",
  },
};

const APP_URL = "https://app.attiraai.com";

export async function shareOutfit(
  compositionUrl: string | null,
  outfitId?: string,
  language?: string,
): Promise<boolean> {
  const messages = SHARE_MESSAGES[language === "es" ? "es" : "en"];
  const link = outfitId ? `${APP_URL}/outfit/${outfitId}` : APP_URL;
  if (outfitId && (await Sharing.isAvailableAsync())) {
    let image: Awaited<ReturnType<typeof File.downloadFileAsync>> | undefined;
    try {
      const downloaded = await File.downloadFileAsync(
        `${supabaseUrl}/functions/v1/og?mode=image&outfit_id=${encodeURIComponent(outfitId)}`,
        new File(Paths.cache, `${Crypto.randomUUID()}.png`),
      );
      image = downloaded;
      await Sharing.shareAsync(downloaded.uri, {
        mimeType: "image/png",
        dialogTitle: messages.title,
        UTI: "public.png",
      });
      return true;
    } catch {
      /* Retain text and the public outfit URL if image sharing is unavailable. */
    } finally {
      if (image?.exists) image.delete();
    }
  }
  const result = await Share.share({
    title: messages.title,
    message: `${messages.text}\n${link}`,
  });
  return result.action === Share.sharedAction;
}

export async function publishOutfit(userId: string, outfitId: string) {
  const { error } = await supabase
    .from("outfits")
    .update({
      is_public: true,
      published_at: new Date().toISOString(),
    })
    .eq("id", outfitId)
    .eq("user_id", userId);

  return { error };
}

export async function unpublishOutfit(userId: string, outfitId: string) {
  const { error } = await supabase
    .from("outfits")
    .update({
      is_public: false,
      published_at: null,
    })
    .eq("id", outfitId)
    .eq("user_id", userId);

  return { error };
}

export async function getUserOutfits(userId: string) {
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getPublicOutfits(limit = 20, offset = 0) {
  const { data: outfits, error } = await supabase
    .from("outfits")
    .select("*, outfit_likes(count), outfit_comments(count)")
    .eq("is_public", true)
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !outfits) return { data: null, error };

  const userIds = [...new Set(outfits.map((o) => o.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, username, first_name, last_name, profile_picture_url")
    .in("user_id", userIds);

  const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

  const data = outfits.map((o) => ({
    ...o,
    profiles: profileMap.get(o.user_id) || null,
    like_count: o.outfit_likes?.[0]?.count || 0,
    comment_count: o.outfit_comments?.[0]?.count || 0,
  }));

  return { data, error: null };
}

export async function toggleLike(userId: string, outfitId: string) {
  const { data: existing } = await supabase
    .from("outfit_likes")
    .select("id")
    .eq("user_id", userId)
    .eq("outfit_id", outfitId)
    .single();

  if (existing) {
    await supabase
      .from("outfit_likes")
      .delete()
      .eq("user_id", userId)
      .eq("outfit_id", outfitId);
    return { liked: false };
  } else {
    await supabase
      .from("outfit_likes")
      .insert({ user_id: userId, outfit_id: outfitId });
    return { liked: true };
  }
}

export async function getLikeCount(outfitId: string) {
  const { count, error } = await supabase
    .from("outfit_likes")
    .select("*", { count: "exact" })
    .eq("outfit_id", outfitId);

  return { count: count || 0, error };
}

export async function getUserLikes(userId: string, outfitIds: string[]) {
  const { data } = await supabase
    .from("outfit_likes")
    .select("outfit_id")
    .eq("user_id", userId)
    .in("outfit_id", outfitIds);

  return data?.map((d) => d.outfit_id) || [];
}

export async function getOutfitById(outfitId: string) {
  const { data, error } = await supabase
    .from("outfits")
    .select("*")
    .eq("id", outfitId)
    .single();

  return { data, error };
}

export async function getOutfitItems(outfitId: string) {
  const { data: outfitItems, error } = await supabase
    .from("outfit_items")
    .select("wardrobe_item_id, layer_order")
    .eq("outfit_id", outfitId);

  if (error || !outfitItems) return { data: [], error };

  const wardrobeIds = outfitItems.map((item) => item.wardrobe_item_id);

  const { data: wardrobeItems } = await supabase
    .from("wardrobe_items")
    .select("*, clothing_categories(name)")
    .in("id", wardrobeIds);

  const itemsWithDetails = outfitItems.map((oi) => ({
    ...oi,
    wardrobe_item:
      wardrobeItems?.find((w) => w.id === oi.wardrobe_item_id) || null,
  }));

  return { data: itemsWithDetails, error: null };
}

export interface OutfitComment {
  id: string;
  user_id: string;
  outfit_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export async function addComment(
  userId: string,
  outfitId: string,
  content: string,
) {
  const { data, error } = await supabase
    .from("outfit_comments")
    .insert({ user_id: userId, outfit_id: outfitId, content: content.trim() })
    .select("*")
    .single();

  return { data: data as OutfitComment | null, error };
}

export async function deleteComment(commentId: string, userId: string) {
  const { error } = await supabase
    .from("outfit_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", userId);

  return { error };
}

export async function deleteCommentAsOwner(
  commentId: string,
  outfitOwnerId: string,
) {
  const { data: comment, error: fetchError } = await supabase
    .from("outfit_comments")
    .select("outfit_id")
    .eq("id", commentId)
    .single();

  if (fetchError || !comment) return { error: fetchError };

  const { error } = await supabase
    .from("outfit_comments")
    .delete()
    .eq("id", commentId);

  return { error };
}

export async function getOutfitComments(outfitId: string) {
  const { data, error } = await supabase
    .from("outfit_comments")
    .select("*")
    .eq("outfit_id", outfitId)
    .order("created_at", { ascending: true });

  if (error || !data) return { data: null, error };
  const ids = [...new Set(data.map((comment) => comment.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id,username,first_name,last_name")
    .in("user_id", ids);
  return {
    data: data.map((comment) => ({
      ...comment,
      profiles:
        profiles?.find((profile) => profile.user_id === comment.user_id) ??
        null,
    })) as OutfitComment[],
    error: null,
  };
}

export async function getCommentCount(outfitId: string) {
  const { count, error } = await supabase
    .from("outfit_comments")
    .select("*", { count: "exact" })
    .eq("outfit_id", outfitId);

  return { count: count || 0, error };
}
