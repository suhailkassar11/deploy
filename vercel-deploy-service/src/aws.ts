import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";

const s3 = new S3({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "put your key",
    secretAccessKey: "put your secret key",
  },
});

export async function downloadS3Folder(prefix: string) {
  try {
    const allFiles = await s3.listObjectsV2({ Bucket: "vercelskd", Prefix: prefix }).promise();
    console.log("Listed objects:", allFiles);

    if (!allFiles.Contents || allFiles.Contents.length === 0) {
      console.log("No objects found in the specified prefix.");
      return;
    }

    const allPromises = allFiles.Contents?.map(({ Key }) => {
      return new Promise((resolve) => {
        if (!Key) {
          resolve("");
          return;
        }
        const finalOutputPath = path.join(__dirname, Key);

        const outputFile = fs.createWriteStream(finalOutputPath);
        const dirName = path.dirname(finalOutputPath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        s3.getObject({ Bucket: "vercelskd", Key })
          .createReadStream()
          .pipe(outputFile)
          .on("finish", () => {
            resolve("");
          });
      });
    });

    console.log("awaiting");
    await Promise.all(allPromises);
    console.log("Download complete!");
  } catch (error) {
    console.error("Error fetching or downloading objects:", error);
  }
}

export function copyFinalDist(id: string) {
  const folderPath = path.join(__dirname, `output/${id}/build`);
  const allFiles = getAllFiles(folderPath);
  allFiles.forEach(file => {
      uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
  })
}

const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);allFilesAndFolders.forEach(file => {
      const fullFilePath = path.join(folderPath, file);
      if (fs.statSync(fullFilePath).isDirectory()) {
          response = response.concat(getAllFiles(fullFilePath))
      } else {
          response.push(fullFilePath);
      }
  });
  return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3.upload({
      Body: fileContent,
      Bucket: "vercelskd",
      Key: fileName,
  }).promise();
  console.log(response);
}