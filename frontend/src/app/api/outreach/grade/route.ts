import { NextResponse } from 'next/server'

const MODEL = 'openai/gpt-oss-20b'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { email, persona } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    if (!persona || typeof persona !== 'object') {
      return NextResponse.json(
        { error: 'Persona information is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const gradingPrompt = `
You are evaluating a consulting outreach email.

Evaluate the player's email against the target client's persona information.

Target persona:
${JSON.stringify(persona, null, 2)}

Player email:
${email}

Score the email from 0 to 6.

Consider:
1. Personalisation to the client
2. Relevance to the client's needs
3. Clear value proposition
4. Professional tone
5. Clear call to action
6. Overall effectiveness

Return ONLY valid JSON in this format:

{
  "score": 0,
  "feedback": "Short written feedback explaining the score."
}
`

    const groqResponse = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0,
            
          messages: [
            {
              role: 'system',
              content:
                'You are an evaluator for a consulting simulation game. Return only valid JSON.',
            },
            {
              role: 'user',
              content: gradingPrompt,
            },
          ],
          max_tokens: 1000,
        }),
      }
    )

    if (!groqResponse.ok) {
  const errorText = await groqResponse.text()

  console.error('Groq grading error:', errorText)

  return NextResponse.json(
    { error: 'Grading request failed' },
    { status: 502 }
  )
}

    const groqData = await groqResponse.json()
    
    

    const content = groqData?.choices?.[0]?.message?.content

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Invalid grading response' },
        { status: 502 }
      )
    }

    let result

    try {
      result = JSON.parse(content)
    } catch {
      return NextResponse.json(
        { error: 'Could not parse grading response' },
        { status: 502 }
      )
    }

    const score = Number(result.score)
    const feedback = result.feedback

    if (
      !Number.isInteger(score) ||
      score < 0 ||
      score > 6 ||
      typeof feedback !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Grading response had an invalid format' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      score,
      feedback,
    })
  } catch (error) {
    console.error('Outreach grading API error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}