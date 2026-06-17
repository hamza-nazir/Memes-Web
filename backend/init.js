const mongoose=require('mongoose')
const connection=require('./model/connection')
const Images=require('./model/images')

connection()

const seed=async()=>{
let data=[]

for(let i=1;i<=100;i++){
data.push({
url:"https://memescollection.s3.eu-north-1.amazonaws.com/1774904028857-Screenshot%202026-03-08%20053410.png",
caption:"ss random",
fileName:`Screenshot ${i}`,
tags:[],
owner:new mongoose.Types.ObjectId("69cad5a4bf6f4dbd5b9c6164")
})
}

await Images.insertMany(data)
console.log("100 images seeded")
process.exit()
}

seed()