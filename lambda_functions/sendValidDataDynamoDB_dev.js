// Import AWS SDK for JavaScript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// Create a DynamoDB client
const dynamoDBClient = new DynamoDBClient();
const dynamoDB = DynamoDBDocumentClient.from(dynamoDBClient);

//  DynamoDB table name
const TABLE_NAME = "myIOTDynamoDB_dev3";

export const handler = async (event) => {
  // Extract data from the event object
  const {
    time,
    hostname,
    cpu_usage,
    memory_used,
    memory_total,
    disk_used,
    disk_total,
    cpu_temp,
    download_speed,
    upload_speed,
    number_of_hosts,
    external_temperature,
  } = event;

  // Ensure time is a number
  const timeAsNumber = Number(time);

  // Define the parameters for the DynamoDB Put operation
  const params = {
    TableName: TABLE_NAME, // Use environment variable for table name
    Item: {
      time: timeAsNumber, // Partition key as a Number
      hostname: hostname, // Attribute
      cpu_usage: Number(cpu_usage), // Attribute, converted to Number
      memory_used: Number(memory_used), // Attribute, converted to Number
      memory_total: Number(memory_total), // Attribute, converted to Number
      disk_used: Number(disk_used), // Attribute, converted to Number
      disk_total: Number(disk_total), // Attribute, converted to Number
      cpu_temp: Number(cpu_temp), // Attribute, converted to Number
      download_speed: Number(download_speed), // Attribute, converted to Number
      upload_speed: Number(upload_speed), // Attribute, converted to Number
      number_of_hosts: Number(number_of_hosts), // Attribute, converted to Number
      external_temperature: Number(external_temperature), // Attribute, converted to Number
    },
  };

  try {
    // Write the data to DynamoDB using PutCommand
    await dynamoDB.send(new PutCommand(params));

    // Success response
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data inserted successfully" }),
    };
  } catch (error) {
    // Error response
    console.error("Error inserting data: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error inserting data into DynamoDB" }),
    };
  }
};
