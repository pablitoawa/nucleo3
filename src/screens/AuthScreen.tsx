import React, { useState } from 'react';
import { View, Image } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, HelperText } from 'react-native-paper';
import { Icon, MD3Colors } from 'react-native-paper';
import { styles } from '../theme/style';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, User } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../config/FirebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { ROUTES } from '../config/routes';


interface Errors {
    name?: string;
    age?: string;
    username?: string;
    email?: string;
    password?: string;
    submit?: string;
}


const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [age, setAge] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<Errors>({});
    const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);

    const validateEmail = (email: string): boolean => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const validateForm = (): boolean => {
        let newErrors: Errors = {};

        if (!email) newErrors.email = 'Email is required';
        else if (!validateEmail(email)) newErrors.email = 'Email is invalid';

        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        if (!isLogin) {
            if (!name) newErrors.name = 'Name is required';
            if (!age) newErrors.age = 'Age is required';
            else if (isNaN(Number(age)) || Number(age) < 0) newErrors.age = 'Age must be a valid number';
            if (!username) newErrors.username = 'Username is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

        const navigation = useNavigation();
        
    const handleSubmit = async (): Promise<void> => {
        if (validateForm()) {
            try {
                if (isLogin) {
                    // Login
                    await signInWithEmailAndPassword(auth, email, password);
                    console.log('User logged in successfully!');
                    console.log(auth.currentUser?.uid);
                    navigation.navigate('ROUTES.HOME' as never);
                } else {
                    // Register
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                    const user: User = userCredential.user;

                    await set(ref(database, `users/${user.uid}`), {
                        name,
                        age,
                        username,
                    });

                    console.log('User registered successfully!');
                    setRegistrationSuccess(true);
                    setIsLogin(true);
                    setName('');
                    setAge('');
                    setUsername('');
                    setPassword('');
                    setEmail('');
                }
            } catch (e: any) {
                console.error('Error:', e);
                setErrors({ ...errors, submit: e.message });
            }
        }
    };

    const togglePasswordVisibility = (): void => {
        setShowPassword(!showPassword);
    };
    
    return (
        <View style={styles.container}>
            <Image
                source={{ uri: 'https://i.pinimg.com/564x/64/df/1a/64df1ad3e0a50771c771a1091957cac8.jpg' }}
                style={styles.image}
            />

            <Text variant="headlineMedium" style={styles.title}>
                Welcome!
            </Text>

            {registrationSuccess && (
                <Text style={styles.successMessage}>
                    Registration successful! Please log in.
                </Text>
            )}

            <HelperText type="error" visible={!!errors.submit} style={styles.statusMessage}>
                {errors.submit}
            </HelperText>


            <SegmentedButtons
                value={isLogin ? 'login' : 'register'}
                onValueChange={(value) => {
                    setIsLogin(value === 'login');
                    setErrors({});
                    setRegistrationSuccess(false);
                }}
                buttons={[
                    { value: 'login', label: 'Login' },
                    { value: 'register', label: 'Register' },
                ]}
                style={styles.segmentedButtons}
            />

            {!isLogin && (
                <>
                    <TextInput
                        label="Name"
                        value={name}
                        onChangeText={value => setName(value)}
                        style={styles.input}
                        mode="outlined"
                        error={!!errors.name}
                        left={<TextInput.Icon icon={() => <Icon source="account" color={MD3Colors.tertiary30} size={24} />} />}
                    />
                    <HelperText type="error" visible={!!errors.name}>
                        {errors.name}
                    </HelperText>

                    <TextInput
                        label="Age"
                        value={age}
                        onChangeText={value => setAge(value)}
                        style={styles.input}
                        mode="outlined"
                        error={!!errors.age}
                        keyboardType="numeric"
                        left={<TextInput.Icon icon={() => <Icon source="cake" color={MD3Colors.tertiary30} size={24} />} />}
                    />
                    <HelperText type="error" visible={!!errors.age}>
                        {errors.age}
                    </HelperText>

                    <TextInput
                        label="Username"
                        value={username}
                        onChangeText={value => setUsername(value)}
                        style={styles.input}
                        mode="outlined"
                        error={!!errors.username}
                        left={<TextInput.Icon icon={() => <Icon source="account" color={MD3Colors.tertiary30} size={24} />} />}
                    />
                    <HelperText type="error" visible={!!errors.username}>
                        {errors.username}
                    </HelperText>
                </>
            )}

            <TextInput
                label="Email"
                value={email}
                onChangeText={value => setEmail(value)}
                style={styles.input}
                mode="outlined"
                error={!!errors.email}
                keyboardType="email-address"
                left={<TextInput.Icon icon={() => <Icon source="email" color={MD3Colors.tertiary30} size={24} />} />}
            />
            <HelperText type="error" visible={!!errors.email}>
                {errors.email}
            </HelperText>

            <TextInput
                label="Password"
                value={password}
                onChangeText={value => setPassword(value)}
                style={styles.input}
                secureTextEntry={!showPassword}
                mode="outlined"
                error={!!errors.password}
                left={<TextInput.Icon icon={() => <Icon source="lock" color={MD3Colors.tertiary30} size={24} />} />}
                right={
                    <TextInput.Icon
                        icon={() => <Icon source={showPassword ? "eye-off" : "eye"} color={MD3Colors.tertiary30} size={24} />}
                        onPress={togglePasswordVisibility}
                    />
                }
            />
            <HelperText type="error" visible={!!errors.password}>
                {errors.password}
            </HelperText>

            <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.button}
                icon={() => <Icon source={isLogin ? "login" : "account-plus"} size={24} color="white" />}
            >
                {isLogin ? 'Login' : 'Register'}
            </Button>

        </View>
    );
};

export default AuthScreen;