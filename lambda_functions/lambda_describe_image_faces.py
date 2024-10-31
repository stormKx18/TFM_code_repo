import boto3
import json

def lambda_handler(event, context):
    # Extract bucket name and image name from the event object
    bucket_name = 'myiotimages'
    image_name = 'uploaded_image.jpg'
    
    # Initialize a session using Amazon Rekognition
    rekognition = boto3.client('rekognition')

    # Call Rekognition to detect faces in the image
    response = rekognition.detect_faces(
        Image={
            'S3Object': {
                'Bucket': bucket_name,
                'Name': image_name
            }
        },
        Attributes=['ALL']  # Provides more detailed face attributes
    )
    
    # Prepare the array to hold a maximum of two face details
    face_details_array = []

    # Process up to two detected faces and store the values as strings
    for face_detail in response['FaceDetails']:
        gender = face_detail['Gender']['Value']
        gender_confidence = f"{face_detail['Gender']['Confidence']:.2f}%"
        emotions = ', '.join([e['Type'] for e in face_detail['Emotions'] if e['Confidence'] > 75])
        age_range = f"{face_detail['AgeRange']['Low']} - {face_detail['AgeRange']['High']}"
        detection_confidence = f"{face_detail['Confidence']:.2f}%"

        # Add the details to the array as strings
        face_details_array.append({
            "Gender": f"{gender} (Confidence: {gender_confidence})",
            "Emotions": f"Emotions: {emotions}",
            "AgeRange": f"Age Range: {age_range}",
            "DetectionConfidence": f"Detection Confidence: {detection_confidence}"
        })

    # Return the face details array as a JSON object
    return {
        'statusCode': 200,
        'body': json.dumps({
            "FaceDetails": face_details_array
        })
    }
