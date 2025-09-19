import { NextRequest, NextResponse } from 'next/server'
import { getAllAppConfigs, updateAppConfig } from '@/lib/supabase'

export async function GET() {
  try {
    const configs = await getAllAppConfigs()
    return NextResponse.json(configs)
  } catch (error) {
    console.error('Error fetching configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configurations' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { key, value } = await request.json()

    if (!key || typeof value !== 'string') {
      return NextResponse.json(
        { error: 'Invalid key or value' },
        { status: 400 }
      )
    }

    const success = await updateAppConfig(key, value)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update configuration' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating config:', error)
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    )
  }
}