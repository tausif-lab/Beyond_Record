import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Portfolio } from '@/lib/models'

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await dbConnect()
    const { slug } = params
    const portfolio = await (Portfolio as any).findOne({ shareUrl: slug, isPublic: true }).lean()
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found or not public' }, { status: 404 })
    }
    return NextResponse.json({ portfolio })
  } catch (e) {
    console.error('Public portfolio fetch error', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
