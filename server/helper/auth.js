/* import jwt from 'jsonwebtoken'


const {verify} = jwt

const auth = (req, res, next) => {
    const token = req.headers['authorization']
    if (!token) {
    return res.status(401).json({error: 'No token provided'})
    }
verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
    return res.status(401).json({error: 'Failed to authenticate token'})
    }
    req.user = { id: decoded.userID }
    next()
})
}  
export {auth} */



import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  const hdr = req.headers.authorization || '';
  console.log('[AUTH] header startsWith Bearer:', hdr.startsWith('Bearer '));

  if (!hdr.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid auth header' });
  }
  const token = hdr.slice(7).trim();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[AUTH] decoded payload =', decoded); 

    const userId = decoded.id ?? decoded.userID ?? decoded.userid;
    if (!userId) {
      console.log('[AUTH] no id in token payload');
      return res.status(401).json({ error: 'No user id in token' });
    }

    req.user = { id: Number(userId), email: decoded.email ?? null };
    return next();
  } catch (e) {
    console.error('[AUTH] verify failed:', e.name, e.message);
    return res.status(401).json({ error: 'Failed to authenticate token' });
  }
};
