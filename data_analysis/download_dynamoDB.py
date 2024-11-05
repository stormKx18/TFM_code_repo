import boto3
import csv

# Configura el cliente de DynamoDB
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')  # Cambia la región si es necesario
table = dynamodb.Table('myIOTDynamoDB_dev3')

# Función para escanear la tabla DynamoDB
def scan_table(table):
    response = table.scan()
    data = response.get('Items', [])

    # Continuar escaneando si hay más datos (paginación)
    while 'LastEvaluatedKey' in response:
        response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
        data.extend(response.get('Items', []))
    
    return data

# Descargar los datos de la tabla
data = scan_table(table)

# Guardar los datos en un archivo CSV
csv_filename = 'myIOTDynamoDB_dev2_data_v3.csv'
with open(csv_filename, mode='w', newline='') as csv_file:
    if len(data) > 0:
        # Obtener las claves del primer elemento como encabezados del CSV
        fieldnames = data[0].keys()
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

        writer.writeheader()
        writer.writerows(data)

    print(f"Datos guardados exitosamente en {csv_filename}")

