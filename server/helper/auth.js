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
        const decodedUser = verify(token, process.env.JWT_SECRET)

        // store user to request object --> allows other components to use this information
        req.user = decodedUser

        // create new access token when requested protected route
        // prolongues session --> user does not have to sign in so often
        const new_access_token = sign({user: decodedUser.user}, process.env.JWT_SECRET, {expiresIn: '15m'})
        res.header('Access-Control-Expose-Headers','Authorization') // enables sending headers to the front (CORS normally blocks these)
        res.header('Authorization','Bearer ' + new_access_token)    // set new token to header
        next()
    } catch (error) {
        console.error('Auth error:', error.message)
        return res.status(401).json({ error: 'Unauthorized' })
    }

}  
export {auth}