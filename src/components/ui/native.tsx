import { Portal } from "@gorhom/portal";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
  Dimensions,
  type ViewStyle,
  type ImageStyle,
  type TextStyle,
  type TextInputProps,
  type GestureResponderEvent,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { cn } from "@/lib/utils";
import { fonts } from "@/theme/tokens";

export const TextClass = createContext("text-foreground text-body font-sans");
const FormContext = createContext<(() => void) | undefined>(undefined);
const inherited = (className = "") =>
  className
    .split(/\s+/)
    .filter((token) =>
      /^(text-|font-|tracking-|leading-|uppercase$|lowercase$|italic$)/.test(
        token,
      ),
    )
    .join(" ");
export type InputHandle = React.ComponentRef<typeof TextInput>;
export type ViewHandle = React.ComponentRef<typeof View>;
export type NativeProps = {
  children?: ReactNode;
  className?: string;
  style?: object;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  type?: string;
  title?: string;
  ref?: React.Ref<ViewHandle>;
};
function flattenChildren(children: ReactNode): ReactNode[] {
  return React.Children.toArray(children).flatMap((child) =>
    React.isValidElement<{ children?: ReactNode }>(child) &&
    child.type === React.Fragment
      ? flattenChildren(child.props.children)
      : [child],
  );
}
function textChildren(children: ReactNode, className?: string): ReactNode {
  return React.Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number" ? (
      <TextLabel className={className}>{child}</TextLabel>
    ) : (
      child
    ),
  );
}
function classes(value = "") {
  return value
    .replace(/min-h-\[(?:100dvh|100vh)\]|min-h-screen/g, "flex-1")
    .replace(/\bfixed\b/g, "absolute")
    .replace(/\bsticky\b/g, "relative")
    .replace(/\bspace-y-([\d.]+)/g, "gap-$1")
    .replace(/\bspace-x-([\d.]+)/g, "gap-$1")
    .replace(/\binline-flex\b/g, "flex-row");
}
function styles(value?: object): ViewStyle | undefined {
  if (!value) return undefined;
  const data = { ...value } as Record<string, unknown>;
  for (const key of ["animationDelay", "objectFit"]) delete data[key];
  if (typeof data.aspectRatio === "string" && data.aspectRatio.includes("/")) {
    const [a, b] = data.aspectRatio.split("/").map(Number);
    data.aspectRatio = a / b;
  }
  if (typeof data.maxHeight === "string" && data.maxHeight.startsWith("calc("))
    data.maxHeight = Dimensions.get("window").height * 0.8 - 64;
  return data as ViewStyle;
}
export function Box({
  children,
  className = "",
  style,
  onPress,
  ref,
  ...rest
}: NativeProps) {
  const parent = useContext(TextClass);
  const next = cn(parent, inherited(className));
  const grid = /grid-cols-(\d+)/.exec(className);
  const base = classes(className)
    .replace(/\bgrid(?:-cols-\d+)?\b/g, "")
    .replace(/\bflex\b(?!-)/g, "flex");
  const horizontal =
    /(?:^|\s)(?:flex|inline-flex)(?:\s|$)/.test(className) &&
    !className.includes("flex-col");
  const nativeStyle = [
    horizontal ? { flexDirection: "row" as const } : undefined,
    styles(style),
  ];
  let content = textChildren(children);
  if (grid) {
    const columns = Number(grid[1]);
    const gap = Number(/gap-([\d.]+)/.exec(className)?.[1] ?? 0) * 4;
    content = (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginHorizontal: -gap / 2,
        }}
      >
        {flattenChildren(children).map((child, i) => (
          <View
            key={React.isValidElement(child) ? (child.key ?? i) : i}
            style={{
              width:
                React.isValidElement<{ className?: string }>(child) &&
                child.props.className?.includes("col-span-2")
                  ? "100%"
                  : `${100 / columns}%`,
              padding: gap / 2,
            }}
          >
            {textChildren(child)}
          </View>
        ))}
      </View>
    );
  }
  if (onPress)
    return (
      <Tap onPress={onPress} className={base} style={style}>
        {children}
      </Tap>
    );
  if (className.includes("overflow-x-auto"))
    return (
      <TextClass.Provider value={next}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className={base}
          contentContainerStyle={{ alignItems: "center", gap: 8 }}
          keyboardShouldPersistTaps="handled"
          style={styles(style)}
        >
          {content}
        </ScrollView>
      </TextClass.Provider>
    );
  if (className.includes("overflow-y-auto"))
    return (
      <TextClass.Provider value={next}>
        <ScrollView
          className={base}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          style={nativeStyle}
          {...rest}
        >
          {content}
        </ScrollView>
      </TextClass.Provider>
    );
  return (
    <TextClass.Provider value={next}>
      <View ref={ref} className={base} style={nativeStyle} {...rest}>
        {content}
      </View>
    </TextClass.Provider>
  );
}
export function TextLabel({
  children,
  className = "",
  style,
  onPress,
  ...rest
}: Omit<NativeProps, "ref">) {
  const parent = useContext(TextClass);
  const combined = cn(parent, className);
  const family = combined.includes("font-display")
    ? combined.includes("text-display-1") ||
      combined.includes("text-display-2") ||
      combined.includes("font-semibold")
      ? fonts.display
      : combined.includes("text-display-3") || combined.includes("font-medium")
        ? "PlayfairDisplay_500Medium"
        : "PlayfairDisplay_400Regular"
    : combined.includes("font-bold")
      ? fonts.bold
      : combined.includes("font-semibold")
        ? fonts.semibold
        : combined.includes("font-medium")
          ? fonts.medium
          : fonts.body;
  return (
    <Text
      className={classes(combined)}
      style={[{ fontFamily: family }, style as TextStyle]}
      onPress={onPress}
      {...rest}
    >
      {children}
    </Text>
  );
}
export function Tap({
  children,
  className = "",
  style,
  onPress,
  disabled,
  ...rest
}: Omit<NativeProps, "ref">) {
  const parent = useContext(TextClass);
  const next = cn(parent, inherited(className));
  const content = (
    <TextClass.Provider value={next}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        accessibilityState={{ disabled }}
        className={classes(className)}
        style={[styles(style), disabled ? { opacity: 0.5 } : undefined]}
        onPress={onPress}
        {...rest}
      >
        {textChildren(children)}
      </Pressable>
    </TextClass.Provider>
  );
  return className.includes("fixed") ? <Portal>{content}</Portal> : content;
}
export function Composition({
  xml,
  className = "",
  style,
}: {
  xml: string;
  className?: string;
  style?: object;
}) {
  return (
    <View
      className={classes(className)}
      style={[
        { width: "100%", aspectRatio: 5 / 6, backgroundColor: "#DEDAD9" },
        styles(style),
      ]}
    >
      <SvgXml
        xml={xml
          .replace(/width="100%"/, 'width="500"')
          .replace(/height="100%"/, 'height="600"')}
        width="100%"
        height="100%"
      />
    </View>
  );
}
export function Picture({
  src,
  alt,
  className = "",
  style,
}: {
  src?: string;
  alt?: string;
  className?: string;
  style?: object;
}) {
  const [ratio, setRatio] = useState(1);
  const hasHeight = /(?:^|\s)h-/.test(className);
  useEffect(() => {
    let active = true;
    if (src && !hasHeight && !src.startsWith("data:image/svg+xml"))
      Image.getSize(
        src,
        (width, height) => {
          if (active && height) setRatio(width / height);
        },
        () => {},
      );
    return () => {
      active = false;
    };
  }, [src, hasHeight]);
  if (src?.startsWith("data:image/svg+xml"))
    return (
      <Composition
        xml={decodeURIComponent(src.slice(src.indexOf(",") + 1))}
        className={className}
        style={style}
      />
    );
  return (
    <Image
      source={src ? { uri: src } : undefined}
      accessibilityLabel={alt}
      className={classes(className)}
      resizeMode={className.includes("object-contain") ? "contain" : "cover"}
      style={[
        !hasHeight ? { aspectRatio: ratio } : undefined,
        styles(style) as ImageStyle,
      ]}
    />
  );
}

