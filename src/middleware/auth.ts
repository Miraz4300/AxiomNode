import { isNotEmptyString } from '../utils/is'

const auth = async (req, res, next) => {
  const AUTH_SECRET_KEY = process.env.AUTH_SECRET_KEY
  if (isNotEmptyString(AUTH_SECRET_KEY)) {
    try {
      const Authorization = req.header('Authorization')
      if (!Authorization || Authorization.replace('Bearer ', '').trim() !== AUTH_SECRET_KEY.trim())
        throw new Error('Permission denied - You are not authorized to continue.')
      next()
    }
    catch (error) {
      res.send({ status: 'Unauthorized', message: error.message ?? 'You are not authorized to access this resource. Please authenticate.', data: null })
    }
  }
  else {
    next()
  }
}

export { auth }
