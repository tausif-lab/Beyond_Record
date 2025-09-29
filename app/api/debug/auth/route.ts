import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenFromRequest, getTokenFromRequest } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Check if we can get the token
    const token = getTokenFromRequest(request)
    console.log('Token found:', token ? 'YES' : 'NO')
    
    if (!token) {
      return NextResponse.json({
        error: 'No token found',
        headers: Object.fromEntries(request.headers.entries())
      })
    }
    
    // Try to verify the token
    const payload = verifyTokenFromRequest(request)
    console.log('Token payload:', payload)
    
    if (!payload) {
      return NextResponse.json({
        error: 'Invalid token',
        token: token.substring(0, 20) + '...' // Show first 20 chars only
      })
    }
    
    return NextResponse.json({
      success: true,
      user: payload,
      token: token.substring(0, 20) + '...'
    })
    
  } catch (error) {
    console.error('Auth debug error:', error)
    return NextResponse.json({ 
      error: 'Debug error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}