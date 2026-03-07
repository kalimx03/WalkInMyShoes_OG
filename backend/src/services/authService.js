import { signIn, signUp, signOut, getCurrentUser, fetchUserAttributes, updateUserAttributes, changePassword } from 'aws-amplify/auth'

class AuthService {
  constructor() {
    this.user = null
    this.isInitialized = false
  }

  async initialize() {
    try {
      this.user = await getCurrentUser()
      this.isInitialized = true
      return this.user
    } catch (error) {
      console.log('No authenticated user found on initialization')
      this.isInitialized = true
      return null
    }
  }

  async signInUser(email, password) {
    try {
      const { isSignedIn, userId } = await signIn({
        username: email,
        password
      })
      
      if (isSignedIn) {
        this.user = { email, userId, isSignedIn }
        localStorage.setItem('walkinmyshoes_user_id', userId)
        return this.user
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw new Error(error.message || 'Failed to sign in')
    }
  }

  async signUpUser(email, password, name) {
    try {
      const { userId } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
            preferred_username: email
          }
        }
      })
      
      this.user = { email, userId, name }
      return { userId, email, requiresConfirmation: true }
    } catch (error) {
      console.error('Sign up error:', error)
      throw new Error(error.message || 'Failed to sign up')
    }
  }

  async confirmSignUp(email, confirmationCode) {
    try {
      const result = await signUp({
        username: email,
        options: {
          userAttributes: {
            email
          },
          autoSignIn: true
        }
      })
      return { success: true, message: 'Email confirmed successfully' }
    } catch (error) {
      console.error('Confirm sign up error:', error)
      throw new Error(error.message || 'Failed to confirm sign up')
    }
  }

  async signOutUser() {
    try {
      await signOut()
      this.user = null
      localStorage.removeItem('walkinmyshoes_user_id')
      return { success: true, message: 'Signed out successfully' }
    } catch (error) {
      console.error('Sign out error:', error)
      throw new Error(error.message || 'Failed to sign out')
    }
  }

  async getCurrentAuthenticatedUser() {
    try {
      const user = await getCurrentUser()
      this.user = user
      return user
    } catch (error) {
      console.log('No current authenticated user:', error.message)
      return null
    }
  }

  async getUserAttributes() {
    try {
      const attributes = await fetchUserAttributes()
      return attributes
    } catch (error) {
      console.error('Fetch user attributes error:', error)
      throw new Error(error.message || 'Failed to fetch user attributes')
    }
  }

  async updateUserAttributesData(attributes) {
    try {
      await updateUserAttributes({ userAttributes: attributes })
      this.user = { ...this.user, ...attributes }
      return { success: true, message: 'User attributes updated' }
    } catch (error) {
      console.error('Update user attributes error:', error)
      throw new Error(error.message || 'Failed to update user attributes')
    }
  }

  async changePasswordUser(oldPassword, newPassword) {
    try {
      await changePassword({ oldPassword, newPassword })
      return { success: true, message: 'Password changed successfully' }
    } catch (error) {
      console.error('Change password error:', error)
      throw new Error(error.message || 'Failed to change password')
    }
  }

  async forgotPasswordUser(email) {
    try {
      const result = await signIn({
        username: email,
        options: {
          resendSignUpLink: true
        }
      })
      return { success: true, message: 'Password reset email sent' }
    } catch (error) {
      console.error('Forgot password error:', error)
      throw new Error(error.message || 'Failed to send password reset email')
    }
  }

  // Guest mode for development/demo
  signInAsGuest() {
    const guestUser = {
      id: `guest_${Date.now()}`,
      name: 'Guest User',
      email: 'guest@walkinmyshoes.local',
      isGuest: true,
      isSignedIn: false
    }
    
    this.user = guestUser
    localStorage.setItem('walkinmyshoes_user_id', guestUser.id)
    return guestUser
  }

  // Validation
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  validatePassword(password) {
    const minLength = 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    
    return password.length >= minLength && hasUppercase && hasLowercase && hasNumber
  }

  // Helper methods
  isAuthenticated() {
    return this.user !== null && this.user.isSignedIn === true
  }

  getUser() {
    return this.user
  }

  getUserId() {
    return this.user?.userId || this.user?.id || localStorage.getItem('walkinmyshoes_user_id') || null
  }

  getEmail() {
    return this.user?.email || null
  }

  isGuest() {
    return this.user?.isGuest === true
  }

  // Error handling
  getErrorMessage(error) {
    const errorCode = error.code || error.name
    
    if (errorCode === 'UserNotConfirmedException') {
      return 'Please check your email and confirm your account before signing in.'
    } else if (errorCode === 'NotAuthorizedException') {
      return 'Invalid email or password. Please try again.'
    } else if (errorCode === 'UserNotFoundException') {
      return 'User not found. Please check your credentials.'
    } else if (errorCode === 'UsernameExistsException') {
      return 'An account with this email already exists.'
    } else if (errorCode === 'InvalidPassword') {
      return 'Password does not meet requirements. Must be at least 8 characters with uppercase, lowercase, and numbers.'
    } else if (errorCode === 'InvalidParameterException') {
      return 'Invalid input. Please check your information and try again.'
    } else {
      return error.message || 'An error occurred. Please try again.'
    }
  }
}

export default new AuthService()
