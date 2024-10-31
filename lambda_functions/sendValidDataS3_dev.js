// Import S3 client from AWS SDK v3 (available natively in Node.js 18.x)
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"; // AWS SDK v3

// Initialize the S3 client
const s3 = new S3Client();

export const handler = async (event) => {
  const params = {
    Bucket: "myiotdatavcjtv1", // Replace with your actual S3 bucket name
    Key: `data/${Date.now()}.json`, // File name based on timestamp
    Body: JSON.stringify(event), // IoT event data as JSON
    ContentType: "application/json", // Content type
  };

  try {
    // Save the object to S3
    const data = await s3.send(new PutObjectCommand(params));
    return { statusCode: 200, body: "Data saved successfully" };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: "Error saving data" };
  }
};
