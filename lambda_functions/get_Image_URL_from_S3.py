import boto3

s3 = boto3.client('s3')

def lambda_handler(event, context):
    # Nombre del bucket y archivo
    bucket_name = 'myiotimages'
    file_name = event["queryStringParameters"]["file"]
    
    # Tiempo de expiración de la URL en segundos
    expiration = 3600  # 1 hora

    try:
        # Generar presigned URL
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': bucket_name,
                'Key': file_name
            },
            ExpiresIn=expiration
        )
        
        return {
            "statusCode": 200,
            "body": presigned_url,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",  # Permitir el acceso desde cualquier origen
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        }
    
    except Exception as e:
        return {
            "statusCode": 500,
            "body": str(e),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        }
