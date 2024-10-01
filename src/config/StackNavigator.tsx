import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, MD2Colors } from 'react-native-paper';
import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './FirebaseConfig';
import { View } from 'react-native';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import { ROUTES } from './routes';


interface Routes {
  name: string;
  screen: () => JSX.Element;
}

//no auth

const routesNoAuth: Routes[] = [
  { name: 'ROUTES.AUTH', screen: AuthScreen },
];

//auth

const routesAuth: Routes[] = [
  { name: 'ROUTES.HOME', screen: HomeScreen },
  { name: 'ROUTES.PRODUCT', screen: ProductDetailScreen },
];


const Stack = createStackNavigator();

export const StackNavigator = () => {

  const [isLogin, setIsLogin] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLogin(true);
      }
      setIsLoading(false);
    })
  }, []);

  return (
    <>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator animating={true} color={MD2Colors.red800} size={50} />
        </View>
      ) : (
        <Stack.Navigator>
          {
            !isLogin ?
              routesNoAuth.map(({ name, screen }) => (
                <Stack.Screen
                  key={name}
                  name={name}
                  component={screen}
                  options={{ headerShown: false }}
                />
              ))
              :
              routesAuth.map(({ name, screen }) => (
                <Stack.Screen
                  key={name}
                  name={name}
                  component={screen}
                  options={{ headerShown: false }}
                />
              ))
          }
        </Stack.Navigator>
      )}
    </>
  );
}