// import { StyleSheet, Text, View } from "react-native"
// import { router } from "expo-router"

// export function ProfileView(props) {
//   return (
//     <View style={styles.outerContainer}>
//       <Text style={styles.number}>Profile Tab</Text>
//     </View>
//   )
// }

// const styles = StyleSheet.create({
//   outerContainer: {
//     padding: 16,
//     margin: 50,
//     borderRadius: 8,
//     width: "90%",
//     maxWidth: "90%",
//     alignSelf: "center",
//   },
//   number: {
//     fontSize: 24,
//     fontWeight: "bold",
//   },
// })

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
  ScrollView,
  Platform
} from 'react-native';
import Toast from 'react-native-toast-message';

export function ProfileView(props) {
  const {
    // State variables
    email,
    password,
    confirmPassword,
    firstName,
    lastName,
    age,
    height,
    weight,
    isLoading,
    isLogin,
    isEditing,
    oldPassword,
    newPassword,
    currentUser,
    
    // State handlers
    setEmail,
    setPassword,
    setConfirmPassword,
    setFirstName,
    setLastName,
    setAge,
    setHeight,
    setWeight,
    setOldPassword,
    setNewPassword,
    
    // Action handlers
    handleSignIn,
    handleSignUp,
    handleUpdateProfile,
    handleDeleteAccount,
    handleLogout,
    toggleAuthMode,
    toggleEditMode
  } = props;

  // Render different views based on user state
  const renderAuthView = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Sign in to continue' : 'Join us to get started'}
        </Text>
      </View>

      {!isLogin && (
        <>
          <View style={styles.nameContainer}>
            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={[styles.input, styles.halfInput]}
              placeholderTextColor="#999"
            />
            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={[styles.input, styles.halfInput]}
              placeholderTextColor="#999"
            />
          </View>
          <TextInput
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#999"
          />
          <View style={styles.measurementContainer}>
            <TextInput
              placeholder="Height (cm)"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              placeholderTextColor="#999"
            />
            <TextInput
              placeholder="Weight (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              placeholderTextColor="#999"
            />
          </View>
        </>
      )}

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        placeholderTextColor="#999"
      />
      
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="#999"
      />

      {!isLogin && (
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#999"
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={isLogin ? handleSignIn : handleSignUp}
      >
        <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleAuthMode} style={styles.toggleAuth}>
        <Text style={styles.toggleAuthText}>
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderProfileView = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>
          {`Welcome Back, ${firstName}`}
        </Text>
        <Text style={styles.subtitle}>
          Get healthier with us
        </Text>
      </View>

      {isEditing ? (
        // Edit profile form
        <>
          <View style={styles.nameContainer}>
            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={[styles.input, styles.halfInput]}
              placeholderTextColor="#999"
            />
            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={[styles.input, styles.halfInput]}
              placeholderTextColor="#999"
            />
          </View>
          <TextInput
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#999"
          />
          <View style={styles.measurementContainer}>
            <TextInput
              placeholder="Height (cm)"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              placeholderTextColor="#999"
            />
            <TextInput
              placeholder="Weight (kg)"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
              placeholderTextColor="#999"
            />
          </View>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="Current Password (required for email/password changes)"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#999"
          />
          <TextInput
            placeholder="New Password (leave blank to keep current)"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#999"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.updateButton, styles.halfButton]}
              onPress={handleUpdateProfile}
            >
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, styles.halfButton]}
              onPress={toggleEditMode}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        // Profile summary and action buttons
        <>
          <View style={styles.profileSummary}>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Name:</Text>
              <Text style={styles.profileValue}>{firstName} {lastName}</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Age:</Text>
              <Text style={styles.profileValue}>{age} years</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Height:</Text>
              <Text style={styles.profileValue}>{height} cm</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Weight:</Text>
              <Text style={styles.profileValue}>{weight} kg</Text>
            </View>
            <View style={styles.profileItem}>
              <Text style={styles.profileLabel}>Email:</Text>
              <Text style={styles.profileValue}>{email}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={toggleEditMode}
          >
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.buttonText}>Delete Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
        </>
      )}
    </>
  );

  // Main render
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loaderText}>Please wait...</Text>
          </View>
        ) : (
          currentUser ? renderProfileView() : renderAuthView()
        )}
      </KeyboardAvoidingView>
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  measurementContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#4A90E2',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  updateButton: {
    backgroundColor: '#4CD964',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  logoutButton: {
    backgroundColor: '#8E8E93',
  },
  halfButton: {
    width: '48%',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleAuth: {
    alignSelf: 'center',
    marginBottom: 24,
    padding: 8,
  },
  toggleAuthText: {
    color: '#4A90E2',
    fontSize: 16,
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loaderText: {
    marginTop: 12,
    color: '#666',
    fontSize: 16,
  },
  // Profile summary styles
  profileSummary: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  profileItem: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e7ff',
  },
  profileLabel: {
    width: '30%',
    fontWeight: '600',
    color: '#4A5568',
    fontSize: 16,
  },
  profileValue: {
    width: '70%',
    color: '#2D3748',
    fontSize: 16,
  },
});