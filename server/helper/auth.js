import jwt from 'jsonwebtoken'


const {verify, sign} = jwt

// middleware for authentication
const auth = (req, res, next) => {


    // if there is no authentication header --> no access
    if(!req.headers.authorization) return res.status(401).json({ error: 'Unauthorized'})

    try {
        // get authentication header
        const authHeader = req.headers.authorization

        // header form is 'Bearer <token<', this picks up only token
        const token = authHeader.split(' ')[1]

        // verify token and decode user information
        const decoded = verify(token, process.env.JWT_SECRET)

        // store user to request object --> allows other components to use this information
        req.user = decoded.user || decoded

        // create new access token when requested protected route
        // prolongues session --> user does not have to sign in so often
        const new_access_token = sign({user: req.user}, process.env.JWT_SECRET, {expiresIn: '15m'})
        res.header('Access-Control-Expose-Headers','Authorization') // enables sending headers to the front (CORS normally blocks these)
        res.header('Authorization','Bearer ' + new_access_token)    // set new token to header
        next()
    } catch (error) {
        console.error('Auth error:', error.message)
        return res.status(401).json({ error: 'Unauthorized' })
    }

}  
export {auth}


/*import jwt from 'jsonwebtoken';

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
};*/
