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

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const SwipeableCard = ({
  item,
  category,
  onEdit,
  onDelete
}: {
  item: Product;
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const charSum = item.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const hue = (charSum * 137.5) % 360;
  const thumbColor = `hsl(${hue}, 70%, 90%)`;
  const thumbTextColor = `hsl(${hue}, 60%, 40%)`;

  return (
    <View style={styles.swipeWrap}>
      <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }]}>
        <View style={styles.cardLeft}>
          <View style={[styles.thumbnail, { backgroundColor: thumbColor }]}>
            <Text style={[styles.thumbnailText, { color: thumbTextColor }]}>
              {item.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.categoryBadgeRow}>
              <View style={[styles.categoryDot, { backgroundColor: category?.color || '#9CA3AF' }]} />
              <Text style={styles.categoryNameText}>{category?.name || 'General'}</Text>
            </View>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.cardRight}>
          <View style={[styles.badge, item.inStock ? styles.badgeSuccess : styles.badgeDanger]}>
            <Text style={[styles.badgeText, item.inStock ? styles.badgeTextSuccess : styles.badgeTextDanger]}>
              {item.inStock ? "Disponible" : "Agotado"}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <TouchableOpacity onPress={onEdit} style={{ padding: 8, backgroundColor: '#F2F2F7', borderRadius: 8 }}>
              <Feather name="edit-2" size={16} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={{ padding: 8, backgroundColor: '#FF3B301A', borderRadius: 8 }}>
              <Feather name="trash-2" size={16} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </View>
  );
};

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
    Animated.spring(fabAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const unsubCategories = onSnapshot(
      collection(db, "categorias"), 
      (snapshot) => {
        const cats: Category[] = [];
        snapshot.forEach(doc => {
          cats.push({ id: doc.id, ...doc.data() } as Category);
        });
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
        snapshot.forEach(doc => {
          prods.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(prods);
      },
      (error) => {
        console.error("Firebase Productos Error:", error);
        Alert.alert("Error de Lectura", "No se pudieron cargar los productos: " + error.message);
      }
    );

    return () => {
      unsubCategories();
      unsubProducts();
    };
  }, []);

  const handleShowForm = (value: boolean) => {
    setShowForm(value);
    if (!value) setProductToEdit(null);
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
  };

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

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="dark" />


      <View style={styles.listContainer}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={styles.title}>Productos</Text>
              <Text style={styles.subtitle}>Gestiona tu inventario con estilo</Text>
            </View>
            <TouchableOpacity onPress={() => setShowMainCategoryModal(true)} style={styles.headerCategoryBtn}>
              <Feather name="grid" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="x-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer} contentContainerStyle={{ paddingRight: 20 }}>
            <TouchableOpacity style={[styles.filterChip, activeCategory === 'all' && styles.filterChipActive]} onPress={() => setActiveCategory('all')}>
              <Text style={[styles.filterText, activeCategory === 'all' && styles.filterTextActive]}>Todos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, activeCategory === 'disponible' && styles.filterChipActive]} onPress={() => setActiveCategory('disponible')}>
              <Text style={[styles.filterText, activeCategory === 'disponible' && styles.filterTextActive]}>Disponibles</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, activeCategory === 'agotado' && styles.filterChipActive]} onPress={() => setActiveCategory('agotado')}>
              <Text style={[styles.filterText, activeCategory === 'agotado' && styles.filterTextActive]}>Agotados</Text>
            </TouchableOpacity>

            <View style={styles.filterDivider} />

            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.filterChip, activeCategory === cat.id && styles.filterChipActive]}
                onPress={() => setActiveCategory(cat.id)}
              >
                <View style={[styles.categoryFilterDot, { backgroundColor: cat.color }]} />
                <Text style={[styles.filterText, activeCategory === cat.id && styles.filterTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <Feather name="box" size={20} color="#000" />
            </View>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <Feather name="check-circle" size={20} color="#34C759" />
            </View>
            <Text style={styles.statValue}>{stats.available}</Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrapper}>
              <Feather name="alert-circle" size={20} color="#FF3B30" />
            </View>
            <Text style={styles.statValue}>{stats.outOfStock}</Text>
            <Text style={styles.statLabel}>Agotados</Text>
          </View>
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SwipeableCard
              item={item}
              category={categories.find(c => c.id === item.categoryId) || initialCategories[0]}
              onEdit={() => handleEdit(item)}
              onDelete={() => confirmDelete(item)}
            />
          )}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Feather name="inbox" size={48} color="#4B5563" />
              </View>
              <Text style={styles.emptyTitle}>Sin resultados</Text>
              <Text style={styles.emptyText}>No hay productos aquí.</Text>
            </View>
          }
        />

        <Animated.View style={[styles.fabContainer, { transform: [{ scale: fabAnim }] }]}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => { setProductToEdit(null); setShowForm(true); }} style={styles.fab}>
            <Feather name="plus" size={28} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>

        <Modal visible={!!productToDelete} transparent animationType="fade" onRequestClose={() => setProductToDelete(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Feather name="alert-triangle" size={28} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>Eliminar Producto</Text>
              <Text style={styles.modalDescription}>
                ¿Eliminar "{productToDelete?.name}"? Esta acción no se puede deshacer.
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setProductToDelete(null)}>
                  <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonDelete} onPress={handleDelete}>
                  <Text style={styles.modalButtonDeleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>

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
        onCategoryCreated={(id) => {
          setShowMainCategoryModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#030712',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 24,
    marginTop: 4,
    fontWeight: '500',
  },
  headerCategoryBtn: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    height: '100%',
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  categoryFilterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  statIconWrapper: {
    padding: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  swipeWrap: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  actionRow: {
    position: 'absolute',
    right: 0,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
    width: 140,
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  thumbnailText: {
    fontSize: 18,
    fontWeight: '800',
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryNameText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  price: {
    fontSize: 17,
    fontWeight: '800',
    color: '#030712',
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minHeight: 64,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  badgeSuccess: {
    backgroundColor: '#D1FAE5',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeTextSuccess: {
    color: '#059669',
  },
  badgeTextDanger: {
    color: '#DC2626',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    right: 32,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 15,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4B5563',
  },
  modalButtonDelete: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    alignItems: 'center',
  },
  modalButtonDeleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});