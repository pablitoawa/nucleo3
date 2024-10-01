import React from 'react'
import { PaperProvider } from 'react-native-paper'
import { NavigationContainer } from '@react-navigation/native'
import { StackNavigator } from './src/config/StackNavigator'

const App = () => {
  return (
    <NavigationContainer>
      <PaperProvider>
        <StackNavigator />
      </PaperProvider>
    </NavigationContainer>
  )
}

export default App