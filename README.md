# TFM_code_repo

[![Python 3.6](https://img.shields.io/badge/python-3.6-blue.svg)](https://www.python.org/downloads/release/python-360/)

[![Node.js](https://img.shields.io/badge/node.js-v14.17.6-green.svg)](https://nodejs.org/en/download/)

**Universidad Internacional de Valencia**

**TITULACIÓN:** Máster Universitario en Big Data y Ciencia de Datos

**TFM:** Implementación de un almacén de datos para datos de IOT

**PRESENTA:** Jaime Tamayo, Victor Christian

**DIRECTOR DEL TFM:** Martínez Pérez, José Luis

**CURSO:** 2023-2024

**FECHA:** 30 de Octubre de 2024

## Descripción

Este repositorio contiene el código y archivos relevantes para el Trabajo de Fin de Máster (TFM), organizado en diferentes carpetas para una mejor comprensión y accesibilidad de cada componente.

## Estructura del Repositorio

- **data_analysis**: Contiene scripts y notebooks para el análisis de datos extraídos de los dispositivos IoT.

  - [`data_analysis_modelos`](./data_analysis/completed_data_analysis_redmet_es.ipynb): Notebook para el análisis de series temporales de datos de IoT.
  - [`data_analysis_IoT`](./data_analysis/completed_data_analysis_v3.ipynb): Notebook para el análisis de datos de IoT.
  - [`download_dynamoDB.py`](./data_analysis/download_dynamoDB.py): Script para descargar datos de Amazon DynamoDB.

- **IoT_device**: Código para la configuración y publicación de datos desde dispositivos IoT.

  - [`raspberry_pubIOT.py`](./IoT_device/raspberry_pubIOT.py): Script para publicar datos desde una Raspberry Pi hacia la nube de AWS.

- **lambda_functions**: Contiene las funciones Lambda implementadas en AWS para procesar y manejar datos y archivos en DynamoDB y S3.

  - [`get_Image_URL_from_S3.py`](./lambda_functions/get_Image_URL_from_S3.py): Genera URLs prefirmadas para acceder a imágenes almacenadas en Amazon S3. Tiempo de respuesta promedio: **36.4 ms**.
  - [`getDynamoData.js`](./lambda_functions/getDynamoData.js): Realiza consultas a DynamoDB. Tiempo de respuesta promedio: **892 ms** (máximo de 1.86 s en consultas complejas).
  - [`sendValidDataDynamoDB_dev.js`](./lambda_functions/sendValidDataDynamoDB_dev.js): Valida y almacena datos en DynamoDB. Tiempo de respuesta promedio: **844 ms**.
    lambda_functions/ sendValidDataDynamoDB_dev.js
  - [`sendValidDataS3_dev.js`](./lambda_functions/sendValidDataS3_dev.js): Valida y almacena datos en Amazon S3. Tiempo de respuesta promedio: **949 ms**.
  - [`lambda_describe_image_faces.py`](./lambda_functions/lambda_describe_image_faces.py): Función AWS Lambda que utiliza Amazon Rekognition para detectar rostros en una imagen almacenada en un bucket de Amazon S3

- **webApp**: Archivos de la aplicación web para el monitoreo y visualización de datos de dispositivos IoT.
  - [`index.html`](./webApp/index.html): Página principal de la aplicación web.
  - [`style.css`](./webApp/style.css): Estilos CSS para la interfaz de usuario.
  - Archivos de iconos y manifest para compatibilidad con dispositivos móviles.

## Requisitos

Este proyecto utiliza tecnologías como **AWS Lambda**, **DynamoDB**, **S3** y **Raspberry Pi**. Es recomendable tener configuradas las credenciales de AWS y acceso a una instancia de Raspberry Pi para la publicación de datos.

## Instalación

1. Clona este repositorio:
   ```bash
   git clone git@github.com:stormKx18/TFM_code_repo.git
   ```
2. Configura las credenciales de AWS en tu entorno local para utilizar las funciones Lambda y DynamoDB.

3. Ejecuta los scripts y funciones Lambda según las necesidades del proyecto.