export function Form({
  onSubmit,
  children,
  className,
}: {
  onSubmit: (event: { preventDefault: () => void }) => void | Promise<void>;
  children: ReactNode;
  className?: string;
}) {
  return (
    <FormContext.Provider
      value={() => {
        void onSubmit({ preventDefault() {} });
      }}
    >
      <Box className={className}>{children}</Box>
    </FormContext.Provider>
  );
}
export function Button({
  type,
  variant = "default",
  size = "default",
  children,
  className = "",
  onPress,
  disabled,
  style,
  ...rest
}: Omit<NativeProps, "ref"> & {
  type?: string;
  variant?: string;
  size?: string;
}) {
  const submit = useContext(FormContext);
  return (
    <Tap
      disabled={disabled}
      onPress={onPress ?? (type === "submit" ? () => submit?.() : undefined)}
      style={style}
      className={cn(
        "flex-row items-center justify-center gap-2 rounded-md px-4 py-3",
        variant === "default"
          ? "bg-primary text-primary-foreground"
          : variant === "destructive"
            ? "bg-destructive text-white"
            : variant === "outline"
              ? "border border-input bg-background text-foreground"
              : "text-foreground",
        size === "icon" ? "h-10 w-10 p-0" : size === "sm" ? "px-3 py-2" : "",
        className,
      )}
      {...rest}
    >
      {children}
    </Tap>
  );
}
type Change = { target: { value: string } };
export type InputProps = Omit<
  TextInputProps,
  "style" | "onChange" | "onKeyPress" | "onKeyDown" | "ref"
