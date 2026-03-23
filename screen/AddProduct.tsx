import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Animated, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { Feather } from '@expo/vector-icons';
import { Product, Category } from "../App";
import AddCategoryScreen from "./AddCategory";

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
  setCategories
}: AddProductScreenProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [inStock, setInStock] = useState(true);
  
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;

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
        setCategoryId(categories[0]?.id || "");
        setInStock(true);
      }
      
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 4,
        speed: 12,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible, productToEdit, categories]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleSave = () => {
    if (!name.trim() || !price.trim() || !categoryId) return;
    
    if (productToEdit) {
      setProducts((prev) => prev.map(p => p.id === productToEdit.id ? { ...p, name, price: parseFloat(price), categoryId, inStock } : p));
    } else {
      setProducts(prev => [{
        id: Date.now().toString(),
        name,
        price: parseFloat(price),
        categoryId,
        inStock
      }, ...prev]);
    }
    handleClose();
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
    if (categoryId === catId) {
      setCategoryId(categories.find(c => c.id !== catId)?.id || "");
    }
  };

  if (!visible) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
          
          <Animated.View style={[styles.bottomSheet, {
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [800, 0]
              })
            }]
          }]}>
            <View style={styles.dragHandleWrapper}>
               <View style={styles.dragHandle} />
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              <View style={styles.header}>
                <Text style={styles.title}>{productToEdit ? "Editar Producto" : "Nuevo Producto"}</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <Feather name="x" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre del producto</Text>
                <TextInput style={styles.input} placeholder="Ej: Teclado Mecánico" value={name} onChangeText={setName} placeholderTextColor="#9CA3AF" />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Precio ($)</Text>
                <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={price} onChangeText={setPrice} placeholderTextColor="#9CA3AF" />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Categoría</Text>
                  <TouchableOpacity onPress={() => setShowCategoryModal(true)}>
                    <Text style={styles.linkText}>+ Gestionar / Nueva</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.categoryChips}>
                  {categories.map((cat) => (
                    <TouchableOpacity key={cat.id} onPress={() => setCategoryId(cat.id)} style={[styles.chip, categoryId === cat.id && styles.chipActive, { borderColor: categoryId === cat.id ? cat.color : '#E5E7EB' }]}>
                      {categoryId === cat.id && <View style={[StyleSheet.absoluteFill, {backgroundColor: cat.color, opacity: 0.1, borderRadius: 20}]} />}
                      <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                      <Text style={[styles.chipText, categoryId === cat.id && {color: cat.color}]}>{cat.name}</Text>
                      {categoryId === cat.id && (
                        <TouchableOpacity 
                          onPress={() => handleDeleteCategory(cat.id)} 
                          style={{marginLeft: 8, padding: 4, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 12}}
                          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                        >
                          <Feather name="trash-2" size={14} color="#DC2626" />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.statusGroup}>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>Estado del producto</Text>
                  <Text style={styles.statusSubtext}>¿Está disponible para la venta?</Text>
                </View>
                <TouchableOpacity style={[styles.toggleWrap, inStock && styles.toggleWrapActive]} onPress={() => setInStock(!inStock)} activeOpacity={0.8}>
                   <Animated.View style={[styles.toggleKnob, inStock && styles.toggleKnobActive]} />
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <TouchableOpacity 
                  style={[styles.saveActionBtn, (!name.trim() || !price.trim() || !categoryId) && styles.saveActionBtnDisabled]} 
                  onPress={handleSave} 
                  activeOpacity={0.8}
                  disabled={!name.trim() || !price.trim() || !categoryId}
                >
                  <Text style={styles.saveActionText}>{productToEdit ? "Guardar cambios" : "Crear producto"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
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
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    overflow: 'hidden',
  },
  chipActive: {
    borderWidth: 1.5,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  statusGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  statusSubtext: {
    fontSize: 13,
    color: '#6B7280',
  },
  toggleWrap: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleWrapActive: {
    backgroundColor: '#10B981',
  },
  toggleKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleKnobActive: {
    transform: [{ translateX: 20 }],
  },
  footer: {
    marginTop: 10,
  },
  saveActionBtn: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveActionBtnDisabled: {
    opacity: 0.5,
  },
  saveActionText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});