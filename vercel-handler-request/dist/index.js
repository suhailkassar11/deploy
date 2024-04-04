"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = require("aws-sdk");
const s3 = new aws_sdk_1.S3({
    region: "ap-south-1",
    credentials: {
        accessKeyId: "put your key",
        secretAccessKey: "put your secret key"
    }
});
const app = (0, express_1.default)();
const PORT = 3002;
app.get("/*", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const host = req.hostname;
    const id = host.split(".")[0];
    const filePath = req.path;
    const normalizedFilePath = filePath.replace(/\//g, (match, offset) => (offset > 0 ? '\\' : '/'));
    try {
        const contents = yield s3.getObject({
            Bucket: "vercelskd",
            Key: `dist/${id}${normalizedFilePath}`
        }).promise();
        if (!contents) {
            return;
        }
        else {
            const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript";
            res.set("content-Type", type);
            res.send(contents.Body);
            console.log("your website is ready");
        }
    }
    catch (error) {
        console.error("Error retrieving object:", error);
        res.status(500).send("Error retrieving object");
    }
}));
app.listen(PORT);
