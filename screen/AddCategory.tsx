import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, Platform, KeyboardAvoidingView,
  ActivityIndicator, Alert,
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { Category } from "../App";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

// ─── Design tokens (local mirror) ────────────────────────────────────────────
const C = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  primary: '#111827',
  overlay: 'rgba(15,23,42,0.55)',
};

const COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#22C55E",
  "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6",
  "#D946EF", "#EC4899", "#F43F5E", "#64748B",
];

interface AddCategoryScreenProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onCategoryCreated: (categoryId: string) => void;
}

export default function AddCategoryScreen({
  visible,
  onClose,
  categories,
  setCategories,
  onCategoryCreated,
}: AddCategoryScreenProps) {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setName("");
      setSelectedColor(COLORS[0]);
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "categorias"), {
        name: name.trim(),
        color: selectedColor,
      });
      onCategoryCreated(docRef.id);
    } catch (e: any) {
      Alert.alert("Error al guardar", "Revisa tu conexión a Firebase. ERROR: " + e.message);
      console.error("Error adding category: ", e);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.dragRow}>
            <View style={styles.dragHandle} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetBody}
            keyboardShouldPersistTaps="handled"
          >
            {/* Sheet header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEyebrow}>NUEVA</Text>
                <Text style={styles.sheetTitle}>Categoría</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Feather name="x" size={20} color={C.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* ── Preview ── */}
            <View style={styles.previewArea}>
              <Text style={styles.previewLabel}>VISTA PREVIA</Text>
              <View style={styles.previewCard}>
                {/* Big color swatch */}
                <View style={[styles.previewSwatch, { backgroundColor: selectedColor }]}>
                  <Feather name="tag" size={24} color="rgba(255,255,255,0.9)" />
                </View>
                {/* Badge */}
                <View style={[styles.previewBadge, { backgroundColor: selectedColor + '18', borderColor: selectedColor + '40' }]}>
                  <View style={[styles.previewDot, { backgroundColor: selectedColor }]} />
                  <Text style={[styles.previewBadgeText, { color: selectedColor }]}>
                    {name.trim() || "Nombre de categoría"}
                  </Text>
                </View>
              </View>
            </View>

            {/* ── Nombre ── */}
            <Text style={styles.sectionLabel}>NOMBRE</Text>
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej. Electrónica, Ropa..."
                placeholderTextColor={C.textTertiary}
                autoFocus
                returnKeyType="done"
              />
            </View>

            {/* ── Color ── */}
            <Text style={[styles.sectionLabel, { marginTop: 22 }]}>COLOR REPRESENTATIVO</Text>
            <View style={styles.colorGrid}>
              {COLORS.map(color => {
                const active = selectedColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    activeOpacity={0.8}
                    style={[
                      styles.colorSwatch,
                      { backgroundColor: color },
                      active && styles.colorSwatchActive,
                    ]}
                  >
                    {active && (
                      <View style={styles.colorCheckRing}>
                        <Feather name="check" size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Save button ── */}
            <TouchableOpacity
              style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled, { backgroundColor: selectedColor }]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.saveBtnText}>Crear categoría</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: C.overlay },

  // Sheet
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 20,
  },
  dragRow: { alignItems: 'center', paddingVertical: 12 },
  dragHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' },
  sheetBody: {
    paddingHorizontal: 22,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },

  // Header
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  sheetEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },

  // Preview
  previewArea: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: C.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  previewCard: { alignItems: 'center', gap: 14 },
  previewSwatch: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    gap: 8,
  },
  previewDot: { width: 8, height: 8, borderRadius: 4 },
  previewBadgeText: { fontSize: 14, fontWeight: '700' },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textTertiary,
    letterSpacing: 1.0,
    marginBottom: 10,
  },

  // Input
  inputCard: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  input: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textPrimary,
    padding: 0,
  },

  // Color grid
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSwatchActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    transform: [{ scale: 1.12 }],
  },
  colorCheckRing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Save
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 17,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
