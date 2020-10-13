const express=require('express');
const jwt=require('jsonwebtoken');
const app=express();
const redis=require('redis');
const client=redis.createClient();//default host 127.0.0.1 port 6379
const message={message:"this is a jwt"};
const secret ="wordword";
const port =process.env.PORT||3000;

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
		if(!decoded.exp)
			res.json({mes:'wont blacklist without expiry time'});
		else
			client.set(token,'1');
			client.expireat(token,decoded.exp);
			res.json({mes:"token blacklisted"});
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
		client.get(token,(error,result)=>{
			if(error) console.log(error);
			
			else if(!result) res.json({mes:"token is good"});

			else res.json({mes:"token is blacklisted"});

		});
		
	}
	catch (err)
	{
		res.json({mes:"invalid token"});
		res.send(200);
	}
})
app.listen(port,()=>{
	console.log(`listening on http://localhost:${port}`);
})