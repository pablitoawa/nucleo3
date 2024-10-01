import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Modal, StyleSheet, Animated } from 'react-native';
import { Avatar, Text, Button, Card, FAB, TextInput, Icon, Menu } from 'react-native-paper';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, onValue, push, set, remove, DatabaseReference } from 'firebase/database';
import { auth, database } from '../config/FirebaseConfig';

interface UserData {
  name: string;
  avatar: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  code: string;
  stock: string;
}

type RootStackParamList = {
  Auth: undefined;
  ProductDetail: { product: Product };
};

type HomeScreenNavigationProp = NavigationProp<RootStackParamList & ParamListBase>;

const HomeScreen = () => {
  const [user, setUser] = useState<UserData>({ name: '', avatar: '' });
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditProfileVisible, setIsEditProfileVisible] = useState<boolean>(false);
  const [isAddProductVisible, setIsAddProductVisible] = useState<boolean>(false);
  const [isEditProductVisible, setIsEditProductVisible] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({ name: '', description: '', price: '', code: '', stock: '' });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modalAnimation] = useState(new Animated.Value(0));
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const navigation = useNavigation<HomeScreenNavigationProp>();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        const userRef: DatabaseReference = ref(database, `users/${user.uid}`);
        const productsRef: DatabaseReference = ref(database, `products/${user.uid}`);

        const unsubscribeUser = onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setUser({ name: data.name, avatar: data.avatar || 'https://via.placeholder.com/150' });
          }
        });

        const unsubscribeProducts = onValue(productsRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const productList: Product[] = Object.entries(data).map(([id, product]) => ({
              id,
              ...(product as Omit<Product, 'id'>),
            }));
            setProducts(productList);
          } else {
            setProducts([]);
          }
        });

        return () => {
          unsubscribeUser();
          unsubscribeProducts();
        };
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const animateModal = (visible: boolean) => {
    Animated.spring(modalAnimation, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      tension: 30,
      friction: 7,
    }).start();
  };

  const handleEditProfile = () => {
    if (newName && auth.currentUser) {
      set(ref(database, `users/${auth.currentUser.uid}/name`), newName);
      setIsEditProfileVisible(false);
      setNewName('');
    }
  };

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.description && newProduct.price && auth.currentUser) {
      push(ref(database, `products/${auth.currentUser.uid}`), newProduct);
      setIsAddProductVisible(false);
      setNewProduct({ name: '', description: '', price: '', code: '', stock: '' });
    }
  };

  const handleEditProduct = () => {
    if (editingProduct && auth.currentUser) {
      set(ref(database, `products/${auth.currentUser.uid}/${editingProduct.id}`), {
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        code: editingProduct.code,
        stock: editingProduct.stock,
      });
      setIsEditProductVisible(false);
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    if (auth.currentUser) {
      remove(ref(database, `products/${auth.currentUser.uid}/${productId}`));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate('ROUTES.AUTH');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ROUTES.PRODUCT', { product: item })}>
      <Card style={styles.productCard}>
        <Card.Title
          title={item.name}
          subtitle={`$${item.price} - Stock: ${item.stock}`}
          right={(props) => (
            <Menu
              visible={menuVisible === item.id}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(item.id)}>
                  <Icon source="dots-vertical" size={24} />
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  setEditingProduct(item);
                  setIsEditProductVisible(true);
                  animateModal(true);
                  setMenuVisible(null);
                }}
                title="Edit"
              />
              <Menu.Item
                onPress={() => {
                  handleDeleteProduct(item.id);
                  setMenuVisible(null);
                }}
                title="Delete"
              />
            </Menu>
          )}
        />
        <Card.Content>
          <Text numberOfLines={2}>{item.description}</Text>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image size={50} source={{ uri: user.avatar }} />
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeText}>Bienvenid@</Text>
          <Text style={styles.nameText}>{user.name}</Text>
        </View>
        <TouchableOpacity onPress={() => {
          setIsEditProfileVisible(true);
          animateModal(true);
        }}>
          <Icon source="account-edit" size={30} color="#000" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productList}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => {
          setIsAddProductVisible(true);
          animateModal(true);
        }}
      />

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditProfileVisible}
        transparent
        onRequestClose={() => {
          setIsEditProfileVisible(false);
          animateModal(false);
        }}
      >
        <Animated.View style={[
          styles.modalContainer,
          {
            opacity: modalAnimation,
            transform: [
              {
                scale: modalAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}>
          <View style={styles.modalContent}>
            <TextInput
              label="New Name"
              value={newName}
              onChangeText={setNewName}
              style={styles.input}
            />
            <Button mode="contained" onPress={handleEditProfile}>Save</Button>
            <Button onPress={() => {
              setIsEditProfileVisible(false);
              animateModal(false);
            }}>Cancel</Button>
            <Button mode="outlined" onPress={handleLogout} style={styles.logoutButton}>Cerrar sesión</Button>
          </View>
        </Animated.View>
      </Modal>

      {/* Add Product Modal */}
      <Modal
        visible={isAddProductVisible}
        transparent
        onRequestClose={() => {
          setIsAddProductVisible(false);
          animateModal(false);
        }}
      >
        <Animated.View style={[
          styles.modalContainer,
          {
            opacity: modalAnimation,
            transform: [
              {
                scale: modalAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}>
          <View style={styles.modalContent}>
            <TextInput
              label="Product Name"
              value={newProduct.name}
              onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={newProduct.description}
              onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
              style={styles.input}
            />
            <TextInput
              label="Price"
              value={newProduct.price}
              onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Code"
              value={newProduct.code}
              onChangeText={(text) => setNewProduct({ ...newProduct, code: text })}
              style={styles.input}
            />
            <TextInput
              label="Stock"
              value={newProduct.stock}
              onChangeText={(text) => setNewProduct({ ...newProduct, stock: text })}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button mode="contained" onPress={handleAddProduct}>Add Product</Button>
            <Button onPress={() => {
              setIsAddProductVisible(false);
              animateModal(false);
            }}>Cancel</Button>
          </View>
        </Animated.View>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        visible={isEditProductVisible}
        transparent
        onRequestClose={() => {
          setIsEditProductVisible(false);
          animateModal(false);
        }}
      >
        <Animated.View style={[
          styles.modalContainer,
          {
            opacity: modalAnimation,
            transform: [
              {
                scale: modalAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}>
          <View style={styles.modalContent}>
            <TextInput
              label="Product Name"
              value={editingProduct?.name}
              onChangeText={(text) => setEditingProduct(prev => prev ? { ...prev, name: text } : null)}
              style={styles.input}
            />
            <TextInput
              label="Description"
              value={editingProduct?.description}
              onChangeText={(text) => setEditingProduct(prev => prev ? { ...prev, description: text } : null)}
              style={styles.input}
            />
            <TextInput
              label="Price"
              value={editingProduct?.price}
              onChangeText={(text) => setEditingProduct(prev => prev ? { ...prev, price: text } : null)}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              label="Code"
              value={editingProduct?.code}
              onChangeText={(text) => setEditingProduct(prev => prev ? { ...prev, code: text } : null)}
              style={styles.input}
            />
            <TextInput
              label="Stock"
              value={editingProduct?.stock}
              onChangeText={(text) => setEditingProduct(prev => prev ? { ...prev, stock: text } : null)}
              keyboardType="numeric"
              style={styles.input}
            />
            <Button mode="contained" onPress={handleEditProduct}>Save Changes</Button>
            <Button onPress={() => {
              setIsEditProductVisible(false);
              animateModal(false);
            }}>Cancel</Button>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fce4ec',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff1f8',
  },
  welcomeContainer: {
    flex: 1,
    marginLeft: 15,
  },
  welcomeText: {
    fontSize: 16,
    color: '#f06292',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f06292',
  },
  productList: {
    padding: 10,
  },
  productCard: {
    marginBottom: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffb6c1',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  input: {
    marginBottom: 10,
  },
  logoutButton: {
    marginTop: 10,
  },
});

export default HomeScreen;