import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface StreamOptions {
  model: string
  systemPrompt: string
  userMessage: string
  maxTokens?: number
}

export async function* streamCompletion(options: StreamOptions) {
  const { model, systemPrompt, userMessage, maxTokens = 4096 } = options

  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      const delta = event.delta
      if ('text' in delta) {
        yield { type: 'text' as const, content: delta.text }
      }
    }
  }

  const finalMessage = await stream.finalMessage()
  yield {
    type: 'done' as const,
    content: '',
    usage: {
      input_tokens: finalMessage.usage.input_tokens,
      output_tokens: finalMessage.usage.output_tokens,
    },
  }
}

export async function simpleCompletion(options: StreamOptions): Promise<string> {
  const { model, systemPrompt, userMessage, maxTokens = 4096 } = options

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  return response.content
    .filter(block => block.type === 'text')
    .map(block => ('text' in block ? block.text : ''))
    .join('')
}
