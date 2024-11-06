from awscrt import mqtt
from awsiot import mqtt_connection_builder
import sys
import threading
import time
import json
import psutil
import platform
import socket
import speedtest
import boto3
from botocore.exceptions import NoCredentialsError
import nmap
from picamera import PiCamera  # Assuming you use Raspberry Pi Camera for capturing images
import requests
from bs4 import BeautifulSoup
import re

# MQTT Configuration
ENDPOINT = "a3mzq67wa3z4ym-ats.iot.us-east-1.amazonaws.com"
CLIENT_ID = "basicPubSub"
TOPIC = "sdk/test/python"
CA_FILE = "root-CA.crt"
CERT_FILE = "raspberry_pi_v2.cert.pem"
KEY_FILE = "raspberry_pi_v2.private.key"
MESSAGE_COUNT = 0  # 0 for infinite messages
WAIT_TIME = 5

#Ambient metrics
# Initialize a global variable to store the last valid values
last_valid_conditions = [-100, -100, -100, -100]  # Initial placeholder values


# AWS S3 bucket information
BUCKET_NAME = 'myiotimages'
S3_KEY = 'uploaded_image.jpg'  # Name of the image in S3

# Initialize the S3 client
s3 = boto3.client('s3')

# Initialize Pi Camera
camera = PiCamera()
camera.rotation = 180  # Rotate the image by 180 degrees
camera.saturation = -70

# Callback when connection is accidentally lost.
def on_connection_interrupted(connection, error, **kwargs):
    print(f"Connection interrupted. Error: {error}")

# Callback when an interrupted connection is re-established.
def on_connection_resumed(connection, return_code, session_present, **kwargs):
    print(f"Connection resumed. Return code: {return_code}, Session present: {session_present}")

# Callback when the connection successfully connects
def on_connection_success(connection, callback_data):
    print(f"Connection Successful with return code: {callback_data.return_code}, session present: {callback_data.session_present}")

# Callback when a connection attempt fails
def on_connection_failure(connection, callback_data):
    print(f"Connection failed with error code: {callback_data.error}")

# Callback when a connection has been disconnected or shutdown successfully
def on_connection_closed(connection, callback_data):
    print("Connection closed")

def get_cpu_temperature():
    try:
        # Read CPU temperature from system file
        with open("/sys/class/thermal/thermal_zone0/temp", "r") as f:
            cpu_temp = float(f.read()) / 1000  # Convert to Celsius
        return cpu_temp
    except Exception:
        return "N/A"

def get_system_info():
    # CPU usage
    cpu_usage = psutil.cpu_percent(interval=1)
    
    # Memory usage
    memory_info = psutil.virtual_memory()
    memory_used = memory_info.used / (1024 ** 2)  # Convert to MB
    memory_total = memory_info.total / (1024 ** 2)  # Convert to MB

    # Disk usage
    disk_info = psutil.disk_usage('/')
    disk_used = disk_info.used / (1024 ** 3)  # Convert to GB
    disk_total = disk_info.total / (1024 ** 3)  # Convert to GB

    # CPU temperature
    cpu_temp = get_cpu_temperature()

    # Hostname and OS version
    hostname = socket.gethostname()
    os_version = platform.platform()

    return {
        'cpu_usage': cpu_usage,
        'memory_used': memory_used,
        'memory_total': memory_total,
        'disk_used': disk_used,
        'disk_total': disk_total,
        'cpu_temp': cpu_temp,
        'hostname': hostname,
        'os_version': os_version,
    }


def get_network_info():
    try:
        # Network speed with secure connection
        st = speedtest.Speedtest(secure=True)  # Use secure connection
        download_speed = st.download() / (1024 ** 2)  # Convert to MBps
        upload_speed = st.upload() / (1024 ** 2)  # Convert to MBps
    except Exception as e:
        print(f"Error during speed test: {e}")
        download_speed = 0
        upload_speed = 0

    return {
        'download_speed': download_speed,
        'upload_speed': upload_speed,
    }

def get_hosts_count():
    # Create a scanner object
    nm = nmap.PortScanner()

    # Define the target IP range
    target_ip = "192.168.1.0/24"  # Replace with your network's IP range

    # Perform a ping scan (no port scanning, just checks which hosts are up)
    nm.scan(hosts=target_ip, arguments='-sn')

    # Get all hosts that are 'up'
    hosts_up = [host for host in nm.all_hosts() if nm[host].state() == 'up']

    return len(hosts_up)

def capture_image(image_path):
    """
    Capture an image using the Raspberry Pi Camera, rotate it 180 degrees, and save it to the given path.
    """
    camera.capture(image_path)  # Capture the image and save it to the given path
    print(f"Image captured and saved to {image_path}")


def upload_to_s3(image_path, bucket_name, s3_key):
    """
    Upload an image to an S3 bucket.
    """
    try:
        s3.upload_file(image_path, bucket_name, s3_key)
        print(f"Image uploaded successfully to s3://{bucket_name}/{s3_key}")
    except FileNotFoundError:
        print("The specified image file was not found.")
    except NoCredentialsError:
        print("Credentials not available.")

