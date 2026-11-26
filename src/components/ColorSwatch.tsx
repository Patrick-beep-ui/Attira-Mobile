import { useState } from "react";
import { Modal, View, Pressable, Text, TextInput } from "react-native";
export function ColorSwatch({
  value,
  onChange,
}: {
  value: string;
  onChange: (hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Elegir color / Choose color"
        onPress={() => {
          setDraft(value);
          setOpen(true);
        }}
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#dfe3e7",
          backgroundColor: value,
        }}
      />
      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            padding: 24,
            backgroundColor: "#0008",
          }}
        >
          <View
            style={{
              backgroundColor: "#f7f1ee",
              padding: 24,
              borderRadius: 14,
              gap: 16,
            }}
          >
            <View
              style={{
                height: 60,
                backgroundColor: /^#[\da-f]{6}$/i.test(draft) ? draft : value,
                borderRadius: 12,
              }}
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {[
                "#000000",
                "#FFFFFF",
                "#1E3A5F",
                "#D4B896",
                "#6B7280",
                "#059669",
                "#92400E",
                "#5C2336",
                "#E9967A",
                "#FFD700",
              ].map((hex) => (
                <Pressable
                  key={hex}
                  accessibilityLabel={hex}
                  onPress={() => setDraft(hex)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: hex,
                    borderWidth: 1,
                    borderColor: "#ccc",
                  }}
                />
              ))}
            </View>
            <TextInput
              accessibilityLabel="HEX"
              value={draft}
              onChangeText={setDraft}
              autoCapitalize="characters"
              maxLength={7}
              style={{
                borderWidth: 1,
                borderColor: "#dfe3e7",
                padding: 12,
                borderRadius: 12,
                backgroundColor: "#fff",
              }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Pressable onPress={() => setOpen(false)}>
                <Text>Cancelar / Cancel</Text>
              </Pressable>
              <Pressable
                disabled={!/^#[\da-f]{6}$/i.test(draft)}
                onPress={() => {
                  onChange(draft);
                  setOpen(false);
                }}
              >
                <Text>Aplicar / Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
