// import { observer } from "mobx-react-lite"
// import { ProfileView } from "../views/profileView"

// export const Profile = observer(function SummaryRender(props) {
//     return (
//         <ProfileView/>
//     )
// })

import { useState, useEffect } from 'react';
import { FIREBASE_AUTH, FIREBASE_DB } from '../firestoreModel';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';
import { observer } from "mobx-react-lite";
import { ProfileView } from "../views/profileView"

function useProfilePresenter(model) {
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const auth = FIREBASE_AUTH;

  // Check for user session on component mount
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user) {
        model.setUserID(user.uid);
        loadUserProfile(user.uid);
      } else {
        model.setUserID(null);
        resetForm();
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  // Show toast notification
  const showToast = (type, message1, message2 = '') => {
    Toast.show({
      type: type,
      text1: message1,
      text2: message2,
      position: 'bottom',
      visibilityTime: 4000,
    });
  };

  // Reset form fields
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setAge('');
    setHeight('');
    setWeight('');
    setOldPassword('');
    setNewPassword('');
    setIsEditing(false);
    setIsLogin(true);
  };

  // Load user profile data from Firestore
  const loadUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(FIREBASE_DB, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setEmail(userData.email || '');
        setFirstName(userData.firstName || '');
        setLastName(userData.lastName || '');
        setAge(userData.age || '');
        setHeight(userData.height || '');
        setWeight(userData.weight || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showToast('error', 'Failed to load profile data');
    }
  };

  // Save user profile data to Firestore
  const saveUserProfile = async (userId) => {
    try {
      await setDoc(doc(FIREBASE_DB, 'users', userId), {
        firstName,
        lastName,
        age,
        height,
        weight,
        email
      }, { merge: true });
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  // Validation functions
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateRequiredFields = () => {
    return firstName && lastName && age && height && weight;
  };

  const validateNumericFields = () => {
    return !isNaN(age) && !isNaN(height) && !isNaN(weight);
  };

  const validatePositiveNumbers = () => {
    return parseInt(age) >= 0 && parseInt(height) >= 0 && parseInt(weight) >= 0;
  };

  const validatePasswordMatch = () => {
    return password === confirmPassword;
  };

  // Sign in with Firebase
  const handleSignIn = async () => {
    if (!email || !password) {
      showToast('error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      model.isAuthenticated = true;
      showToast('success', 'Welcome back!', 'You are logged in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      let errorMessage = 'Sign in failed. Please check your credentials.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email format';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Invalid email or password';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later';
          break;
      }
      
      showToast('error', 'Sign In Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with Firebase
  const handleSignUp = async () => {
    // Validation
    if (!validateRequiredFields()) {
      showToast('error', 'Please fill all required fields');
      return;
    }

    if (!validatePasswordMatch()) {
      showToast('error', 'Passwords don\'t match');
      return;
    }

    if (!validateEmail(email)) {
      showToast('error', 'Invalid email format');
      return;
    }

    if (!validateNumericFields()) {
      showToast('error', 'Age, height, and weight must be numbers');
      return;
    }

    if (!validatePositiveNumbers()) {
      showToast('error', 'Age, height, and weight must be positive numbers');
      return;
    }

    setIsLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Save additional user data in Firestore
      await setDoc(doc(FIREBASE_DB, 'users', userCredential.user.uid), {
        firstName,
        lastName,
        age,
        height,
        weight,
        email,
        createdAt: new Date().toISOString()
      });

      // Update the model with the new user ID
      model.setUserID(userCredential.user.uid);
      
      showToast('success', 'Account created!', 'You are signed up successfully');
    } catch (error) {
      console.error('Sign up error:', error);
      let errorMessage = 'Sign up failed. Please try again.';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is invalid';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
      }

      showToast('error', 'Sign Up Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const handleUpdateProfile = async () => {
    if (!currentUser) return;

    // Validation
    if (!validateRequiredFields()) {
      showToast('error', 'Please fill all required fields');
      return;
    }

    if (!validateNumericFields()) {
      showToast('error', 'Age, height, and weight must be numbers');
      return;
    }

    if (!validatePositiveNumbers()) {
      showToast('error', 'Age, height, and weight must be positive numbers');
      return;
    }

    setIsLoading(true);
    try {
      // Update email if changed and if user provided old password for reauthentication
      if (email !== currentUser.email && oldPassword) {
        // Reauthenticate user
        const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
        await reauthenticateWithCredential(currentUser, credential);
        
        // Update email
        await updateEmail(currentUser, email);
      }

      // Update password if provided
      if (newPassword && oldPassword) {
        // Reauthenticate user
        const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
        await reauthenticateWithCredential(currentUser, credential);
        
        // Update password
        await updatePassword(currentUser, newPassword);
      }

      // Update profile data in Firestore
      await updateDoc(doc(FIREBASE_DB, 'users', currentUser.uid), {
        firstName,
        lastName,
        age,
        height,
        weight,
        email
      });

      showToast('success', 'Profile updated successfully');
      setIsEditing(false);
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.code === 'auth/requires-recent-login' || error.code === 'auth/invalid-credential') {
        showToast('error', 'Authentication Failed', 'Please verify your current password');
      } else if (error.code === 'auth/weak-password') {
        showToast('error', 'Weak Password', 'Password should be at least 6 characters');
      } else {
        showToast('error', 'Update Failed', error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Delete user account
  const handleDeleteAccount = async () => {
    if (!currentUser) {
      showToast('error', 'No user is currently logged in');
      return;
    }

    // Confirmation via alert
    if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      setIsLoading(true);
      try {
        // Delete user data from Firestore
        await deleteDoc(doc(FIREBASE_DB, 'users', currentUser.uid));
        
        // Delete authentication account
        await deleteUser(currentUser);
        
        // Update model
        model.setUserID(null);
        
        showToast('success', 'Account deleted successfully');
      } catch (error) {
        console.error('Delete account error:', error);
        
        if (error.code === 'auth/requires-recent-login') {
          showToast('error', 'Reauthentication Required', 'Please sign in again to delete your account');
          handleLogout();
        } else {
          showToast('error', 'Deletion Failed', error.message);
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Log out user
  const handleLogout = async () => {
    try {
      await signOut(auth);
      model.setUserID(null);
      resetForm();
      model.isAuthenticated = false;
      showToast('success', 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('error', 'Logout Failed', error.message);
    }
  };

  // Toggle between login and signup modes
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setPassword('');
    setConfirmPassword('');
  };

  // Toggle edit profile mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setOldPassword('');
    setNewPassword('');
  };

  // Confirm functionality
  const confirm = (message) => {
    return window.confirm(message);
  };

  return {
    // State
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
    
    // State setters
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
    
    // Actions
    handleSignIn,
    handleSignUp,
    handleUpdateProfile,
    handleDeleteAccount,
    handleLogout,
    toggleAuthMode,
    toggleEditMode
  };
}

export const Profile = observer(function SummaryRender(props) {
    const { model } = props;
    const presenter = useProfilePresenter(model);
    
    return (
        <ProfileView 
            // State
            email={presenter.email}
            password={presenter.password}
            confirmPassword={presenter.confirmPassword}
            firstName={presenter.firstName}
            lastName={presenter.lastName}
            age={presenter.age}
            height={presenter.height}
            weight={presenter.weight}
            isLoading={presenter.isLoading}
            isLogin={presenter.isLogin}
            isEditing={presenter.isEditing}
            oldPassword={presenter.oldPassword}
            newPassword={presenter.newPassword}
            currentUser={presenter.currentUser}
            
            // State setters
            setEmail={presenter.setEmail}
            setPassword={presenter.setPassword}
            setConfirmPassword={presenter.setConfirmPassword}
            setFirstName={presenter.setFirstName}
            setLastName={presenter.setLastName}
            setAge={presenter.setAge}
            setHeight={presenter.setHeight}
            setWeight={presenter.setWeight}
            setOldPassword={presenter.setOldPassword}
            setNewPassword={presenter.setNewPassword}
            
            // Actions
            handleSignIn={presenter.handleSignIn}
            handleSignUp={presenter.handleSignUp}
            handleUpdateProfile={presenter.handleUpdateProfile}
            handleDeleteAccount={presenter.handleDeleteAccount}
            handleLogout={presenter.handleLogout}
            toggleAuthMode={presenter.toggleAuthMode}
            toggleEditMode={presenter.toggleEditMode}
        />
    );
});
