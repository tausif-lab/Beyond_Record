// Real authentication service with JWT and API integration

export interface User
{
    id: string
    email: string
    name: string
    role: "student" | "faculty" | "admin" | "institution"
    avatar?: string
    institution?: string
    isVerified?: boolean
}

export interface AuthState
{
    user: User | null
    token: string | null
    isAuthenticated: boolean
}

// API base URL
const API_BASE_URL = '/api'

// Make authenticated API request
function makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response>
{
    const token = localStorage.getItem('auth_token')

    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        credentials: 'include', // Include cookies
    })
}

export const authService = {
    // Real login function
    async login(email: string, password: string): Promise<{ user: User; token: string } | null>
    {
        try
        {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            })

            if (!response.ok)
            {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Login failed')
            }

            const data = await response.json()

            // Store token and user data
            localStorage.setItem('auth_token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))

            return { user: data.user, token: data.token }
        } catch (error)
        {
            console.error('Login error:', error)
            return null
        }
    },

    // Real registration function
    async register(
        email: string,
        password: string,
        name: string,
        role: "student" | "faculty",
        institutionId?: string
    ): Promise<{ user: User; token: string } | null>
    {
        try
        {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password, name, role, institutionId }),
            })

            if (!response.ok)
            {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Registration failed')
            }

            const data = await response.json()

            // Store token and user data
            localStorage.setItem('auth_token', data.token)
            localStorage.setItem('user', JSON.stringify(data.user))

            return { user: data.user, token: data.token }
        } catch (error)
        {
            console.error('Registration error:', error)
            throw error
        }
    },

    // Get current user from localStorage and validate with server
    getCurrentUser(): User | null
    {
        if (typeof window === "undefined") return null

        const token = localStorage.getItem('auth_token')
        const userStr = localStorage.getItem('user')

        if (!token || !userStr) return null

        try
        {
            const user = JSON.parse(userStr)

            // More lenient token expiry check - only logout if token is definitely expired
            const tokenParts = token.split('.')
            if (tokenParts.length === 3)
            {
                try
                {
                    const payloadPart = tokenParts[1]
                    if (!payloadPart) {
                        throw new Error('Invalid token format - missing payload')
                    }
                    const payload = JSON.parse(atob(payloadPart))
                    // Give 5 minute buffer before considering token expired
                    const bufferTime = 5 * 60 * 1000 // 5 minutes
                    if (payload.exp && (payload.exp * 1000) < (Date.now() - bufferTime))
                    {
                        console.log('Token has expired, logging out')
                        this.logout()
                        return null
                    }
                } catch (tokenParseError)
                {
                    // Don't logout on parse errors in development - just log
                    if (process.env.NODE_ENV === 'development')
                    {
                        console.warn('Token parse error (ignoring in dev):', tokenParseError)
                        return user
                    }
                    this.logout()
                    return null
                }
            }

            return user
        } catch
        {
            this.logout()
            return null
        }
    },

    // Get student profile data
    async getStudentProfile(): Promise<any>
    {
        try
        {
            const response = await makeAuthenticatedRequest(`${API_BASE_URL}/student/profile`)

            if (!response.ok)
            {
                throw new Error('Failed to fetch student profile')
            }

            return await response.json()
        } catch (error)
        {
            console.error('Get student profile error:', error)
            throw error
        }
    },

    // Update student profile
    async updateStudentProfile(profileData: any): Promise<any>
    {
        try
        {
            const response = await makeAuthenticatedRequest(`${API_BASE_URL}/student/profile`, {
                method: 'PUT',
                body: JSON.stringify(profileData),
            })

            if (!response.ok)
            {
                throw new Error('Failed to update student profile')
            }

            return await response.json()
        } catch (error)
        {
            console.error('Update student profile error:', error)
            throw error
        }
    },

    // Get student portfolio
    async getStudentPortfolio(): Promise<any>
    {
        try
        {
            const response = await makeAuthenticatedRequest(`${API_BASE_URL}/student/portfolio`)

            if (!response.ok)
            {
                throw new Error('Failed to fetch portfolio')
            }

            return await response.json()
        } catch (error)
        {
            console.error('Get portfolio error:', error)
            throw error
        }
    },

    // Update student portfolio
    async updateStudentPortfolio(portfolioData: any): Promise<any>
    {
        try
        {
            const response = await makeAuthenticatedRequest(`${API_BASE_URL}/student/portfolio`, {
                method: 'PUT',
                body: JSON.stringify(portfolioData),
            })

            if (!response.ok)
            {
                throw new Error('Failed to update portfolio')
            }

            return await response.json()
        } catch (error)
        {
            console.error('Update portfolio error:', error)
            throw error
        }
    },

    // Portfolio actions (generate share URL, toggle public, auto-populate)
    async portfolioAction(action: string): Promise<any>
    {
        try
        {
            const response = await makeAuthenticatedRequest(`${API_BASE_URL}/student/portfolio`, {
                method: 'POST',
                body: JSON.stringify({ action }),
            })

            if (!response.ok)
            {
                throw new Error('Failed to perform portfolio action')
            }

            return await response.json()
        } catch (error)
        {
            console.error('Portfolio action error:', error)
            throw error
        }
    },

    // Logout function
    logout(): void
    {
        if (typeof window === "undefined") return

        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        localStorage.removeItem('onboarding_completed')

        // Clear any cookies by making a request to logout endpoint if needed
        // This would be implemented if you have a logout API endpoint
    },

    // Check if user is authenticated
    isAuthenticated(): boolean
    {
        return this.getCurrentUser() !== null
    },

    // Refresh token (if you implement refresh token logic)
    async refreshToken(): Promise<boolean>
    {
        // This would implement refresh token logic if needed
        // For now, just return false
        return false
    },

    // Check if onboarding is completed for current user
    isOnboardingCompleted(): boolean
    {
        if (typeof window === "undefined") return true

        const user = this.getCurrentUser()
        if (!user?.id) return false

        const userOnboardingKey = `onboarding_completed_${user.id}`
        return localStorage.getItem(userOnboardingKey) === 'true'
    },

    // Mark onboarding as completed for current user
    completeOnboarding(): void
    {
        if (typeof window === "undefined") return

        const user = this.getCurrentUser()
        if (user?.id)
        {
            const userOnboardingKey = `onboarding_completed_${user.id}`
            localStorage.setItem(userOnboardingKey, 'true')
            // Also set general flag for backward compatibility
            localStorage.setItem('onboarding_completed', 'true')
        }
    },

    // Reset onboarding for current user (for testing/admin purposes)
    resetOnboarding(): void
    {
        if (typeof window === "undefined") return

        const user = this.getCurrentUser()
        if (user?.id)
        {
            const userOnboardingKey = `onboarding_completed_${user.id}`
            localStorage.removeItem(userOnboardingKey)
        }
        localStorage.removeItem('onboarding_completed')
    },
}
