import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY is not configured' }, { status: 500 })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 200,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          error: 'Groq API request failed',
          details: data,
        },
        { status: response.status }
      )
    }

    const reply = data.choices?.[0]?.message?.content ?? 'No response returned'

    return NextResponse.json({
      success: true,
      provider: 'groq',
      model: 'openai/gpt-oss-20b',
      reply,
    })
  } catch (error) {
    console.error('Persona API error:', error)

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
