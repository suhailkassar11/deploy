import express from "express";
import {S3} from "aws-sdk";

const s3=new S3({
    region:"ap-south-1",
    credentials:{
        accessKeyId:"put your key",
        secretAccessKey:"put your secret key"
    }
})

const app= express()

const PORT=3002;

app.get("/*",async (req,res)=>{
    const host = req.hostname;
    
    const id = host.split(".")[0];

    const filePath = req.path

    const normalizedFilePath = filePath.replace(/\//g, (match, offset) => (offset > 0 ? '\\' : '/'));
    
    try {    
        const contents = await s3.getObject({
            Bucket:"vercelskd",
            Key:`dist/${id}${normalizedFilePath}`
        }).promise();

        if(!contents){
            return
        }
        else{
            const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css")?"text/css" :"application/javascript"
            res.set("content-Type",type);
    
            res.send(contents.Body)
            console.log("your website is ready");
            
        }
        
    } catch (error) {
        console.error("Error retrieving object:", error);
        res.status(500).send("Error retrieving object");
    }
})

app.listen(PORT);

