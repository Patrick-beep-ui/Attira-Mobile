import { TextLabel, Box, Picture, Tap } from "@/components/ui/native";
import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { HeaderBar } from "@/components/HeaderBar";
import { TagChip } from "@/components/TagChip";
import {
  Plus,
  Camera,
  Loader2,
  Upload,
  CheckCircle,
  Circle,
} from "@/components/ui/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "@/platform/notifications";
import { WardrobeItemDetail } from "@/components/WardrobeItemDetails";
import {
  fetchWardrobeItems,
  countWardrobeItems,
} from "@/lib/services/wardrobeService";
import { getWardrobeCap } from "@/config/wardrobe-limits";
import { removeBackground } from "@/services/image-composition-service";
import { CameraCapture, CameraMode } from "@/components/CameraCapture";
import { ColorPicker } from "@/components/ColorPicker";
//import * as ColorThief from "colorthief";
//import { getColorSync } from "colorthief";
//import { rgbToHex } from "@/lib/colorUtils";
import { detectImageColors } from "@/platform/colors";
import {
  pickImage,
  imageAsDataUrl,
  imageBytes,
  bytesToPreview,
  type NativeImage,
} from "@/platform/media";
import * as Crypto from "expo-crypto";
import namer from "color-namer";
// Categories state (fetched from DB)
interface Category {
  id: number;
  name: string;
  parent_category_id: number | null;
}
interface WardrobeItem {
  id: string;
  name: string;
  category_id: number | null;
  color: string | null;
  image_url: string | null;
  processed_image_url?: string | null;
  processing_status?: string | null;
  category_name?: string | null;
  is_available?: boolean | null;
}
type DetectedColor = {
  hex: string;
  name: string;
};
export default function Wardrobe() {
  const { user } = useAuth();
  const { t, tValue } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<number>(0); // 0 = All
  const [availabilityFilter, setAvailabilityFilter] = useState<
    "all" | "available" | "unavailable"
  >("all");
  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailItem, setDetailItem] = useState<WardrobeItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  // Form state
  const [name, setName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [color, setColor] = useState("");
  const [fabric, setFabric] = useState("");
  const [size, setSize] = useState("");
  const [brand, setBrand] = useState("");
  const [imageFile, setImageFile] = useState<NativeImage | null>(null);
  const [originalImageData, setOriginalImageData] = useState<string | null>(
    null,
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<ArrayBuffer | null>(null);
  const [imageProcessing, setImageProcessing] = useState(false);
  // Camera state
  const [cameraMode, setCameraMode] = useState<CameraMode>("flatlay");
  const [cameraOpen, setCameraOpen] = useState(false);
  // Color detection state
  const [detectedColorHex, setDetectedColorHex] = useState<string | null>(null);
  const [colorDetectAttempted, setColorDetectAttempted] = useState(false);
  const [detectedPalette, setDetectedPalette] = useState<DetectedColor[]>([]);
  const queryClient = useQueryClient();
  const hasSubcategories = parentCategoryId
    ? subCategories.some((c) => c.parent_category_id === parentCategoryId)
    : false;
  // Wardrobe items query - cached for 10 minutes
  const {
    data: itemsData,
    isLoading,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["wardrobe", user?.id],
    queryFn: () => fetchWardrobeItems(user!.id),
    enabled: !!user,
  });
  const items = itemsData || [];
  // Total item count (authoritative) — used for the CML upload cap
  const { data: itemCount } = useQuery({
    queryKey: ["wardrobe", user?.id, "count"],
    queryFn: () => countWardrobeItems(user!.id),
    enabled: !!user,
  });
  const wardrobeCap = getWardrobeCap(user?.email);
  // null cap = account is not limited
  const remaining =
    wardrobeCap === null ? null : Math.max(wardrobeCap - (itemCount ?? 0), 0);
  const atLimit = remaining !== null && remaining <= 0;
  // Fail closed: while the cap exists but the count is unknown, block uploads
  const limitUnverified = wardrobeCap !== null && itemCount === undefined;
  // Fetch categories from DB
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("clothing_categories")
        .select("id, name, parent_category_id");
      if (data) {
        setCategories(data);
        setParentCategories(
          data.filter((c: Category) => c.parent_category_id === null),
        );
        setSubCategories(
          data.filter((c: Category) => c.parent_category_id !== null),
        );
      }
    };
    fetchCategories();
  }, []);
  const detectColorFromImage = async (uri: string) => {
    try {
      const palette = await detectImageColors(uri);
      setDetectedPalette(palette);
      if (palette.length) setColor(palette[0].name);
    } catch (error) {
      console.error("Color detection failed", error);
    }
  };
  const handleCameraCapture = async (file: NativeImage) => {
    if (limitUnverified || atLimit)
      return toast.error(t("wardrobe.limit_reached_toast"));
    setImageFile(file);
    setCameraOpen(false);
    setImageProcessing(true);
    let imageData: string;
    try {
      imageData = await imageAsDataUrl(file);
      setOriginalImageData(imageData);
    } catch (error) {
      setImageProcessing(false);
      toast.error(String(error));
      return;
    }
    let preview = file.uri;
    try {
      const bytes = await removeBackground(imageData);
      setProcessedBlob(bytes);
      preview = await bytesToPreview(bytes);
    } catch {
      setProcessedBlob(null);
    } finally {
      setImagePreview(preview);
      await detectColorFromImage(preview);
      setImageProcessing(false);
    }
  };
  const handleFileChange = async () => {
    try {
      const image = await pickImage();
      if (image) await handleCameraCapture(image);
    } catch (error) {
      toast.error(String(error));
    }
  };
  const resetForm = () => {
    setName("");
    setParentCategoryId(null);
    setCategoryId(null);
    setColor("");
    setFabric("");
    setSize("");
    setBrand("");
    setImageFile(null);
    setOriginalImageData(null);
    setImagePreview(null);
    setProcessedImage(null);
    setProcessedBlob(null);
    setCameraOpen(false);
    setDetectedColorHex(null);
    setColorDetectAttempted(false);
  };
  const handleAdd = async () => {
    if (!user) return toast.error("Please sign in first");
    if (limitUnverified || atLimit) {
      return toast.error(t("wardrobe.limit_reached_toast"));
    }
    const hasSubcategory = parentCategoryId
      ? subCategories.some((c) => c.parent_category_id === parentCategoryId)
      : false;
    if (!name || !parentCategoryId)
      return toast.error("Name, and parent category are required");
    if (hasSubcategory && !categoryId)
      return toast.error("subcategory is required for this parent category");
    setSaving(true);
    let image_url: string | null = null;
    // ✅ 1. Upload ORIGINAL image
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("wardrobe-images")
        .upload(path, await imageBytes(imageFile), {
          contentType: imageFile.type,
        });
      if (uploadError) {
        setSaving(false);
        return toast.error("Image upload failed: " + uploadError.message);
      }
      const { data: urlData } = supabase.storage
        .from("wardrobe-images")
        .getPublicUrl(path);
      image_url = urlData.publicUrl;
    }
    // ✅ 2. Insert item FIRST (fast UX)
    const { data: insertedItem, error } = await supabase
      .from("wardrobe_items")
      .insert({
        user_id: user.id,
        name,
        category_id: hasSubcategory ? categoryId : parentCategoryId,
        color: color || null,
        fabric: fabric || null,
        size: size || null,
        brand: brand || null,
        image_url,
        processing_status: "pending",
      })
      .select()
      .single();
    if (error || !insertedItem) {
      setSaving(false);
      return toast.error(error?.message || "Insert failed");
    }
    // ✅ Save references BEFORE reset (resetForm clears originalImageData and processedBlob)
    const imageDataForProcessing = originalImageData;
    const blobForProcessing = processedBlob;
    // ✅ UI responds instantly
    toast.success("Item added!");
    resetForm();
    setAddOpen(false);
    queryClient.invalidateQueries({ queryKey: ["wardrobe", user.id] });
    setSaving(false);
    // 🚀 3. PROCESS IMAGE ASYNC (NON-BLOCKING)
    if (imageDataForProcessing) {
      // Reuse the background-removed blob from the preview so remove.bg is only
      // called once per item. Only re-call it if the preview step failed.
      const processing = blobForProcessing
        ? Promise.resolve(blobForProcessing)
        : removeBackground(imageDataForProcessing);
      processing
        .then(async (blob) => {
          const path = `${user.id}/${Crypto.randomUUID()}.png`;
          const { error: uploadError } = await supabase.storage
            .from("wardrobe-images")
            .upload(path, blob, {
              contentType: "image/png",
            });
          if (uploadError) throw uploadError;
          const { data } = supabase.storage
            .from("wardrobe-images")
            .getPublicUrl(path);
          // ✅ update item with processed image
          await supabase
            .from("wardrobe_items")
            .update({
              processed_image_url: data.publicUrl,
              processing_status: "done",
            })
            .eq("id", insertedItem.id);
        })
        .catch(async (err) => {
          console.error("Async BG removal failed:", err);
          await supabase
            .from("wardrobe_items")
            .update({
              processing_status: "failed",
            })
            .eq("id", insertedItem.id);
        });
    }
  };
  // Filtering: if a parent category is selected, show all items whose category is a subcategory of that parent
  const filtered = items
    .filter((i) => {
      if (availabilityFilter === "available") return i.is_available !== false;
      if (availabilityFilter === "unavailable") return i.is_available === false;
      return true;
    })
    .filter((i) => {
      if (activeCategory === 0) return true;
      // Subcategories of the selected parent
      const subIds = subCategories
        .filter((c) => c.parent_category_id === activeCategory)
        .map((c) => c.id);
      return (
        subIds.includes(i.category_id!) || // subcategory match
        i.category_id === activeCategory // parent match (legacy or no-subcategory)
      );
    });
  const toggleAvailability = async (
    item: WardrobeItem,
    e: {
      stopPropagation(): void;
    },
  ) => {
    e.stopPropagation();
    const newValue = item.is_available === false ? true : false;
    const { error } = await supabase
      .from("wardrobe_items")
      .update({ is_available: newValue })
      .eq("id", item.id);
    if (error) {
      toast.error("Failed to update availability");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["wardrobe", user?.id] });
  };
  return (
    <AppShell>
      <HeaderBar
        title={t("wardrobe.wardrobe")}
        right={
          <TextLabel className="text-body-sm text-muted-foreground">
            {items.length} items
            {wardrobeCap !== null && (
              <TextLabel
                className={atLimit ? "text-destructive" : "text-primary"}
              >
                {" · "}
                {atLimit
                  ? t("wardrobe.limit_reached")
                  : t("wardrobe.items_remaining", {
                      remaining: remaining ?? 0,
                      max: wardrobeCap,
                    })}
              </TextLabel>
            )}
          </TextLabel>
        }
      />

      {/* Availability Filters */}
      <Box className="flex gap-2 px-4 pt-2 flex-row">
        <TagChip
          label={t("wardrobe.all")}
          active={availabilityFilter === "all"}
          onClick={() => setAvailabilityFilter("all")}
        />
        <TagChip
          label={t("wardrobe.available")}
          active={availabilityFilter === "available"}
          onClick={() => setAvailabilityFilter("available")}
        />
        <TagChip
          label={t("wardrobe.unavailable")}
          active={availabilityFilter === "unavailable"}
          onClick={() => setAvailabilityFilter("unavailable")}
        />
      </Box>

      {/* Category Filters */}
      <Box className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1 scrollbar-none flex-row">
        <TagChip
          key={0}
          label={t("wardrobe.all")}
          active={activeCategory === 0}
          onClick={() => setActiveCategory(0)}
        />
        {parentCategories.map((c) => (
          <TagChip
            key={c.id}
            label={tValue("categories", c.name)}
            active={activeCategory === c.id}
            onClick={() => setActiveCategory(c.id)}
          />
        ))}
      </Box>

      {/* Grid */}
      <Box className="grid grid-cols-2 gap-3 px-4 pb-24 pt-3">
        {isLoading ? (
          <Box className="col-span-2 flex justify-center py-12 flex-row">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </Box>
        ) : filtered.length === 0 ? (
          <TextLabel className="col-span-2 py-12 text-center text-body-sm text-muted-foreground">
            {t("wardrobe.no_items")}
          </TextLabel>
        ) : (
          filtered.map((item) => (
            <Box
              key={item.id}
              onPress={() => {
                setDetailItem(item);
                setDetailOpen(true);
              }}
              className={`animate-fade-slide-up overflow-hidden rounded-lg border border-border bg-card shadow-sm ${item.is_available === false ? "opacity-60" : ""}`}
            >
              <Box className="flex h-32 items-center justify-center bg-muted/50 overflow-hidden relative flex-row">
                {item.image_url ? (
                  <Picture
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Box
                    className="h-16 w-16 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: item.color || "#ccc" }}
                  />
                )}
                <Tap
                  onPress={(e) => toggleAvailability(item, e)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  title={
                    item.is_available === false
                      ? "Mark as available"
                      : "Mark as unavailable"
                  }
                >
                  {item.is_available === false ? (
                    <Circle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </Tap>
              </Box>
              <Box className="p-3">
                <TextLabel className="text-body-sm font-medium text-foreground">
                  {item.name}
                </TextLabel>
                <TextLabel className="text-caption text-muted-foreground">
                  {item.category_name
                    ? tValue("categories", item.category_name)
                    : ""}
                </TextLabel>
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* FAB */}
      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) resetForm();
        }}
      >
        <Tap
          onPress={() => {
            if (limitUnverified || atLimit)
              return toast.error(t("wardrobe.limit_reached_toast"));
            setAddOpen(true);
          }}
          className={`fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 ${atLimit ? "opacity-50" : ""}`}
        >
          <Plus className="h-6 w-6" />
        </Tap>
        <DialogContent className="mx-4 max-w-sm rounded-2xl max-h-[80vh] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="font-display text-display-3">
              {t("wardrobe.add_item")}
            </DialogTitle>
          </DialogHeader>
          <Box
            className="space-y-4 pt-2 px-6 pb-6 overflow-y-auto"
            style={{ maxHeight: "calc(80vh - 64px)" }}
          >
            {cameraOpen ? (
              <CameraCapture
                mode={cameraMode}
                onCapture={handleCameraCapture}
                onCancel={() => setCameraOpen(false)}
              />
            ) : imagePreview ? (
              <Box className="relative">
                <Picture
                  src={imagePreview}
                  alt="Preview"
                  className="h-40 w-full object-cover rounded-xl"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2 h-8 px-2 text-white bg-black/50 hover:bg-black/70"
                  onPress={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    setOriginalImageData(null);
                    setProcessedImage(null);
                    setProcessedBlob(null);
                  }}
                >
                  Remove
                </Button>
              </Box>
            ) : (
              <Box className="grid grid-cols-2 gap-3">
                {imageProcessing ? (
                  <Box className="col-span-2 flex items-center justify-center h-24 rounded-xl border border-border bg-muted/30 flex-row">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </Box>
                ) : (
                  <>
                    <Tap
                      onPress={handleFileChange}
                      className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/30"
                    >
                      <Upload className="h-5 w-5 text-muted-foreground" />
                      <TextLabel className="text-body-sm text-muted-foreground">
                        {t("wardrobe.upload")}
                      </TextLabel>
                    </Tap>

                    <Tap
                      onPress={() => setCameraOpen(true)}
                      className="flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/30"
                    >
                      <Camera className="h-5 w-5 text-muted-foreground" />
                      <TextLabel className="text-body-sm text-muted-foreground">
                        {t("wardrobe.camera")}
                      </TextLabel>
                    </Tap>
                  </>
                )}
              </Box>
            )}

            {processedImage && (
              <Box>
                <TextLabel className="text-xs text-muted-foreground mb-1">
                  Background Removed:
                </TextLabel>
                <Picture
                  src={processedImage}
                  alt="Processed"
                  className="h-32 w-full object-contain rounded-lg border bg-muted"
                />
              </Box>
            )}
            <Box className="space-y-2">
              <Label className="text-body-sm">{t("wardrobe.name")}</Label>
              <Input
                placeholder={t("wardrobe.name_placeholder")}
                className="rounded-xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Box>
            <Box className="space-y-2">
              <Label className="text-body-sm">{t("wardrobe.category")}</Label>
              <Select
                value={parentCategoryId ? String(parentCategoryId) : ""}
                onValueChange={(val) => {
                  const parentId = Number(val);
                  setParentCategoryId(Number(val));
                  setCategoryId(null); // Reset subcategory
                  const subs = subCategories.filter(
                    (c) => c.parent_category_id === parentId,
                  );
                  setCategoryId(subs.length > 0 ? subs[0].id : null);
                }}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("wardrobe.select_category")} />
                </SelectTrigger>
                <SelectContent>
                  {parentCategories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {tValue("categories", c.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Box>
            <Box className="space-y-2">
              <Label className="text-body-sm">
                {t("wardrobe.subcategory")}
              </Label>
              <Select
                value={categoryId ? String(categoryId) : ""}
                onValueChange={(val) => setCategoryId(Number(val))}
                disabled={!hasSubcategories}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("wardrobe.select_category")} />
                </SelectTrigger>
                <SelectContent>
                  {subCategories
                    .filter((c) => c.parent_category_id === parentCategoryId)
                    .map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {tValue("categories", c.name)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Box>
            {detectedPalette.length > 0 && (
              <Box className="space-y-2">
                <Label>{t("wardrobe.detected_colors")}</Label>

                <Box className="flex gap-2 flex-wrap flex-row">
                  {detectedPalette.map((c, i) => (
                    <Tap
                      key={i}
                      onPress={() => setColor(c.name)}
                      className={`flex items-center gap-2 px-2 py-1 rounded-lg border ${color === c.name ? "border-primary" : "border-border"}`}
                    >
                      <Box
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: c.hex }}
                      />
                      <TextLabel className="text-xs">{c.name}</TextLabel>
                    </Tap>
                  ))}
                </Box>
              </Box>
            )}

            <ColorPicker value={color} onChange={setColor} />
            <Box className="space-y-2">
              <Label className="text-body-sm">
                {t("wardrobe.fabric")}{" "}
                <TextLabel className="text-muted-foreground">
                  {t("wardrobe.optional_recommended")}
                </TextLabel>
              </Label>
              <Input
                placeholder={t("wardrobe.fabric_placeholder")}
                className="rounded-xl"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
              />
            </Box>
            <Box className="space-y-2">
              <Label className="text-body-sm">
                {t("wardrobe.size")}{" "}
                <TextLabel className="text-muted-foreground">
                  {t("wardrobe.optional_recommended")}
                </TextLabel>
              </Label>
              <Input
                placeholder={t("wardrobe.size_placeholder")}
                className="rounded-xl"
                value={size}
                onChange={(e) => setSize(e.target.value)}
              />
            </Box>
            <Box className="space-y-2">
              <Label className="text-body-sm">
                {t("wardrobe.brand")}{" "}
                <TextLabel className="text-muted-foreground">
                  {t("wardrobe.optional_recommended")}
                </TextLabel>
              </Label>
              <Input
                placeholder={t("wardrobe.brand_placeholder")}
                className="rounded-xl"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              />
            </Box>
            <Box>
              {/*
        <Button onClick={testRemoveBg} variant="secondary">
          Test Remove BG
        </Button>
        */}
            </Box>
            <Button
              onPress={handleAdd}
              disabled={saving}
              className="w-full rounded-xl py-5"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {saving ? t("wardrobe.adding") : t("wardrobe.add_to_wardrobe")}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      <WardrobeItemDetail
        item={detailItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdated={() =>
          user &&
          queryClient.invalidateQueries({ queryKey: ["wardrobe", user.id] })
        }
      />
    </AppShell>
  );
}
