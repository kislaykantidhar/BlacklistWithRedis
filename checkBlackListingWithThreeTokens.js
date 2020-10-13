const  {createBlackList} =require('jwt-blacklist');
const  jwt=require('jsonwebtoken');

const token1=jwt.sign({data:"something1",target:"someone1"},"secret",{expiresIn:5});
const  token2=jwt.sign({data:"something2",target:"someone2"},"secret",{expiresIn:10});
const  token3=jwt.sign({data:"something3",target:"someone3"},"secret",{expiresIn:15});

const  BlackList= async () =>{
	const blackList= await createBlackList({
	storeType: 'redis', // store type
	redisOptions: {
		host: 'localhost',
		port: 6379,
		key: 'jwt-blacklist',
		}, 
	})
	blackList.add(token1)
	.then(val=>blackList.add(token2))// token 1 and token 2 are added in redis
	.then(async(val)=>{
		setTimeout(async ()=>{
			let p1=await blackList.has(token1);//false
			let p2=await blackList.has(token2);//true
			console.log("token1 is present:"+p1);
			console.log("token2 is present:"+p2);
		},6000)
		setTimeout(async ()=>{
			let p1=await blackList.has(token1);//false
			let p2=await blackList.has(token2);//false
			let p3=await blackList.has(token3);//false
			console.log("token1 is present:"+p1);
			console.log("token2 is present:"+p2);
			console.log("token3 is present:"+p3);

		},11000);
		setTimeout(async ()=>{
			let clear=await blackList.clear();//removes the redis key
			process.exit(0);
		},13000);
	})
}

BlackList();