> & {
  className?: string;
  style?: object;
  type?: string;
  disabled?: boolean;
  onChange?: (event: Change) => void;
  onKeyDown?: (event: {
    key: string;
    shiftKey: boolean;
    preventDefault: () => void;
  }) => void;
  required?: boolean;
  minLength?: number;
  rows?: number;
  id?: string;
};
export const Input = React.forwardRef<InputHandle, InputProps>(function Input(
  {
    type,
    disabled,
    className,
    style,
    onChange,
    onKeyDown,
    required,
    minLength,
    rows,
    id,
    ...rest
  },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      nativeID={id}
      className={cn(
        "min-h-10 rounded-md border border-input bg-background px-3 py-2 text-body text-foreground",
        className,
      )}
      style={[{ fontFamily: fonts.body }, style]}
      editable={!disabled}
      secureTextEntry={type === "password"}
      keyboardType={
        type === "email"
          ? "email-address"
          : type === "number"
            ? "decimal-pad"
            : "default"
      }
      autoCapitalize={type === "email" ? "none" : undefined}
      placeholderTextColor="#717984"
      onChangeText={(text) => onChange?.({ target: { value: text } })}
      {...rest}
    />
  );
});
export const Textarea = React.forwardRef<InputHandle, InputProps>(
  function Textarea(props, ref) {
    return (
      <Input
        {...props}
        ref={ref}
        multiline
        textAlignVertical="top"
        className={cn("min-h-[80px]", props.className)}
      />
    );
  },
);
export const Label = ({
  children,
  className,
  ...props
}: Omit<NativeProps, "ref"> & { htmlFor?: string }) => (
  <TextLabel className={cn("font-medium", className)}>{children}</TextLabel>
);
export const Skeleton = ({ className, style }: NativeProps) => (
  <View
    className={cn("rounded-md bg-muted", className)}
    style={styles(style)}
  />
);

