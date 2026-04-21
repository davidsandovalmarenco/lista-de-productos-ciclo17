import { useState, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, Platform, KeyboardAvoidingView,
  ActivityIndicator, Alert, Switch,
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { Product, Category } from "../App";
import AddCategoryScreen from "./AddCategory";
import { collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
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
  success: '#22C55E',
  successBg: '#DCFCE7',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  link: '#6366F1',
  overlay: 'rgba(15,23,42,0.55)',
};

interface AddProductScreenProps {
  visible: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export default function AddProductScreen({
  visible,
  onClose,
  productToEdit,
  setProducts,
  categories,
  setCategories,
}: AddProductScreenProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [inStock, setInStock] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      if (productToEdit) {
        setName(productToEdit.name);
        setPrice(productToEdit.price.toString());
        setCategoryId(productToEdit.categoryId);
        setInStock(productToEdit.inStock);
      } else {
        setName("");
        setPrice("");
        setCategoryId(prev => prev || (categories.length > 0 ? categories[0].id : ""));
        setInStock(true);
      }
      setIsSubmitting(false);
    }
  }, [visible, productToEdit]);

  const handleSave = async () => {
    if (!name.trim() || !price.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (productToEdit) {
        await updateDoc(doc(db, "productos", productToEdit.id), {
          name, price: parseFloat(price) || 0, categoryId: categoryId || "general", inStock,
        });
      } else {
        await addDoc(collection(db, "productos"), {
          name, price: parseFloat(price) || 0, categoryId: categoryId || "general", inStock,
        });
      }
      onClose();
    } catch (e: any) {
      Alert.alert("Error al guardar", "No se pudo guardar el producto. ERROR: " + e.message);
      console.error("Error saving product: ", e);
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    try {
      await deleteDoc(doc(db, "categorias", catId));
      if (categoryId === catId) {
        setCategoryId(categories.find(c => c.id !== catId)?.id || "");
      }
    } catch (e) {
      console.error("Error deleting category: ", e);
    }
  };

  const isValid = name.trim().length > 0 && price.trim().length > 0;

  if (!visible) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
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
                  <Text style={styles.sheetEyebrow}>
                    {productToEdit ? 'EDITANDO' : 'NUEVO'}
                  </Text>
                  <Text style={styles.sheetTitle}>
                    {productToEdit ? 'Editar Producto' : 'Nuevo Producto'}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                  <Feather name="x" size={20} color={C.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* ── Sección: Información ── */}
              <Text style={styles.sectionLabel}>INFORMACIÓN</Text>
              <View style={styles.section}>
                {/* Nombre */}
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Nombre del producto</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ej. Laptop Pro 14"
                    placeholderTextColor={C.textTertiary}
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.divider} />

                {/* Precio */}
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Precio (USD)</Text>
                  <View style={styles.priceWrap}>
                    <Text style={styles.priceCurrency}>$</Text>
                    <TextInput
                      style={[styles.input, styles.priceInput]}
                      keyboardType="numeric"
                      value={price}
                      onChangeText={text => setPrice(text.replace(/[^0-9.]/g, ''))}
                      placeholder="0.00"
                      placeholderTextColor={C.textTertiary}
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>

              {/* ── Sección: Categoría ── */}
              <View style={styles.sectionLabelRow}>
                <Text style={styles.sectionLabel}>CATEGORÍA</Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(true)} activeOpacity={0.7}>
                  <Text style={styles.sectionAction}>+ Crear / gestionar</Text>
                </TouchableOpacity>
              </View>

              {categories.length === 0 ? (
                <TouchableOpacity
                  style={styles.emptyCatBtn}
                  onPress={() => setShowCategoryModal(true)}
                  activeOpacity={0.7}
                >
                  <Feather name="plus-circle" size={16} color={C.link} style={{ marginRight: 8 }} />
                  <Text style={styles.emptyCatText}>Crea tu primera categoría</Text>
                </TouchableOpacity>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.catChips}
                >
                  {categories.map(cat => {
                    const active = categoryId === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCategoryId(cat.id)}
                        activeOpacity={0.7}
                        style={[
                          styles.catChip,
                          active && { borderColor: cat.color, backgroundColor: cat.color + '14' },
                        ]}
                      >
                        <View style={[styles.catDot, { backgroundColor: cat.color }]} />
                        <Text style={[styles.catChipText, active && { color: cat.color, fontWeight: '700' }]}>
                          {cat.name}
                        </Text>
                        {active && (
                          <TouchableOpacity
                            onPress={() => handleDeleteCategory(cat.id)}
                            style={styles.catDeleteBtn}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          >
                            <Feather name="x" size={12} color={C.danger} />
                          </TouchableOpacity>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* ── Sección: Estado ── */}
              <Text style={[styles.sectionLabel, { marginTop: 24 }]}>DISPONIBILIDAD</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusInfo}>
                  <View style={[styles.statusIndicator, { backgroundColor: inStock ? C.successBg : C.dangerBg }]}>
                    <Feather
                      name={inStock ? 'check-circle' : 'x-circle'}
                      size={18}
                      color={inStock ? C.success : C.danger}
                    />
                  </View>
                  <View>
                    <Text style={styles.statusTitle}>
                      {inStock ? 'Disponible' : 'Agotado'}
                    </Text>
                    <Text style={styles.statusSub}>¿Disponible para la venta?</Text>
                  </View>
                </View>
                <Switch
                  value={inStock}
                  onValueChange={setInStock}
                  trackColor={{ false: '#E2E8F0', true: C.success }}
                  thumbColor={'#FFFFFF'}
                  ios_backgroundColor="#E2E8F0"
                />
              </View>

              {/* ── Botón ── */}
              <TouchableOpacity
                style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
                onPress={handleSave}
                activeOpacity={0.85}
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Feather
                      name={productToEdit ? 'save' : 'plus'}
                      size={18}
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.saveBtnText}>
                      {productToEdit ? 'Guardar cambios' : 'Crear producto'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <AddCategoryScreen
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        categories={categories}
        setCategories={setCategories}
        onCategoryCreated={(id) => {
          setCategoryId(id);
          setShowCategoryModal(false);
        }}
      />
    </>
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
    maxHeight: '92%',
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

  // Sheet header
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

  // Section labels
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textTertiary,
    letterSpacing: 1.0,
    marginBottom: 10,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 24,
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '700',
    color: C.link,
  },

  // Section card
  section: {
    backgroundColor: C.surfaceAlt,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 4,
  },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 0 },
  fieldWrap: { paddingVertical: 14 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textTertiary,
    letterSpacing: 0.3,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textPrimary,
    padding: 0,
    margin: 0,
  },
  priceWrap: { flexDirection: 'row', alignItems: 'center' },
  priceCurrency: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textSecondary,
    marginRight: 6,
  },
  priceInput: { flex: 1 },

  // Category chips
  catChips: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 7,
  },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catChipText: { fontSize: 13, fontWeight: '600', color: C.textSecondary },
  catDeleteBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.dangerBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'dashed',
  },
  emptyCatText: { fontSize: 14, fontWeight: '600', color: C.link },

  // Status row
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.surfaceAlt,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 28,
  },
  statusInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  statusSub: { fontSize: 12, color: C.textTertiary, marginTop: 1 },

  // Save button
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderRadius: 16,
    paddingVertical: 17,
  },
  saveBtnDisabled: { opacity: 0.35 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});