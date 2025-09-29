import mongoose from 'mongoose'

// Load environment variables if not already loaded
if (!process.env.MONGO_URI && typeof window === 'undefined')
{
    try
    {
        require('dotenv').config()
    } catch (error)
    {
        console.warn('dotenv not available, skipping .env loading')
    }
}

// Validate MongoDB URI
const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI)
{
    console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('MONGO')))
    throw new Error('MONGO_URI environment variable is required. Please check your .env file.')
}

// Connection configuration
const CONNECTION_TIMEOUT = parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000')
const MAX_CONNECTIONS = parseInt(process.env.DB_MAX_CONNECTIONS || '10')

// Connection options for production-ready setup
const options: mongoose.ConnectOptions = {
    // Connection pooling
    maxPoolSize: MAX_CONNECTIONS,
    minPoolSize: 5,

    // Timeouts
    serverSelectionTimeoutMS: CONNECTION_TIMEOUT,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    maxIdleTimeMS: 30000,

    // Buffering (use mongoose settings, not MongoDB driver settings)
    // bufferCommands: false, // Let mongoose handle this
    // bufferMaxEntries: 0,   // This option is deprecated

    // Resilience options
    retryWrites: true,
    retryReads: true,
    heartbeatFrequencyMS: 10000,

    // Connection options
    family: 4, // Use IPv4

    // Additional MongoDB options
    directConnection: false,
    appName: 'EduPlatform',
}

// Global connection state management
interface ConnectionState
{
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
    isConnecting: boolean
    lastConnected: Date | null
    connectionAttempts: number
}

// Extend global type to include mongoose
declare global {
    var mongoose: ConnectionState | undefined
}

let cached: ConnectionState = global.mongoose || {
    conn: null,
    promise: null,
    isConnecting: false,
    lastConnected: null,
    connectionAttempts: 0
}

if (!global.mongoose) {
    global.mongoose = cached
}

// Connection event handlers
function setupConnectionHandlers()
{
    mongoose.connection.on('connected', () =>
    {
        console.log('✅ MongoDB connected successfully')
        cached.lastConnected = new Date()
        cached.connectionAttempts = 0
    })

    mongoose.connection.on('error', (error) =>
    {
        console.error('❌ MongoDB connection error:', error)
        cached.conn = null
        cached.promise = null
        cached.isConnecting = false
    })

    mongoose.connection.on('disconnected', () =>
    {
        console.warn('⚠️ MongoDB disconnected')
        cached.conn = null
        cached.promise = null
        cached.isConnecting = false
    })

    mongoose.connection.on('reconnected', () =>
    {
        console.log('🔄 MongoDB reconnected')
        cached.lastConnected = new Date()
    })
}

// Enhanced connection function with retry logic and better error handling
async function dbConnect(): Promise<typeof mongoose>
{
    try
    {
        // Return existing connection if available
        if (cached.conn && mongoose.connection.readyState === 1)
        {
            return cached.conn
        }

        // Prevent multiple concurrent connections
        if (cached.isConnecting && cached.promise)
        {
            return await cached.promise
        }

        // Clean up stale connection state
        if (mongoose.connection.readyState === 3)
        {
            await mongoose.disconnect()
        }

        cached.isConnecting = true
        cached.connectionAttempts++

        console.log(`🔌 Connecting to MongoDB (attempt ${cached.connectionAttempts})...`)

        // Set up connection handlers if not already done
        if (mongoose.connection.listenerCount('connected') === 0)
        {
            setupConnectionHandlers()
        }

        // Create new connection promise
        cached.promise = mongoose.connect(MONGO_URI!, options).then((mongooseInstance) =>
        {
            cached.isConnecting = false
            return mongooseInstance
        })

        cached.conn = await cached.promise
        return cached.conn

    } catch (error)
    {
        cached.isConnecting = false
        cached.promise = null
        cached.conn = null

        console.error('💥 MongoDB connection failed:', error)

        // Implement exponential backoff for retries
        if (cached.connectionAttempts < 5)
        {
            const backoffTime = Math.min(1000 * Math.pow(2, cached.connectionAttempts), 10000)
            console.log(`⏳ Retrying connection in ${backoffTime}ms...`)

            return new Promise((resolve, reject) =>
            {
                setTimeout(async () =>
                {
                    try
                    {
                        const connection = await dbConnect()
                        resolve(connection)
                    } catch (retryError)
                    {
                        reject(retryError)
                    }
                }, backoffTime)
            })
        } else
        {
            throw new Error(`Failed to connect to MongoDB after ${cached.connectionAttempts} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }
}

// Health check function
export async function checkDatabaseHealth(): Promise<{ connected: boolean; error?: string }>
{
    try
    {
        if (mongoose.connection.readyState === 1 && mongoose.connection.db)
        {
            // Test with a simple ping
            await mongoose.connection.db.admin().ping()
            return { connected: true }
        } else
        {
            return { connected: false, error: 'Database not connected' }
        }
    } catch (error)
    {
        return {
            connected: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

// Graceful shutdown function
export async function gracefulShutdown(): Promise<void>
{
    try
    {
        if (mongoose.connection.readyState !== 0)
        {
            console.log('🔌 Closing MongoDB connection...')
            await mongoose.connection.close()
            console.log('✅ MongoDB connection closed successfully')
        }
    } catch (error)
    {
        console.error('❌ Error during MongoDB shutdown:', error)
    }
}

// Connection status utility
export function getConnectionStatus():
    {
        state: string
        lastConnected: Date | null
        attempts: number
    }
{
    const stateMap = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
        99: 'uninitialized'
    }

    return {
        state: stateMap[mongoose.connection.readyState as keyof typeof stateMap] || 'unknown',
        lastConnected: cached.lastConnected,
        attempts: cached.connectionAttempts
    }
}

// Process exit handlers
process.on('SIGINT', gracefulShutdown)
process.on('SIGTERM', gracefulShutdown)
process.on('SIGUSR2', gracefulShutdown) // For nodemon restarts

export default dbConnect
