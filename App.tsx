import { StatusBar } from "expo-status-bar";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  Animated,
  LayoutAnimation,
  Pressable,
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { useState, useMemo, useEffect, useRef } from "react";
import AddProductScreen from "./screen/AddProduct";
import AddCategoryScreen from "./screen/AddCategory";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { Alert } from "react-native";

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  inStock: boolean;
}

export const initialCategories: Category[] = [
  { id: "c1", name: "Electronics", color: "#3B82F6" },
  { id: "c2", name: "Furniture", color: "#8B5CF6" },
  { id: "c3", name: "Clothing", color: "#EC4899" },
];

export const initialProducts: Product[] = [
  { id: "1", name: "Laptop Pro", price: 1299.99, categoryId: "c1", inStock: true },
  { id: "2", name: "Wireless Mouse", price: 45.0, categoryId: "c1", inStock: true },
  { id: "3", name: "Ergonomic Desk", price: 350.0, categoryId: "c2", inStock: false },
];

// ─── Design System ────────────────────────────────────────────────────────────
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
  successText: '#15803D',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  dangerText: '#DC2626',
  overlay: 'rgba(15,23,42,0.55)',
};

// ─── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ─── StatCard Component ────────────────────────────────────────────────────────
function StatCard({ icon, value, label, iconColor, accentColor }: {
  icon: string; value: number; label: string; iconColor: string; accentColor: string;
}) {
  return (
    <View style={[styles.statCard, { borderTopColor: accentColor }]}>
      <View style={[styles.statIconWrap, { backgroundColor: accentColor + '18' }]}>
        <Feather name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── ProductCard Component ─────────────────────────────────────────────────────
const ProductCard = ({ item, category, onEdit, onDelete }: {
  item: Product; category: Category; onEdit: () => void; onDelete: () => void;
}) => {
  const charSum = item.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const hue = (charSum * 137.5) % 360;
  const thumbBg = `hsl(${hue},65%,92%)`;
  const thumbText = `hsl(${hue},55%,38%)`;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] }]}
    >
      {/* Left: avatar + info */}
      <View style={styles.cardLeft}>
        <View style={[styles.avatar, { backgroundColor: thumbBg }]}>
          <Text style={[styles.avatarText, { color: thumbText }]}>
            {item.name.substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.cardMeta}>
            <View style={[styles.catDot, { backgroundColor: category?.color || '#94A3B8' }]} />
            <Text style={styles.cardCategory}>{category?.name || 'General'}</Text>
          </View>
          <Text style={styles.cardPrice}>${item.price.toFixed(2)}</Text>
        </View>
      </View>

      {/* Right: status badge + actions */}
      <View style={styles.cardRight}>
        <View style={[styles.statusBadge, item.inStock ? styles.statusAvailable : styles.statusOut]}>
          <View style={[styles.statusDot, { backgroundColor: item.inStock ? C.success : C.danger }]} />
          <Text style={[styles.statusText, item.inStock ? styles.statusTextAvailable : styles.statusTextOut]}>
            {item.inStock ? 'Disponible' : 'Agotado'}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
            <Feather name="edit-2" size={15} color={C.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={[styles.actionBtn, styles.actionBtnDanger]}>
            <Feather name="trash-2" size={15} color={C.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
};

// ─── EmptyState Component ──────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconRing}>
        <View style={styles.emptyIconInner}>
          <Feather name="package" size={32} color={C.textSecondary} />
        </View>
      </View>
      <Text style={styles.emptyTitle}>Sin productos aún</Text>
      <Text style={styles.emptyBody}>Agrega tu primer producto{'\n'}y empieza a gestionar tu inventario.</Text>
      <TouchableOpacity onPress={onAdd} style={styles.emptyBtn} activeOpacity={0.85}>
        <Feather name="plus" size={16} color={C.surface} style={{ marginRight: 8 }} />
        <Text style={styles.emptyBtnText}>Agregar producto</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showMainCategoryModal, setShowMainCategoryModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const fabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fabAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const unsubCategories = onSnapshot(
      collection(db, "categorias"),
      (snapshot) => {
        const cats: Category[] = [];
        snapshot.forEach(doc => cats.push({ id: doc.id, ...doc.data() } as Category));
        setCategories(cats);
      },
      (error) => {
        console.error("Firebase Categorias Error:", error);
        Alert.alert("Error de Lectura", "No se pudieron cargar las categorías: " + error.message);
      }
    );
    const unsubProducts = onSnapshot(
      collection(db, "productos"),
      (snapshot) => {
        const prods: Product[] = [];
        snapshot.forEach(doc => prods.push({ id: doc.id, ...doc.data() } as Product));
        setProducts(prods);
      },
      (error) => {
        console.error("Firebase Productos Error:", error);
        Alert.alert("Error de Lectura", "No se pudieron cargar los productos: " + error.message);
      }
    );
    return () => { unsubCategories(); unsubProducts(); };
  }, []);

  const handleShowForm = (value: boolean) => {
    setShowForm(value);
    if (!value) setProductToEdit(null);
  };

  const confirmDelete = (product: Product) => setProductToDelete(product);

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await deleteDoc(doc(db, "productos", productToDelete.id));
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setProductToDelete(null);
      } catch (e) {
        console.error("Error deleting product: ", e);
      }
    }
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setShowForm(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = activeCategory === 'all' ? true :
        (activeCategory === 'disponible' ? p.inStock :
          (activeCategory === 'agotado' ? !p.inStock : p.categoryId === activeCategory));
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearch, activeCategory]);

  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter(p => p.inStock).length;
    const outOfStock = total - available;
    return { total, available, outOfStock };
  }, [products]);

  const filterOptions = [
    { key: 'all', label: 'Todos' },
    { key: 'disponible', label: 'Disponibles' },
    { key: 'agotado', label: 'Agotados' },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />

      {/* ── Bloque estático (no crece) ── */}
      <View style={styles.staticBlock}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerEyebrow}>INVENTARIO</Text>
            <Text style={styles.headerTitle}>Productos</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowMainCategoryModal(true)}
            style={styles.headerAction}
            activeOpacity={0.7}
          >
            <Feather name="grid" size={20} color={C.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* ── Search ── */}
        <View style={styles.searchWrap}>
          <Feather name="search" size={18} color={C.textTertiary} style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar producto..."
            placeholderTextColor={C.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={18} color={C.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Filters ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
        {filterOptions.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.chip, activeCategory === opt.key && styles.chipActive]}
            onPress={() => setActiveCategory(opt.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, activeCategory === opt.key && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}

        {categories.length > 0 && <View style={styles.chipDivider} />}

        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, activeCategory === cat.id && styles.chipActive]}
            onPress={() => setActiveCategory(cat.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.chipDot, { backgroundColor: cat.color }]} />
            <Text style={[styles.chipText, activeCategory === cat.id && styles.chipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
        </ScrollView>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <StatCard icon="box" value={stats.total} label="Total" iconColor={C.textPrimary} accentColor={C.primary} />
          <StatCard icon="check-circle" value={stats.available} label="Disponibles" iconColor={C.success} accentColor={C.success} />
          <StatCard icon="alert-circle" value={stats.outOfStock} label="Agotados" iconColor={C.danger} accentColor={C.danger} />
        </View>

      </View>

      {/* ── List ── */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            category={categories.find(c => c.id === item.categoryId) || initialCategories[0]}
            onEdit={() => handleEdit(item)}
            onDelete={() => confirmDelete(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState onAdd={() => { setProductToEdit(null); setShowForm(true); }} />}
      />

      {/* ── FAB ── */}
      <Animated.View style={[styles.fabWrap, { transform: [{ scale: fabAnim }] }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => { setProductToEdit(null); setShowForm(true); }}
          style={styles.fab}
        >
          <Feather name="plus" size={22} color="#FFF" />
          <Text style={styles.fabLabel}>Agregar</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Delete Confirm Modal ── */}
      <Modal visible={!!productToDelete} transparent animationType="fade" onRequestClose={() => setProductToDelete(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconRing}>
              <Feather name="trash-2" size={26} color={C.danger} />
            </View>
            <Text style={styles.modalTitle}>Eliminar producto</Text>
            <Text style={styles.modalBody}>
              {'¿Estás seguro de que deseas eliminar "'}{productToDelete?.name}{'"?\nEsta acción es irreversible.'}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setProductToDelete(null)} activeOpacity={0.8}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnDelete} onPress={handleDelete} activeOpacity={0.8}>
                <Text style={styles.modalBtnDeleteText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Modals ── */}
      <AddProductScreen
        visible={showForm}
        onClose={() => handleShowForm(false)}
        productToEdit={productToEdit}
        setProducts={setProducts}
        categories={categories}
        setCategories={setCategories}
      />
      <AddCategoryScreen
        visible={showMainCategoryModal}
        onClose={() => setShowMainCategoryModal(false)}
        categories={categories}
        setCategories={setCategories}
        onCategoryCreated={() => setShowMainCategoryModal(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // Bloque estático que NO crece — header, search, filtros, stats
  staticBlock: {
    flexShrink: 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 62 : 44,
    paddingBottom: 16,
    backgroundColor: C.bg,
  },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textTertiary,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: -0.6,
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    marginHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: C.textPrimary,
    fontWeight: '500',
    height: '100%',
  },

  // Filters
  filtersScroll: { marginBottom: 14, flexGrow: 0 },
  filtersContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipDivider: {
    width: 1,
    height: 18,
    backgroundColor: C.border,
    marginHorizontal: 4,
  },
  chipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 14,
    borderTopWidth: 3,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: C.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: C.textTertiary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // List
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
    gap: 12,
  },

  // Product Card
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: { fontSize: 16, fontWeight: '800' },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: C.textPrimary, marginBottom: 3 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  catDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  cardCategory: { fontSize: 12, color: C.textSecondary, fontWeight: '600' },
  cardPrice: { fontSize: 16, fontWeight: '800', color: C.textPrimary, letterSpacing: -0.3 },
  cardRight: { alignItems: 'flex-end', gap: 10 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 5,
  },
  statusAvailable: { backgroundColor: C.successBg },
  statusOut: { backgroundColor: C.dangerBg },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  statusTextAvailable: { color: C.successText },
  statusTextOut: { color: C.dangerText },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  actionBtnDanger: { backgroundColor: C.dangerBg, borderColor: C.dangerBg },

  // Empty State
  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  emptyIconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: C.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary, marginBottom: 8, textAlign: 'center' },
  emptyBody: { fontSize: 14, color: C.textSecondary, textAlign: 'center', lineHeight: 21, marginBottom: 28 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // FAB
  fabWrap: {
    position: 'absolute',
    bottom: 36,
    right: 24,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.primary,
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 999,
    gap: 8,
  },
  fabLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // Delete Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: C.surface,
    borderRadius: 28,
    padding: 28,
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 20,
  },
  modalIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.dangerBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.textPrimary, marginBottom: 10, letterSpacing: -0.3 },
  modalBody: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: C.surfaceAlt,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  modalBtnCancelText: { fontSize: 15, fontWeight: '700', color: C.textSecondary },
  modalBtnDelete: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: C.danger,
    alignItems: 'center',
  },
  modalBtnDeleteText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});