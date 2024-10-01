import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, IconButton, Portal, Dialog } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ref, update, remove } from 'firebase/database';
import { database, auth } from '../config/FirebaseConfig';

type RootStackParamList = {
  ProductDetail: { product: Product };
};

type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  code: string;
  stock: string;
}

const ProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { product } = route.params;

  const [editedProduct, setEditedProduct] = useState<Product>(product);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row' }}>
          <IconButton
            icon={isEditing ? 'check' : 'pencil'}
            onPress={isEditing ? handleSave : () => setIsEditing(true)}
          />
          <IconButton
            icon="delete"
            onPress={() => setIsDeleteDialogVisible(true)}
          />
        </View>
      ),
    });
  }, [navigation, isEditing]);

  const handleSave = () => {
    if (auth.currentUser) {
      update(ref(database, `products/${auth.currentUser.uid}/${editedProduct.id}`), {
        name: editedProduct.name,
        description: editedProduct.description,
        price: editedProduct.price,
        code: editedProduct.code,
        stock: editedProduct.stock,
      });
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (auth.currentUser) {
      remove(ref(database, `products/${auth.currentUser.uid}/${editedProduct.id}`));
      setIsDeleteDialogVisible(false);
      navigation.goBack();
    }
  };

  const renderField = (label: string, value: string, field: keyof Product) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      {isEditing ? (
        <TextInput
          value={value}
          onChangeText={(text) => setEditedProduct({ ...editedProduct, [field]: text })}
          style={styles.input}
          mode="outlined"
        />
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {renderField('Name', editedProduct.name, 'name')}
        {renderField('Description', editedProduct.description, 'description')}
        {renderField('Price', editedProduct.price, 'price')}
        {renderField('Code', editedProduct.code, 'code')}
        {renderField('Stock', editedProduct.stock, 'stock')}
      </View>

      <Portal>
        <Dialog visible={isDeleteDialogVisible} onDismiss={() => setIsDeleteDialogVisible(false)}>
          <Dialog.Title>Delete Product</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this product?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsDeleteDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleDelete}>Delete</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fce4ec',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    elevation: 4,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#f06292',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff1f8',
  },
});

export default ProductDetailScreen;