// Compound native controls retain the original component API and hierarchy.
type OverlayValue = { open: boolean; setOpen: (open: boolean) => void };
const OverlayContext = createContext<OverlayValue>({
  open: false,
  setOpen: () => {},
});
export function Dialog({
  children,
  open,
  onOpenChange,
}: {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [local, setLocal] = useState(false);
  return (
    <OverlayContext.Provider
      value={{ open: open ?? local, setOpen: onOpenChange ?? setLocal }}
    >
      {children}
    </OverlayContext.Provider>
  );
}
export function DialogTrigger({
  children,
}: {
  children: ReactNode;
  asChild?: boolean;
}) {
  const ctx = useContext(OverlayContext);
  if (React.isValidElement<{ onPress?: () => void }>(children))
    return React.cloneElement(children, {
      onPress: () => {
        children.props.onPress?.();
        ctx.setOpen(true);
      },
    });
  return <Tap onPress={() => ctx.setOpen(true)}>{children}</Tap>;
}
export function DialogContent({
  children,
  className,
  style,
  side,
}: {
  children: ReactNode;
  className?: string;
  style?: object;
  side?: string;
}) {
  const ctx = useContext(OverlayContext);
  const bottom = side === "bottom";
  const content = (
    <>
      <Tap
        accessibilityLabel="Cerrar / Close"
        onPress={() => ctx.setOpen(false)}
        className="self-end"
      >
        <TextLabel>✕</TextLabel>
      </Tap>
      {children}
    </>
  );
  return (
    <Modal
      transparent
      visible={ctx.open}
      animationType={bottom ? "slide" : "fade"}
      onRequestClose={() => ctx.setOpen(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          justifyContent: bottom ? "flex-end" : "center",
          padding: bottom ? 0 : 16,
        }}
      >
        <Pressable
          accessibilityLabel="Cerrar / Close"
          onPress={() => ctx.setOpen(false)}
          style={[StyleSheet.absoluteFill, { backgroundColor: "#0008" }]}
        />
        <View
          className={cn("rounded-2xl bg-background p-6 gap-4", className)}
          style={[{ maxHeight: bottom ? "90%" : "85%" }, styles(style)]}
        >
          {className?.includes("overflow-y-auto") ? (
            <ScrollView keyboardShouldPersistTaps="handled">
              {content}
            </ScrollView>
          ) : (
            content
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const DialogHeader = ({ children, className }: NativeProps) => (
  <Box className={cn("gap-2", className)}>{children}</Box>
);
export const DialogFooter = ({ children, className }: NativeProps) => (
  <Box className={cn("flex-row justify-end gap-3", className)}>{children}</Box>
);
export const DialogTitle = ({ children, className }: NativeProps) => (
  <TextLabel className={cn("font-display text-display-3", className)}>
    {children}
  </TextLabel>
);
export const DialogDescription = ({ children, className }: NativeProps) => (
  <TextLabel className={cn("text-muted-foreground text-body-sm", className)}>
    {children}
  </TextLabel>
);
export function AlertDialogAction({
  onPress,
  children,
  ...props
}: Omit<NativeProps, "ref">) {
  const ctx = useContext(OverlayContext);
  return (
    <Button
      {...props}
      onPress={(event) => {
        onPress?.(event);
        ctx.setOpen(false);
      }}
    >
      {children}
    </Button>
  );
}
export function AlertDialogCancel({
  children,
  ...props
}: Omit<NativeProps, "ref">) {
  const ctx = useContext(OverlayContext);
  return (
    <Button {...props} variant="outline" onPress={() => ctx.setOpen(false)}>
      {children}
    </Button>
  );
}
export const Avatar = ({ children, className }: NativeProps) => (
  <Box
    className={cn(
      "h-10 w-10 overflow-hidden rounded-full bg-muted items-center justify-center",
      className,
    )}
  >
    {children}
  </Box>
);
export const AvatarFallback = ({ children, className }: NativeProps) => (
  <TextLabel className={className}>{children}</TextLabel>
);

type Choice = { value: string; label: ReactNode; disabled?: boolean };
type SelectValueType = {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  disabled?: boolean;
  choices: Choice[];
};
const SelectContext = createContext<SelectValueType>({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
  choices: [],
});
function collectChoices(children: ReactNode): Choice[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (
      !React.isValidElement<{
        children?: ReactNode;
        value?: string;
        disabled?: boolean;
      }>(child)
    )
      return [];
    return child.type === SelectItem
      ? [
          {
            value: child.props.value ?? "",
            label: child.props.children,
            disabled: child.props.disabled,
          },
        ]
      : collectChoices(child.props.children);
  });
}
export function Select({
  value = "",
  onValueChange,
  children,
  disabled,
}: {
  value?: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const choices = collectChoices(children);
  return (
    <SelectContext.Provider
      value={{ value, onValueChange, open, setOpen, disabled, choices }}
    >
      {children}
    </SelectContext.Provider>
  );
}
export function SelectTrigger({ children, className }: NativeProps) {
  const ctx = useContext(SelectContext);
  return (
    <Tap
      disabled={ctx.disabled}
      onPress={() => ctx.setOpen(true)}
      className={cn(
        "min-h-10 flex-row items-center justify-between rounded-md border border-input px-3 py-2",
        className,
      )}
    >
      {children}
      <TextLabel>⌄</TextLabel>
    </Tap>
  );
}
export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = useContext(SelectContext);
  return (
    <TextLabel>
      {ctx.choices.find((choice) => choice.value === ctx.value)?.label ??
        placeholder ??
        ctx.value}
    </TextLabel>
  );
}
export function SelectContent({ children }: { children: ReactNode }) {
  const ctx = useContext(SelectContext);
  return (
    <Modal
      transparent
      visible={ctx.open}
      animationType="fade"
      onRequestClose={() => ctx.setOpen(false)}
    >
      <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <Pressable
          accessibilityLabel="Cerrar / Close"
          style={[StyleSheet.absoluteFill, { backgroundColor: "#0008" }]}
          onPress={() => ctx.setOpen(false)}
        />
        <ScrollView
          style={{
            maxHeight: "70%",
            backgroundColor: "#fff",
            borderRadius: 14,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}
export function SelectItem({
  value,
  children,
  disabled,
}: {
  value: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  const ctx = useContext(SelectContext);
  return (
    <Tap
      disabled={disabled}
      className={cn("px-4 py-3", value === ctx.value ? "bg-muted" : "")}
      onPress={() => {
        ctx.onValueChange(value);
        ctx.setOpen(false);
      }}
    >
      <TextLabel>{children}</TextLabel>
    </Tap>
  );
}
export function CountrySelect({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (event: Change) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange({ target: { value: next } })}
    >
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}
export const CountryOption = SelectItem;
export function FadeBox({
  children,
  initial,
  animate,
  exit,
  transition,
  className,
  style,
  ...props
}: NativeProps & {
  initial?: { opacity?: number; x?: number; y?: number | string };
  animate?: { opacity?: number; x?: number; y?: number };
  exit?: unknown;
  transition?: {
    duration?: number;
    delay?: number;
    type?: string;
    damping?: number;
    stiffness?: number;
  };
}) {
  const opacity = useRef(new Animated.Value(initial?.opacity ?? 1)).current;
  const x = useRef(new Animated.Value(initial?.x ?? 0)).current;
  const y = useRef(
    new Animated.Value(
      typeof initial?.y === "number"
        ? initial.y
        : initial?.y
          ? Dimensions.get("window").height
          : 0,
    ),
  ).current;
  useEffect(() => {
    const options = {
      duration: (transition?.duration ?? 0.3) * 1000,
      delay: (transition?.delay ?? 0) * 1000,
      useNativeDriver: true,
    };
    Animated.parallel([
      Animated.timing(opacity, { ...options, toValue: animate?.opacity ?? 1 }),
      Animated.timing(x, { ...options, toValue: animate?.x ?? 0 }),
      Animated.timing(y, { ...options, toValue: animate?.y ?? 0 }),
    ]).start();
  }, [opacity, x, y]);
  return (
    <Animated.View
      style={{ opacity, transform: [{ translateX: x }, { translateY: y }] }}
    >
      <Box {...props} className={className} style={style}>
        {children}
      </Box>
    </Animated.View>
  );
}
export function Presence({ children }: { children: ReactNode; mode?: string }) {
  return <>{children}</>;
}
