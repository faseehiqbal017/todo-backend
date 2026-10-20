import jwt from 'jsonwebtoken'

// Checks the token sent in the "Authorization: Bearer <token>" header
export default function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' })

  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id
    next()
  } catch {
    res.status(401).json({ message: 'Token is invalid or expired' })
  }
}
