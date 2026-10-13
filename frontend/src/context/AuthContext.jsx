// ============================================================
// XAAJ - AUTH CONTEXT
// ============================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'

import { authService } from '../services/api'


// ============================================================
// CONSTANTS
// ============================================================

const AuthContext = createContext(null)

const TOKEN_KEY = 'xaaj_token'
const USER_KEY = 'xaaj_user'


// ============================================================
// AUTH PROVIDER
// ============================================================

export function AuthProvider({ children }) {

  // ==========================================================
  // AUTH STATE
  // ==========================================================

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)


  // ==========================================================
  // SAVE AUTH DATA
  // ==========================================================

  const saveAuth = useCallback(result => {

    if (!result) return

    const token = result?.token
    const loggedInUser = result?.user


    // --------------------------------------------------------
    // Save token
    // --------------------------------------------------------

    if (token) {
      localStorage.setItem(
        TOKEN_KEY,
        token
      )
    }


    // --------------------------------------------------------
    // Save user
    // --------------------------------------------------------

    if (loggedInUser) {

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(loggedInUser)
      )

      setUser(loggedInUser)
    }

  }, [])


  // ==========================================================
  // CLEAR AUTH DATA
  // ==========================================================

  const clearAuth = useCallback(() => {

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)

    setUser(null)

  }, [])


  // ==========================================================
  // RESTORE AUTH SESSION
  // ==========================================================

  useEffect(() => {

    let cancelled = false

    const restoreSession = async () => {

      try {

        const token =
          localStorage.getItem(TOKEN_KEY)

        const storedUser =
          localStorage.getItem(USER_KEY)


        // ----------------------------------------------------
        // No token = logged out
        // ----------------------------------------------------

        if (!token) {

          if (!cancelled) {
            setUser(null)
            setLoading(false)
          }

          return
        }


        // ----------------------------------------------------
        // Restore cached user temporarily
        // ----------------------------------------------------

        if (storedUser) {

          try {

            const parsedUser =
              JSON.parse(storedUser)

            if (!cancelled) {
              setUser(parsedUser)
            }

          } catch {

            localStorage.removeItem(
              USER_KEY
            )

          }
        }


        // ----------------------------------------------------
        // Verify token with backend
        // ----------------------------------------------------

        const result =
          await authService.me()

        if (cancelled) return


        const currentUser =
          result?.user ||
          result?.data?.user ||
          result?.data


        if (
          result?.success &&
          currentUser
        ) {

          localStorage.setItem(
            USER_KEY,
            JSON.stringify(currentUser)
          )

          setUser(currentUser)

        } else {

          clearAuth()
        }

      } catch (error) {

        if (cancelled) return

        console.error(
          'Auth session restore error:',
          error
        )


        // ----------------------------------------------------
        // If backend is temporarily unavailable,
        // keep cached user.
        // ----------------------------------------------------

        const cachedUser =
          localStorage.getItem(USER_KEY)

        if (!cachedUser) {
          clearAuth()
        }

      } finally {

        if (!cancelled) {
          setLoading(false)
        }

      }

    }

    restoreSession()


    return () => {
      cancelled = true
    }

  }, [clearAuth])


  // ==========================================================
  // REGISTER
  // ==========================================================

  const register = useCallback(async data => {

    try {

      // ------------------------------------------------------
      // Clean input
      // ------------------------------------------------------

      const name =
        data?.name?.trim() || ''

      const email =
        data?.email?.trim().toLowerCase() || ''

      const password =
        data?.password || ''

      const phone =
        data?.phone?.trim() || ''

      const address =
        data?.address?.trim() || ''

      const city =
        data?.city?.trim() || ''

      const state =
        data?.state?.trim() || ''

      const pin =
        data?.pin?.trim() || ''


      // ------------------------------------------------------
      // Validation
      // ------------------------------------------------------

      if (!name) {
        return {
          success: false,
          message: 'Name is required.'
        }
      }

      if (!email) {
        return {
          success: false,
          message: 'Email is required.'
        }
      }

      if (!password) {
        return {
          success: false,
          message: 'Password is required.'
        }
      }

      if (password.length < 8) {
        return {
          success: false,
          message:
            'Password must be at least 8 characters.'
        }
      }

      if (!phone) {
        return {
          success: false,
          message: 'Phone number is required.'
        }
      }

      if (!/^\d{10,15}$/.test(phone)) {
        return {
          success: false,
          message:
            'Please enter a valid phone number.'
        }
      }

      if (!address) {
        return {
          success: false,
          message: 'Full address is required.'
        }
      }

      if (!city) {
        return {
          success: false,
          message: 'City is required.'
        }
      }

      if (!state) {
        return {
          success: false,
          message: 'State is required.'
        }
      }

      if (!/^\d{6}$/.test(pin)) {
        return {
          success: false,
          message:
            'PIN code must be 6 digits.'
        }
      }


      // ------------------------------------------------------
      // Backend registration
      // ------------------------------------------------------

      const result =
        await authService.register({
          name,
          email,
          password,
          phone,
          address,
          city,
          state,
          pin
        })


      // ------------------------------------------------------
      // First registration requires email verification.
      // Do NOT auto-login here.
      // ------------------------------------------------------

      if (
        result?.success &&
        result?.requiresEmailVerification
      ) {

        return {
          ...result,
          requiresEmailVerification: true
        }

      }


      // ------------------------------------------------------
      // Safety fallback
      // ------------------------------------------------------

      if (
        result?.success &&
        result?.token &&
        result?.user
      ) {

        saveAuth(result)

      }


      return result

    } catch (error) {

      console.error(
        'Register error:',
        error
      )

      return {
        success: false,
        message:
          error?.message ||
          'Unable to create your account.'
      }

    }

  }, [saveAuth])


  // ==========================================================
  // VERIFY EMAIL
  // ==========================================================

  const verifyEmail = useCallback(async (
    email,
    otp
  ) => {

    try {

      const cleanEmail =
        email?.trim().toLowerCase() || ''

      const cleanOtp =
        otp?.trim() || ''


      if (!cleanEmail) {
        return {
          success: false,
          message: 'Email is required.'
        }
      }

      if (!/^\d{6}$/.test(cleanOtp)) {
        return {
          success: false,
          message:
            'OTP must be a 6-digit number.'
        }
      }


      const result =
        await authService.verifyEmail({
          email: cleanEmail,
          otp: cleanOtp
        })


      // ------------------------------------------------------
      // Successful verification = automatic login
      // ------------------------------------------------------

      if (
        result?.success &&
        result?.token &&
        result?.user
      ) {

        saveAuth(result)

      }


      return result

    } catch (error) {

      console.error(
        'Verify email error:',
        error
      )

      return {
        success: false,
        message:
          error?.message ||
          'Unable to verify your email.'
      }

    }

  }, [saveAuth])


  // ==========================================================
  // RESEND EMAIL VERIFICATION OTP
  // ==========================================================

  const resendVerification = useCallback(async email => {

    try {

      const cleanEmail =
        email?.trim().toLowerCase() || ''


      if (!cleanEmail) {
        return {
          success: false,
          message: 'Email is required.'
        }
      }


      return await authService.resendVerification({
        email: cleanEmail
      })

    } catch (error) {

      console.error(
        'Resend verification error:',
        error
      )

      return {
        success: false,
        message:
          error?.message ||
          'Unable to resend verification OTP.'
      }

    }

  }, [])


  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = useCallback(async (
    email,
    password
  ) => {

    try {

      const cleanEmail =
        email?.trim().toLowerCase() || ''


      if (!cleanEmail) {
        return {
          success: false,
          message: 'Email is required.'
        }
      }

      if (!password) {
        return {
          success: false,
          message: 'Password is required.'
        }
      }


      const result =
        await authService.login({
          email: cleanEmail,
          password
        })


      // ------------------------------------------------------
      // Save authenticated user
      // ------------------------------------------------------

      if (
        result?.success &&
        result?.token &&
        result?.user
      ) {

        saveAuth(result)

      }


      return result

    } catch (error) {

      console.error(
        'Login error:',
        error
      )

      return {
        success: false,
        message:
          error?.message ||
          'Unable to login. Please try again.'
      }

    }

  }, [saveAuth])


  // ==========================================================
  // FORGOT PASSWORD
  // ==========================================================

  const forgotPassword = useCallback(async email => {

    try {

      const cleanEmail =
        email?.trim().toLowerCase() || ''


      if (!cleanEmail) {
        return {
          success: false,
          message: 'Email is required.'
        }
      }


      return await authService.forgotPassword({
        email: cleanEmail
      })

    } catch (error) {

      console.error(
        'Forgot password error:',
        error
      )

      return {
        success: false,
        message:
          error?.message ||
          'Unable to send password reset OTP.'
      }

    }

  }, [])


  // ==========================================================
  // VERIFY PASSWORD RESET OTP
  // ==========================================================

  const verifyResetOtp = useCallback(async (
    email,
    otp
  ) => {

    try {

      const cleanEmail =
        email?.trim().toLowerCase() || ''

      const cleanOtp =
        otp?.trim() || ''


      if (!cleanEmail) {
        return {
          success: false,
          message: 'Email is required.'
        }
      }

      if (!/^\d{6}$/.test(cleanOtp)) {
        return {
          success: false,
          message:
            'OTP must be a 6-digit number.'
        }
      }


      return await authService.verifyResetOtp({
        email: cleanEmail,
        otp: cleanOtp
      })

    } catch (error) {

      console.error(
        'Verify reset OTP error:',
        error
      )

      return {
        success: false,
        message:
          error?.message ||
          'Unable to verify password reset OTP.'
      }

    }

  }, [])


  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  const resetPassword = useCallback(async (
    email,
    resetToken,
    newPassword,
    confirmPassword
  ) => {

    try {

      // ------------------------------------------------------
      // Validation
      // ------------------------------------------------------

      if (!email?.trim()) {
        return {
          success: false,
          message: 'Email is required.'
        }
      }

      if (!resetToken?.trim()) {
        return {
          success: false,
          message: 'Reset token is missing.'
        }
      }

      if (!newPassword) {
        return {
          success: false,
          message:
            'New password is required.'
        }
      }

      if (!confirmPassword) {
        return {
          success: false,
          message:
            'Please confirm your new password.'
        }
      }

      if (newPassword.length < 8) {
        return {
          success: false,
          message:
            'Password must be at least 8 characters.'
        }
      }

      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message:
            'Passwords do not match.'
        }
      }


      // ------------------------------------------------------
      // Reset password
      // ------------------------------------------------------

      return await authService.resetPassword({
        email:
          email.trim().toLowerCase(),

        resetToken:
          resetToken.trim(),

        password:
          newPassword,

        confirmPassword
      })

    } catch (error) {

      console.error(
        'Reset password error:',
        error
      )

      return {
        success: false,
        message:
          error?.message ||
          'Unable to reset your password.'
      }

    }

  }, [])


  // ==========================================================
  // REFRESH CURRENT USER
  // ==========================================================

  const refreshUser = useCallback(async () => {

    try {

      const result =
        await authService.me()


      const currentUser =
        result?.user ||
        result?.data?.user ||
        result?.data


      if (
        result?.success &&
        currentUser
      ) {

        localStorage.setItem(
          USER_KEY,
          JSON.stringify(currentUser)
        )

        setUser(currentUser)

        return {
          ...result,
          user: currentUser
        }

      }


      return result

    } catch (error) {

      console.error(
        'Refresh user error:',
        error
      )

      return {
        success: false,
        message:
          error?.message ||
          'Unable to refresh user.'
      }

    }

  }, [])


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = useCallback(async () => {

    try {

      await authService.logout()

    } catch (error) {

      console.error(
        'Logout API error:',
        error
      )

    } finally {

      // ------------------------------------------------------
      // Always clear local authentication
      // ------------------------------------------------------

      clearAuth()

    }


    return {
      success: true
    }

  }, [clearAuth])


  // ==========================================================
  // AUTH CONTEXT VALUE
  // ==========================================================

  const value = useMemo(
    () => ({
      user,
      loading,

      register,
      verifyEmail,
      resendVerification,

      login,

      forgotPassword,
      verifyResetOtp,
      resetPassword,

      refreshUser,

      logout
    }),
    [
      user,
      loading,
      register,
      verifyEmail,
      resendVerification,
      login,
      forgotPassword,
      verifyResetOtp,
      resetPassword,
      refreshUser,
      logout
    ]
  )


  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )

}


// ============================================================
// USE AUTH HOOK
// ============================================================

export function useAuth() {

  const context =
    useContext(AuthContext)

  if (!context) {

    throw new Error(
      'useAuth must be used inside AuthProvider'
    )

  }

  return context
}


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default AuthContext