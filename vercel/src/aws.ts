
import {S3} from "aws-sdk"
import fs from "fs";
import dotenv from 'dotenv';

dotenv.config();


const s3=new S3({
    region:"ap-south-1",
    credentials:{
        accessKeyId:"put your key",
        secretAccessKey:"put your secret key"
    }
})

export const uploadFile=async(fileName:string,localFilePath:string)=>{
    // console.log("called")
    const fileContent=fs.readFileSync(localFilePath)
    
   try {
    const response=await s3.upload({
        Body:fileContent,
        Key:fileName,
        Bucket: 'vercelskd'
    }).promise()
   } catch (error) {
    console.log("error in uploading to s3",error)
   }
    
}