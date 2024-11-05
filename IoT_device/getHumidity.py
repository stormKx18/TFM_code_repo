import requests
from bs4 import BeautifulSoup

def get_external_temperature_humidity():
    url = "https://www.meteored.mx/ciudad-satelite-1-524023.html"
    try:
        response = requests.get(url, timeout=10)  # Agrega un timeout en caso de que la solicitud tarde demasiado
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Selecciona los elementos de temperatura y humedad
            temperature_element = soup.select_one("#d_hub_1 > span > span.row.info-act > span.temperatura > span > span > span.dato-temperatura.changeUnitT")
            humidity_element = soup.select_one("#d_hub_1 > span > span.row.info-act > span.datos-uv.col > span:nth-child(2) > strong")

            # Verifica que ambos elementos existen antes de intentar extraer los datos
            if temperature_element and humidity_element:
                temperature = float(temperature_element.get_text().strip().rstrip('°'))
                humidity = float(humidity_element.get_text().strip().rstrip('%'))
                return [temperature, humidity]
            else:
                print("No se encontraron los elementos de temperatura o humedad.")
                return [-100, -100]
        else:
            print(f"Error al acceder a la página. Código de estado: {response.status_code}")
            return [-100, -100]
    except requests.exceptions.RequestException as e:
        print(f"Error de red al obtener la temperatura y humedad: {e}")
        return [-100, -100]
    except ValueError as e:
        print(f"Error al convertir los datos a números: {e}")
        return [-100, -100]


temp, hum = get_external_temperature_humidity()
print('T:',temp, ' H:',hum)