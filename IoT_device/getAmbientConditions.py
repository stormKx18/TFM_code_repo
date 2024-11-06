import requests
from bs4 import BeautifulSoup
import re

def get_ambient_conditions():
    METRICS=4
    url = "https://www.meteored.mx/ciudad-de-mexico/historico"
    try:
        response = requests.get(url, timeout=10)  # Agrega un timeout en caso de que la solicitud tarde demasiado
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Selecciona los elementos de temperatura y humedad
            temperature_element = soup.select_one("#ult_dato_temp")
            humidity_element = soup.select_one("#ult_dato_hum")
            wind_speed_element = soup.select_one("#ult_dato_velviento")
            wind_direction_element_raw = soup.select_one("#ult_dato_dirviento")
            wind_direction_element= re.search(r"\((\d+)", wind_direction_element_raw.get_text()).group(1)
            # Verifica que ambos elementos existen antes de intentar extraer los datos
            if temperature_element and humidity_element:
                temperature = float(temperature_element.get_text())
                humidity = float(humidity_element.get_text())
                wind_speed=float(wind_speed_element.get_text())/ 3.6
                wind_direction=float(wind_direction_element)
                return [temperature, humidity, wind_speed, wind_direction]
            else:
                print("No se encontraron los elementos de temperatura o humedad.")
                return [-100]*METRICS
        else:
            print(f"Error al acceder a la página. Código de estado: {response.status_code}")
            return [-100]*METRICS
    except requests.exceptions.RequestException as e:
        print(f"Error de red al obtener la temperatura y humedad: {e}")
        return [-100]*METRICS
    except ValueError as e:
        print(f"Error al convertir los datos a números: {e}")
        return [-100]*METRICS


temp, hum, wind_spd, wind_dir = get_ambient_conditions()
print('T:',temp, ' H:',hum, ' Wspd:',wind_spd, ' Wdir:',wind_dir)