const express=require('express');
const jwt=require('jsonwebtoken');
const app=express();
const {createBlackList}=require('jwt-blacklist');

const message={message:"this is a jwt"};
const secret ="wordword";
const port =process.env.PORT||3000;
let blacklist;
(async ()=>{
	blacklist=await createBlackList({
	storeType: 'redis', 
		redisOptions: {
			host: 'localhost',
			port: 6379,
			key: 'jwt-blacklist', 
		},
	})
})()
app.get('/',(req,res)=>{
	res.json({mes:'message'});
})

app.get('/token',(req,res)=>{
	let tok=jwt.sign(message,secret,{expiresIn:60});
	res.json({token:tok});
})
app.post('/blacklist',(req,res)=>{
	let [,token]=req.headers.authorization.split(" ");
	try
	{
		let decoded=jwt.verify(token,secret);
		blacklist.add(token)//no need to check exp explicitlly, not allow jwt without exp
		.then(val=>{
			res.json({mes:"token blacklisted"});
		})
		.catch(err=>{
			console.log(err);
		})
	}
	catch (err)
	{
		console.log(err);
		res.json({mes:"invalid token"});
		res.send(200);
	}

})
app.post('/validate',(req,res)=>{

	let [,token]=req.headers.authorization.split(" ");
	try
	{
		let decoded=jwt.verify(token,secret);
		console.log(decoded);
		blacklist.has(token)
		.then((val)=>{
			if(val) {res.json({mes:"blacklisted token encountered"});}
			else {res.json({mes:"token is good"});}
		})
		.catch((error)=>{
			console.log(error);
		})
		
	}
	catch (err)
	{
		console.log(err);
		res.json({mes:"invalid token"});
		
	}
})
app.listen(port,()=>{
	console.log(`listening on http://localhost:${port}`);
})