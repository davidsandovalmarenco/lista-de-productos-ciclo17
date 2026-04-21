import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, Platform, KeyboardAvoidingView, Alert, ActivityIndicator } from "react-native";
import { Feather } from '@expo/vector-icons';
import { Category } from "../App";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

interface AddCategoryScreenProps {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onCategoryCreated: (categoryId: string) => void;
}

const COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#10B981",
  "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6",
  "#D946EF", "#EC4899", "#F43F5E", "#6B7280"
];

export default function AddCategoryScreen({
  visible,
  onClose,
  categories,
  setCategories,
  onCategoryCreated
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
        color: selectedColor
      });
      onCategoryCreated(docRef.id);
      // Removido handleClose para que el framework se encargue del unmount limpio
    } catch (e: any) {
      Alert.alert("Error al guardar", "Contactando Firebase: " + (e.message || "desconocido"));
      console.error("Error adding category: ", e);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : (Platform.OS === "android" ? "height" : undefined)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.bottomSheet}>
          <View style={styles.dragHandleWrapper}>
            <View style={styles.dragHandle} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Nueva categoría</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Feather name="x" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Vista previa</Text>
              <View style={styles.previewBadge}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: selectedColor, opacity: 0.1, borderRadius: 20 }]} />
                <View style={[styles.categoryDot, { backgroundColor: selectedColor }]} />
                <Text style={[styles.previewText, { color: selectedColor }]}>{name.trim() || "Nombre de categoría"}</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Color representativo</Text>
              <View style={styles.colorGrid}>
                {COLORS.map(c => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setSelectedColor(c)}
                    style={[styles.colorCircle, { backgroundColor: c }, selectedColor === c && styles.colorCircleActive]}
                  >
                    {selectedColor === c && <Feather name="check" size={18} color="#FFF" />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.saveActionBtn, (!name.trim() || isSubmitting) && styles.saveActionBtnDisabled]}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={!name.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveActionText}>Crear categoría</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  bottomSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  dragHandleWrapper: { alignItems: 'center', paddingVertical: 12 },
  dragHandle: { width: 48, height: 5, borderRadius: 3, backgroundColor: '#E5E5EA' },
  sheetContent: { paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#000000' },
  closeBtn: { padding: 8, backgroundColor: '#F2F2F7', borderRadius: 20 },
  previewContainer: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#F2F2F7', borderRadius: 20, marginBottom: 24 },
  previewLabel: { fontSize: 13, fontWeight: '600', color: '#8E8E93', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  previewBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  categoryDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  previewText: { fontSize: 15, fontWeight: '600' },
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 10 },
  input: { backgroundColor: '#F2F2F7', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, color: '#000000', fontWeight: '500' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  colorCircleActive: { borderWidth: 3, borderColor: '#000000' },
  footer: { marginTop: 10 },
  saveActionBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', backgroundColor: '#000000' },
  saveActionBtnDisabled: { opacity: 0.3 },
  saveActionText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