def get_ambient_conditions():
    global last_valid_conditions
    METRICS = 4
    url = "https://www.meteored.mx/ciudad-de-mexico/historico"
    
    try:
        response = requests.get(url, timeout=10)  # Add a timeout in case the request takes too long
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Select the temperature, humidity, wind speed, and wind direction elements
            temperature_element = soup.select_one("#ult_dato_temp")
            humidity_element = soup.select_one("#ult_dato_hum")
            wind_speed_element = soup.select_one("#ult_dato_velviento")
            wind_direction_element_raw = soup.select_one("#ult_dato_dirviento")
            wind_direction_element = re.search(r"\((\d+)", wind_direction_element_raw.get_text()).group(1)
            
            # Verify that both elements exist before attempting to extract data
            if temperature_element and humidity_element:
                temperature = float(temperature_element.get_text())
                humidity = float(humidity_element.get_text())
                wind_speed = round(float(wind_speed_element.get_text()) / 3.6, 3)
                wind_direction = float(wind_direction_element)
                
                # Update the last valid conditions with the new values
                last_valid_conditions = [temperature, humidity, wind_speed, wind_direction]
                return last_valid_conditions
            else:
                print("Temperature or humidity elements not found.")
                return last_valid_conditions  # Return the last valid values if elements are missing
        else:
            print(f"Error accessing the page. Status code: {response.status_code}")
            return last_valid_conditions  # Return the last valid values if the request failed
    except requests.exceptions.RequestException as e:
        print(f"Network error while fetching temperature and humidity: {e}")
        return last_valid_conditions  # Return the last valid values if a network error occurs
    except ValueError as e:
        print(f"Error converting data to numbers: {e}")
        return last_valid_conditions  # Return the last valid values if conversion fails
      
if __name__ == '__main__':
    # Create a MQTT connection
    mqtt_connection = mqtt_connection_builder.mtls_from_path(
        endpoint=ENDPOINT,
        port=8883,
        cert_filepath=CERT_FILE,
        pri_key_filepath=KEY_FILE,
        ca_filepath=CA_FILE,
        on_connection_interrupted=on_connection_interrupted,
        on_connection_resumed=on_connection_resumed,
        client_id=CLIENT_ID,
        clean_session=False,
        keep_alive_secs=30,
        on_connection_success=on_connection_success,
        on_connection_failure=on_connection_failure,
        on_connection_closed=on_connection_closed)

    print(f"Connecting to {ENDPOINT} with client ID '{CLIENT_ID}'...")
    connect_future = mqtt_connection.connect()
    connect_future.result()
    print("Connected!")

    # Publish message and capture/upload an image to S3 every 15 minutes
    publish_count = 1

    while (publish_count <= MESSAGE_COUNT) or (MESSAGE_COUNT == 0):
        #Set image name
        imageName= f"image_{time.strftime('%Y%m%d_%H%M%S')}.jpg"
        image_path = f"/home/pi/Documents/tfm/img/{imageName}" # Path where the image will be saved locally

        # Capture and upload image
        capture_image(image_path)
        upload_to_s3(image_path, BUCKET_NAME, imageName)
        upload_to_s3(image_path, BUCKET_NAME, S3_KEY)

        # Get system and network info
        system_info = get_system_info()
        network_info = get_network_info()
        # Get the number of hosts
        number_of_hosts = get_hosts_count()
        ext_temp, ext_humidity, wind_spd, wind_dir = get_ambient_conditions()

        # Create message payload
        message_json = json.dumps(
            {
                "time": int(time.time()),
                "hostname": system_info['hostname'],
                "cpu_usage": f"{system_info['cpu_usage']:.3f}",
                "memory_used": f"{system_info['memory_used']:.3f}",
                "memory_total": f"{system_info['memory_total']:.3f}",
                "disk_used": f"{system_info['disk_used']:.3f}",
                "disk_total": f"{system_info['disk_total']:.3f}",
                "cpu_temp": f"{system_info['cpu_temp']:.3f}",
                "download_speed": f"{network_info['download_speed']:.3f}",
                "upload_speed": f"{network_info['upload_speed']:.3f}",
                "number_of_hosts": f"{number_of_hosts}",
                "temperature": f"{ext_temp}",
                "humidity": f"{ext_humidity}",
                "wind_speed": f"{wind_spd}",
                "wind_direction": f"{wind_dir}",
            }, indent=2
        )

        # Publish the message to MQTT topic
        mqtt_connection.publish(
            topic=TOPIC,
            payload=message_json,
            qos=mqtt.QoS.AT_LEAST_ONCE)
        print("Published message:", message_json)
        print(f"Waiting {WAIT_TIME} minutes ...")
        # Wait for 15 minutes before the next iteration
        time.sleep(WAIT_TIME * 60)  # 15 minutes in seconds
        publish_count += 1

    # Disconnect from MQTT
    print("Disconnecting...")
    disconnect_future = mqtt_connection.disconnect()
    disconnect_future.result()
    print("Disconnected!")
