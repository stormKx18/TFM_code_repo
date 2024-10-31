// Import AWS SDK for JavaScript
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
const LIMIT=150;

// Create a DynamoDB client
const dynamoDb = new DynamoDBClient();

// Export the handler function in ES module format
export const handler = async (event) => {
    // Get the table name from the environment variables
    const tableName = process.env.TABLE_NAME;

    // ScanCommand to retrieve all entries
    const params = {
        TableName: tableName,
        // Limit the result size (optional, to fetch fewer entries at once)
        Limit: 1000  // 
    };

    try {
        // Use ScanCommand to retrieve all data from the table
        const data = await dynamoDb.send(new ScanCommand(params));

        // Sort the items by the 'time' attribute in descending order
        const sortedItems = data.Items.sort((a, b) => {
            return b.time.N - a.time.N;  // Assuming 'time' is a number
        });

        // Get the last entries
        const lastEntries = sortedItems.slice(0, LIMIT);

        return {
            statusCode: 200,
            body: JSON.stringify(lastEntries),  // Return only the last 50 items
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to retrieve data", error }),
        };
    }
};
