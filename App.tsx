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
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

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
          <View style={{flexDirection: 'row', gap: 10, marginTop: 12}}>
            <TouchableOpacity onPress={onEdit} style={{padding: 8, backgroundColor: '#F2F2F7', borderRadius: 8}}>
              <Feather name="edit-2" size={16} color="#000000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={{padding: 8, backgroundColor: '#FF3B301A', borderRadius: 8}}>
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
    const unsubProducts = onSnapshot(collection(db, "productos"), (querySnapshot) => {
      const prods: Product[] = [];
      querySnapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(prods);
    });

    const unsubCategories = onSnapshot(collection(db, "categorias"), (querySnapshot) => {
      const cats: Category[] = [];
      querySnapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() } as Category);
      });
      setCategories(cats);
    });

    return () => {
      unsubProducts();
      unsubCategories();
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
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      try {
        await deleteDoc(doc(db, "productos", productToDelete.id));
        setProductToDelete(null);
      } catch(e) {
        console.error("Error borrando producto: ", e);
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
          <Text style={styles.title}>Productos</Text>
          <Text style={styles.subtitle}>Gestiona tu inventario con estilo</Text>
          
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
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                <Feather name="x-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer} contentContainerStyle={{paddingRight: 20}}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  listContainer: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  header: { paddingHorizontal: 20, marginBottom: 8 },
  title: { fontSize: 34, fontWeight: '700', color: '#000000', letterSpacing: -0.8 },
  subtitle: { fontSize: 16, color: '#8E8E93', marginBottom: 24, marginTop: 4, fontWeight: '500' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 12, paddingHorizontal: 16, height: 48, marginBottom: 20 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#000000', fontWeight: '500', height: '100%' },
  filtersContainer: { flexDirection: 'row', marginBottom: 10 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, backgroundColor: '#F2F2F7', marginRight: 8 },
  filterChipActive: { backgroundColor: '#000000' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#8E8E93' },
  filterTextActive: { color: '#FFFFFF' },
  filterDivider: { width: 1, height: 20, backgroundColor: '#E5E5EA', marginHorizontal: 8, alignSelf: 'center' },
  categoryFilterDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20, gap: 12 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'flex-start', backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 1, borderColor: '#F2F2F7' },
  statIconWrapper: { marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '700', color: '#000000', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  flatListContent: { paddingHorizontal: 20, paddingBottom: 140 },
  swipeWrap: { marginBottom: 12, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#F2F2F7' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  thumbnail: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  thumbnailText: { fontSize: 18, fontWeight: '700' },
  cardContent: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 4 },
  categoryBadgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  categoryDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  categoryNameText: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  price: { fontSize: 16, fontWeight: '700', color: '#000000' },
  cardRight: { alignItems: 'flex-end', justifyContent: 'flex-start', minHeight: 64 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeSuccess: { backgroundColor: '#34C7591A' },
  badgeDanger: { backgroundColor: '#FF3B301A' },
  badgeText: { fontSize: 12, fontWeight: '600' },
  badgeTextSuccess: { color: '#34C759' },
  badgeTextDanger: { color: '#FF3B30' },
  fabContainer: { position: 'absolute', bottom: 40, right: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  fab: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#000000', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#8E8E93', fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 15 },
  modalIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FF3B301A', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#000000', marginBottom: 8 },
  modalDescription: { fontSize: 15, color: '#8E8E93', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalButtonCancel: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F2F2F7', alignItems: 'center' },
  modalButtonCancelText: { fontSize: 16, fontWeight: '600', color: '#000000' },
  modalButtonDelete: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#FF3B30', alignItems: 'center' },
  modalButtonDeleteText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});