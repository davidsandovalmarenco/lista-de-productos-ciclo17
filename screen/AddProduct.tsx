import { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Product } from "../App";

interface AddProductScreenProps {
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  handleShowForm: (value: boolean) => void;
  productToEdit?: Product | null;
}

export default function AddProductScreen({
  setProducts,
  handleShowForm,
  productToEdit,
}: AddProductScreenProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setPrice(productToEdit.price.toString());
    }
  }, [productToEdit]);

  const handleSave = () => {
    if (!name.trim() || !price.trim()) return;
    
    if (productToEdit) {
      setProducts((prevProducts) =>
        prevProducts.map((p) =>
          p.id === productToEdit.id
            ? { ...p, name, price: parseFloat(price) }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name,
        price: parseFloat(price),
        category: "General",
        inStock: true,
      };
      setProducts((prevProducts) => [...prevProducts, newProduct]);
    }
    handleShowForm(false);
  };

  const handleCancel = () => {
    handleShowForm(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {productToEdit ? "Editar Producto" : "Agregar Producto"}
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre del Producto</Text>
        <TextInput
          placeholder="Ej: Teclado Mecánico"
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor="#adb5bd"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Precio ($)</Text>
        <TextInput
          placeholder="Ej: 45.00"
          style={styles.input}
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
          placeholderTextColor="#adb5bd"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
          <Text style={styles.buttonText}>Regresar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
          <Text style={styles.buttonText}>{productToEdit ? "Guardar" : "Agregar"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginVertical: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    fontWeight: "bold",
    color: '#212529',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#495057',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: "#ced4da",
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    color: '#212529',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#0d6efd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});