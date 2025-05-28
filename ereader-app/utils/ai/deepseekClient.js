/**
 * DeepSeek API Client for AI chat functionality
 */

export class DeepSeekClient {
  constructor(apiKey, apiUrl) {
    this.apiKey = apiKey
    this.apiUrl = apiUrl
    this.model = 'deepseek-chat'
  }

  /**
   * Send a chat completion request to DeepSeek
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Additional options for the API call
   * @returns {Promise<Object>} The API response
   */
  async chatCompletion(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key is not configured. Please set NUXT_PUBLIC_DEEPSEEK_API_KEY in your environment.')
    }

    const payload = {
      model: this.model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      stream: options.stream || false,
      ...options
    }

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`DeepSeek API error: ${error.error?.message || response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('DeepSeek API request failed:', error)
      throw error
    }
  }

  /**
   * Stream a chat completion response
   * @param {Array} messages - Array of message objects
   * @param {Function} onChunk - Callback for each chunk of the stream
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  async streamChatCompletion(messages, onChunk, options = {}) {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key is not configured.')
    }

    const payload = {
      model: this.model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 2000,
      stream: true,
      ...options
    }

    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`DeepSeek API error: ${error.error?.message || response.statusText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              return
            }
            try {
              const chunk = JSON.parse(data)
              const content = chunk.choices?.[0]?.delta?.content
              if (content) {
                onChunk(content)
              }
            } catch (e) {
              // Skip invalid JSON chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('DeepSeek streaming failed:', error)
      throw error
    }
  }
}

/**
 * Create a DeepSeek client instance
 * @returns {DeepSeekClient}
 */
export function createDeepSeekClient() {
  const config = useRuntimeConfig()
  return new DeepSeekClient(
    config.public.deepseekApiKey,
    config.public.deepseekApiUrl
  )
}