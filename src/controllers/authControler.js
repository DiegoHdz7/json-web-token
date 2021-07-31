const {Router}=require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const router = Router();
const config = require('../config');



router.post('/signup', async (req,res,next)=>{
    const {username,email,password}=req.body;
    const user = new User({
        username,
        email,
        password
    });

    user.password = await user.encryptPassword(user.password);
    await user.save();
    const token =jwt.sign({id:user._id},config.secret, {
        expiresIn: 60//60 * 60 *24 //this is in seconds, in the way we're sayin 24hrs
    });
    console.log('token:');
    console.log(token);




    console.log(user);
    res.json({auth:true, token});


});

router.post('/login', async (req,res,next)=>{
    const {email, password} = req.body;
    console.log(email, ' ', password);
    const user = await User.findOne({email:email});

    if(!user){
        return res.status(404).send('email doesnt exist');
    } else {
        const validPassword = await user.validatePassword(password);
        if(!validPassword){
            return res.json({auth:false, token:null});
        } else {
            const token = jwt.sign({id:user._id}, config.secret,{
                expiresIn: 120
            });
            return res.json({auth:true, token:token});
        }
        
    }
    
});

router.get('/me', verifyToken,async (req,res,next)=>{
   


    const user = await User.findById(req.userId, {password:0});
        if(!user){
            return res.status.apply(404).send('no user found');
        } else {
           return  res.json(user);
        }

   
    


   


    
});


function verifyToken(req,res,next){
    const token = req.headers['x-access-token'];
    
    if(!token){
        return res.status(401).json({
            auth:false,
            message:'no token provided'
        });
    } 

    try{
        const decoded =  jwt.verify(token, config.secret)
        req.userId = decoded.id;
        console.log('decoded:');
        console.log(decoded);
        
        
    } catch(err){
        console.error(err.name);
        console.error(err.message);
        console.error(err.expiredAt); 
        //console.error(err);

        if(err.name == 'TokenExpiredError'){
            console.log('la sesion ha expirado');
            return res.json({session:'expired'})
        }

    }

    next();
}

module.exports = router;