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
  Pressable,
  Platform,
} from "react-native";
import { Feather } from '@expo/vector-icons';
import { useState, useMemo } from "react";
import AddProductScreen from "./screen/AddProduct";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

export const initialProducts: Product[] = [
  {
    id: "1",
    name: "Laptop",
    price: 1200,
    category: "Electronics",
    inStock: true,
  },
  {
    id: "2",
    name: "Mouse",
    price: 25,
    category: "Electronics",
    inStock: true,
  },
  {
    id: "3",
    name: "Desk",
    price: 300,
    category: "Furniture",
    inStock: false,
  },
];

type FilterType = 'All' | 'Disponible' | 'Agotado';

export default function App() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleShowForm = (value: boolean) => {
    setShowForm(value);
    if (!value) {
      setProductToEdit(null);
    }
  };

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
  };

  const handleDelete = () => {
    if (productToDelete) {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
    }
  };

  const handleEdit = (product: Product) => {
    setProductToEdit(product);
    setShowForm(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === 'All' ? true : 
                            activeFilter === 'Disponible' ? p.inStock : 
                            !p.inStock;
      return matchesSearch && matchesFilter;
    });
  }, [products, searchQuery, activeFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const available = products.filter(p => p.inStock).length;
    const outOfStock = total - available;
    return { total, available, outOfStock };
  }, [products]);

  const renderItem = ({ item }: { item: Product }) => (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.cardLeft}>
        <View style={styles.thumbnail}>
          <Text style={styles.thumbnailText}>
            {item.name.substring(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.cardRight}>
        <View style={[styles.badge, item.inStock ? styles.badgeSuccess : styles.badgeDanger]}>
          <Text style={[styles.badgeText, item.inStock ? styles.badgeTextSuccess : styles.badgeTextDanger]}>
            {item.inStock ? "Disponible" : "Agotado"}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(item)}>
            <Feather name="edit-2" size={18} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, {backgroundColor: '#FEE2E2'}]} onPress={() => confirmDelete(item)}>
            <Feather name="trash-2" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );

  const renderList = () => {
    return (
      <View style={styles.listContainer}>
        {/* Header & Search */}
        <View style={styles.header}>
          <Text style={styles.title}>Productos</Text>
          <Text style={styles.subtitle}>Gestiona tu inventario</Text>
          
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar productos..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer} contentContainerStyle={{paddingRight: 20}}>
            {(['All', 'Disponible', 'Agotado'] as FilterType[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                  {filter === 'All' ? 'Todos' : filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: '#10B981'}]}>{stats.available}</Text>
            <Text style={styles.statLabel}>Disponibles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: '#EF4444'}]}>{stats.outOfStock}</Text>
            <Text style={styles.statLabel}>Agotados</Text>
          </View>
        </View>

        {/* Product List */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="package" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No se encontraron productos</Text>
            </View>
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            setProductToEdit(null);
            setShowForm(true);
          }}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* Delete Confirmation Modal */}
        <Modal
          visible={!!productToDelete}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setProductToDelete(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconContainer}>
                <Feather name="alert-triangle" size={28} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>Eliminar Producto</Text>
              <Text style={styles.modalDescription}>
                ¿Estás seguro que deseas eliminar "{productToDelete?.name}"? Esta acción no se puede deshacer.
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={styles.modalButtonCancel} 
                  onPress={() => setProductToDelete(null)}
                >
                  <Text style={styles.modalButtonCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalButtonDelete} 
                  onPress={handleDelete}
                >
                  <Text style={styles.modalButtonDeleteText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="dark" />
      {showForm ? (
        <AddProductScreen
          setProducts={setProducts}
          handleShowForm={handleShowForm}
          productToEdit={productToEdit}
        />
      ) : (
        renderList()
      )}
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
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    height: '100%',
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    fontWeight: '500',
    color: '#4B5563',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6'
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
    paddingBottom: 120, // Enough room for the FAB
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#F9FAFB',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  thumbnailText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 64,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeSuccess: {
    backgroundColor: '#D1FAE5',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeTextSuccess: {
    color: '#059669',
  },
  badgeTextDanger: {
    color: '#DC2626',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
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
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
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
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#FFFFFF',
  },
});