import { Tap, TextLabel, Box } from "@/components/ui/native";
import { MessageCircle } from "@/components/ui/icons";
import { TextInput } from "react-native";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/platform/notifications";
import { Send, Trash2, Loader2 } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  addComment,
  deleteComment,
  deleteCommentAsOwner,
  getOutfitComments,
  OutfitComment,
} from "@/services/outfit-service";
import { useLanguage } from "@/context/LanguageContext";
interface CommentDialogProps {
  outfitId: string;
  outfitOwnerId: string;
  commentCount: number;
  onCommentAdded?: () => void;
}
export function CommentDialog({
  outfitId,
  outfitOwnerId,
  commentCount,
  onCommentAdded,
}: CommentDialogProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<OutfitComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<TextInput>(null);
  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, outfitId]);
  const loadComments = async () => {
    setLoading(true);
    const { data, error } = await getOutfitComments(outfitId);
    if (error) {
      toast.error("Failed to load comments");
    } else {
      setComments(data || []);
    }
    setLoading(false);
  };
  const handleSubmit = async () => {
    if (!user || !newComment.trim()) return;
    if (newComment.trim().length > 1000) {
      toast.error("Comment too long (max 1000 characters)");
      return;
    }
    setSubmitting(true);
    const { data, error } = await addComment(user.id, outfitId, newComment);
    if (error) {
      toast.error("Failed to add comment");
    } else if (data) {
      setComments((prev) => [...prev, data]);
      setNewComment("");
      textareaRef.current?.focus();
      onCommentAdded?.();
    }
    setSubmitting(false);
  };
  const handleDelete = async (commentId: string, commentUserId: string) => {
    if (!user) return;
    const isOwner = user.id === commentUserId;
    const isOutfitOwner = user.id === outfitOwnerId;
    if (!isOwner && !isOutfitOwner) return;
    const { error } = isOwner
      ? await deleteComment(commentId, user.id)
      : await deleteCommentAsOwner(commentId, outfitOwnerId);
    if (error) {
      toast.error("Failed to delete comment");
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentAdded?.();
    }
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Tap className="flex items-center gap-1.5 text-body-sm text-muted-foreground hover:text-foreground flex-row">
          <MessageCircle className="h-4 w-4" />
          <TextLabel>
            {commentCount > 0 ? commentCount : t("home.comment")}
          </TextLabel>
        </Tap>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t("comments.title")}</DialogTitle>
          <DialogDescription>{t("comments.description")}</DialogDescription>
        </DialogHeader>

        <Box className="flex-1 overflow-y-auto min-h-0 space-y-4 py-4">
          {loading ? (
            <Box className="flex justify-center py-8 flex-row">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </Box>
          ) : comments.length === 0 ? (
            <TextLabel className="text-center text-muted-foreground py-8 text-body-sm">
              {t("comments.empty")}
            </TextLabel>
          ) : (
            comments.map((comment) => (
              <Box key={comment.id} className="flex gap-3 flex-row">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-caption bg-primary/20 text-primary">
                    {comment.profiles?.username?.slice(0, 2).toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <Box className="flex-1 min-w-0">
                  <Box className="flex items-center gap-2 flex-row">
                    <TextLabel className="text-body-sm font-medium">
                      @{comment.profiles?.username || "user"}
                    </TextLabel>
                    <TextLabel className="text-caption text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </TextLabel>
                  </Box>
                  <TextLabel className="text-body-sm mt-1 break-words">
                    {comment.content}
                  </TextLabel>
                </Box>
                {user &&
                  (user.id === comment.user_id ||
                    user.id === outfitOwnerId) && (
                    <Tap
                      onPress={() => handleDelete(comment.id, comment.user_id)}
                      className="text-muted-foreground hover:text-destructive self-start p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Tap>
                  )}
              </Box>
            ))
          )}
        </Box>

        {user ? (
          <Box className="flex gap-2 pt-2 border-t flex-row">
            <Textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t("comments.placeholder")}
              className="min-h-[60px] resize-none"
              maxLength={1000}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              onPress={handleSubmit}
              disabled={!newComment.trim() || submitting}
              size="icon"
              className="self-end"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </Box>
        ) : (
          <TextLabel className="text-center text-muted-foreground text-body-sm pt-2 border-t">
            {t("comments.sign_in")}
          </TextLabel>
        )}
      </DialogContent>
    </Dialog>
  );
}
