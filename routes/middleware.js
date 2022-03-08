function authAmdin (){
    return (req, res, next) => {
        if(req.session.user){
            if(req.session.user.admin){
                next();
            } 
            else{
                return res.status(401).json("You Must Be An Admin To Access This Page")
            }
        }
       else{
           res.redirect('/login')
       }
    }
}

module.exports = authAmdin;