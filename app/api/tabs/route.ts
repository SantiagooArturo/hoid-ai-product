import { NextResponse } from 'next/server'

let selectedTab: any = null

export async function GET() {
  try {
    return NextResponse.json(selectedTab ? [selectedTab] : [])
  } catch (error) {
    console.error('Error fetching tabs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tabs' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const tab = await request.json()
    selectedTab = tab
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving tab:', error)
    return NextResponse.json(
      { error: 'Failed to save tab' },
      { status: 500 }
    )
  }
} 