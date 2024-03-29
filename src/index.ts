import express from 'express'
import type { RequestProps } from './types'
import { chatConfig, chatReplyProcess, currentModel } from './chatgpt'
import type { ChatMessage } from './chatgpt'
import { auth } from './middleware/auth'
import { limiter } from './middleware/limiter'
import { isNotEmptyString } from './utils/is'

const app = express()
const router = express.Router()

// Middleware:
app.use(express.static('public'))
app.use(express.json())

// CORS enabled for all origins:
app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

// Endpoint for chat processing:
router.post('/chat-process', [auth, limiter], async (req, res) => {
  res.setHeader('Content-type', 'application/octet-stream')

  try {
    const { prompt, options = {}, systemMessage, temperature, top_p } = req.body as RequestProps
    let firstChunk = true

    await chatReplyProcess({
      message: prompt,
      lastContext: options,
      process: (chat: ChatMessage) => {
        res.write(firstChunk ? JSON.stringify(chat) : `\n${JSON.stringify(chat)}`)
        firstChunk = false
      },
      systemMessage,
      temperature,
      top_p,
    })
  }
  catch (error) {
    res.write(JSON.stringify(error))
  }
  finally {
    res.end()
  }
})

// Endpoint for chat configuration:
router.post('/config', auth, async (req, res) => {
  try {
    const response = await chatConfig()
    res.send(response)
  }
  catch (error) {
    res.send(error)
  }
})

// Endpoint for session:
router.post('/session', async (req, res) => {
  try {
    const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
    const hasAuth = isNotEmptyString(AUTH_SECRET_KEY)
    res.send({ status: 'Success', message: '', data: { auth: hasAuth, model: currentModel() } })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

// Endpoint for verification:
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body as { token: string }

    if (!token)
      throw new Error('Secret key is empty')
    if (process.env.AUTH_SECRET_KEY !== token)
      throw new Error('Secret key is invalid')

    res.send({ status: 'Success', message: 'Verification complete!', data: null })
  }
  catch (error) {
    res.send({ status: 'Fail', message: error.message, data: null })
  }
})

// Middleware for the router and port that the app listens on:
app.use('', router)
app.use('/api', router)

// Configure the app to trust proxy headers
app.set('trust proxy', 1)

app.listen(10829, () => globalThis.console.log('Axiom-Node is running on port 10829'))
