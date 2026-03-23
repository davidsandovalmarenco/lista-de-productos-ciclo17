import { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Animated, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { Feather } from '@expo/vector-icons';
import { Category } from "../App";

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
  
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setName("");
      setSelectedColor(COLORS[0]);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 4,
        speed: 12,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const newCat = { id: `cat_${Date.now()}`, name: name.trim(), color: selectedColor };
    setCategories(prev => [...prev, newCat]);
    onCategoryCreated(newCat.id);
    handleClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : (Platform.OS === "android" ? "height" : undefined)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
        
        <Animated.View style={[styles.bottomSheet, {
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [600, 0]
            })
          }]
        }]}>
          <View style={styles.dragHandleWrapper}>
             <View style={styles.dragHandle} />
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Nueva categoría</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Feather name="x" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.previewContainer}>
               <Text style={styles.previewLabel}>Vista previa</Text>
               <View style={styles.previewBadge}>
                 <View style={[StyleSheet.absoluteFill, {backgroundColor: selectedColor, opacity: 0.1, borderRadius: 20}]} />
                 <View style={[styles.categoryDot, { backgroundColor: selectedColor }]} />
                 <Text style={[styles.previewText, {color: selectedColor}]}>{name.trim() || "Nombre de categoría"}</Text>
               </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Ej: Accesorios" 
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
                style={[styles.saveActionBtn, !name.trim() && styles.saveActionBtnDisabled]} 
                onPress={handleSave} 
                activeOpacity={0.8}
                disabled={!name.trim()}
              >
                <Text style={styles.saveActionText}>Crear categoría</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
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
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  previewText: {
    fontSize: 15,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleActive: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
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
