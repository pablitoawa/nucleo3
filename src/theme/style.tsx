import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fce4ec',
    },
    image: {
        width: 300,
        height: 150,
        alignSelf: 'center',
        marginBottom: 20,
        borderRadius: 20,
    },
    title: {
        textAlign: 'center',
        marginBottom: 20,
        color: '#f06292',
    },
    successMessage: {
        textAlign: 'center',
        marginBottom: 20,
        color: '#388e3c',
    },
    statusMessage: {
        textAlign: 'center',
    },
    errorMessage : {
        textAlign: 'center',
        marginBottom: 20,
        color: '#d32f2f',
    },
    segmentedButtons: {
        marginBottom: 10,
    },
    input: {
        marginBottom: 2,
        backgroundColor: '#fff1f8',
    },
    button: {
        marginTop: 10,
        borderRadius: 25,
        paddingVertical: 8,
        backgroundColor: '#ffb6c1',
    },
});