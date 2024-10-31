let fetchedData = []; // To store fetched metrics data

// Fetch Image from API
// Fetch presigned URL from API
document.getElementById("fetchImage").addEventListener("click", () => {
  fetch(
    "https://zlrqhrm9o1.execute-api.us-east-1.amazonaws.com/dev/?file=uploaded_image.jpg"
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text(); // Get the presigned URL as plain text
    })
    .then((presignedUrl) => {
      displayImage(presignedUrl); // Use the presigned URL to display the image
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
      document.getElementById("imageOutput").innerText =
        "Error fetching image: " + error.message;
    });
});

function displayImage(presignedUrl) {
  const imageOutputDiv = document.getElementById("imageOutput");
  imageOutputDiv.innerHTML = ""; // Clear previous content
  const imgElement = document.createElement("img");
  imgElement.src = presignedUrl; // Use presigned URL as the image source
  imageOutputDiv.appendChild(imgElement);
}

//Fetch image description
// Fetch image description
document.getElementById("fetchImage").addEventListener("click", () => {
  fetch("https://p3y960rt0l.execute-api.us-east-1.amazonaws.com/dev")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch image details");
      }
      return response.json();
    })
    .then((data) => {
      // Parse the body string into a JSON object
      const parsedBody = JSON.parse(data.body);
      displayImageDetails(parsedBody);
    })
    .catch((error) => {
      console.error("Error fetching image details:", error);
      document.getElementById("imageDescription").innerText =
        "Error fetching image details: " + error.message;
    });
});

function displayImageDetails(data) {
  const imageDescriptionDiv = document.getElementById("imageDescription");
  imageDescriptionDiv.innerHTML = ""; // Clear previous content

  const numberOfPersons = data.FaceDetails.length;

  const faceDetails =
    numberOfPersons > 0
      ? data.FaceDetails.map(
          (detail) =>
            `<strong>Gender:</strong> ${detail.Gender} <br>
            <strong>Emotions:</strong> ${detail.Emotions} <br>
            <strong>Age Range:</strong> ${detail.AgeRange} <br>
            <strong>Detection Confidence:</strong> ${detail.DetectionConfidence} <br><br>`
        ).join("")
      : "<p>No faces detected.</p>";

  imageDescriptionDiv.innerHTML = `
      <div>
        <h4>Number of Persons Detected: ${numberOfPersons}</h4>
        <h4>Face Details</h4>
        ${faceDetails}
      </div>
    `;
}

// Fetch Metrics from API
document.getElementById("fetchMetrics").addEventListener("click", () => {
  fetch("https://g3g21xga5k.execute-api.us-east-1.amazonaws.com/dev/")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const parsedBody = JSON.parse(data.body);
      fetchedData = parsedBody; // Store the fetched data for plotting
      displayMetrics(parsedBody);

      // Display the total record count in the paragraph
      document.getElementById(
        "rawDataSub"
      ).innerHTML = `Total Records = ${fetchedData.length}`;

      // Display the plots
      updateLastUpdatedTime(); // Call the function to update time
      updateIoTDashboard(parsedBody); // Update dashboard
      plotNumberOfHosts(); // Plot the number of hosts chart
      plotCPUData(); // Plot the CPU Temperature and CPU Usage charts
      plotSpeedData(); // Plot Download Speed and Upload Speed charts
      plotExternalTemperature(); // Plot the external temperature
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
      document.getElementById("metricsOutput").innerText =
        "Error fetching metrics: " + error.message;
    });
});

function displayMetrics(data) {
  const metricsOutputDiv = document.getElementById("metricsOutput");
  metricsOutputDiv.innerHTML = ""; // Clear previous content

  data.forEach((item) => {
    // Example timestamp
    const timestamp = item.time.N;

    // Convert to milliseconds by multiplying by 1000
    const date = new Date(timestamp * 1000);

    // Get the formatted date and time
    const formattedDate = date.toLocaleDateString(); // e.g., "10/16/2024"
    const formattedTime = date.toLocaleTimeString(); // e.g., "14:31:08"

    const entry = `
<strong>Hostname:</strong> ${item.hostname.S} <br>
<strong>Date:</strong> ${formattedDate} <br>
<strong>Time:</strong> ${formattedTime} <br>
<strong>CPU Temperature:</strong> ${item.cpu_temp.N} °C <br>
<strong>CPU Usage:</strong> ${item.cpu_usage.N} % <br>
<strong>Memory Used:</strong> ${item.memory_used.N} MB <br>
<strong>Memory Total:</strong> ${item.memory_total.N} MB <br>
<strong>Disk Used:</strong> ${item.disk_used.N} GB <br>
<strong>Disk Total:</strong> ${item.disk_total.N} GB <br>
<strong>Download Speed:</strong> ${item.download_speed.N} Mbps <br>
<strong>Upload Speed:</strong> ${item.upload_speed.N} Mbps <br>
<strong>Network Devices:</strong> ${item.number_of_hosts.N} hosts <br>
<strong>External Temperature:</strong> ${item.external_temperature.N} °C  <hr>
`;
    metricsOutputDiv.innerHTML += entry;
  });

  plotSelectedParameter("Right");
}

document
  .getElementById("parameterSelectRight")
  .addEventListener("change", () => plotSelectedParameter("Right"));

function plotSelectedParameter(plotSide) {
  const parameterSelect =
    plotSide === "Left"
      ? document.getElementById("parameterSelectLeft").value
      : document.getElementById("parameterSelectRight").value;

  const labels = fetchedData
    .map((item) => new Date(item.time.N * 1000).toLocaleTimeString())
    .reverse(); // Reverse the order so latest values appear on the right;
  const values = fetchedData
    .map((item) => parseFloat(item[parameterSelect].N))
    .reverse(); // Reverse the order;;

  const chartId = plotSide === "Left" ? "plotChartLeft" : "plotChartRight";
  const ctx = document.getElementById(chartId).getContext("2d");

  if (window["myChart" + plotSide]) {
    window["myChart" + plotSide].destroy();
  }

  window["myChart" + plotSide] = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: parameterSelect,
          data: values,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0, // Hide the points
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: parameterSelect,
          },
        },
      },
    },
  });
}

// Function to display the current date and time
function updateLastUpdatedTime() {
  const lastUpdatedDiv = document.getElementById("lastUpdated");

  // Get the current date and time
  const now = new Date();
  const formattedDate = now.toLocaleDateString(); // e.g., "10/16/2024"
  const formattedTime = now.toLocaleTimeString(); // e.g., "14:31:08"

  // Update the content of the last updated div
  lastUpdatedDiv.innerHTML = `<strong>Last Updated:</strong> ${formattedDate} at ${formattedTime}`;
}

function updateIoTDashboard(parsedBody) {
  const dashboardIoT = document.getElementById("dashboardOutput");

  item = parsedBody[0];

  const timestamp = item.time.N;

  // Convert to milliseconds by multiplying by 1000
  const date = new Date(timestamp * 1000);

  // Get the formatted date and time
  const formattedDate = date.toLocaleDateString(); // e.g., "10/16/2024"
  const formattedTime = date.toLocaleTimeString(); // e.g., "14:31:08"
  const entry = `
  <div>
  <p><strong>Hostname:</strong> ${item.hostname.S}</p>
  <p><strong>Date:</strong> ${formattedDate} </p>
  <p><strong>Time:</strong> ${formattedTime} </p>
  <p><strong>CPU Temperature:</strong> ${item.cpu_temp.N} °C </p>
  <p><strong>CPU Usage:</strong> ${item.cpu_usage.N} % </p>
  <p><p><strong>Memory Used:</strong> ${item.memory_used.N} MB </p>
  <p><strong>Memory Total:</strong> ${item.memory_total.N} MB </p>
  <p><strong>Disk Used:</strong> ${item.disk_used.N} GB </p>
  <p><strong>Disk Total:</strong> ${item.disk_total.N} GB </p>
  <p><strong>Download Speed:</strong> ${item.download_speed.N} Mbps </p>
  <p><strong>Upload Speed:</strong> ${item.upload_speed.N} Mbps </p>
  <p><strong>Network Devices:</strong> ${item.number_of_hosts.N} hosts </p> 
  <p><strong>External Temperature:</strong> ${item.external_temperature.N} °C </p> 
  </div>
  `;

  dashboardIoT.innerHTML = entry;
}

// Plot CPU Temperature and CPU Usage
function plotCPUData() {
  // Extract labels (time) and values for CPU Temperature and CPU Usage
  const labels = fetchedData
    .map((item) => new Date(item.time.N * 1000).toLocaleTimeString())
    .reverse(); // Reverse the order so latest values appear on the right;
  const cpuTempValues = fetchedData
    .map((item) => parseFloat(item.cpu_temp.N))
    .reverse(); // Reverse the order;;
  const cpuUsageValues = fetchedData
    .map((item) => parseFloat(item.cpu_usage.N))
    .reverse(); // Reverse the order;

  // Plot CPU Temperature
  const cpuTempCtx = document.getElementById("cpuTempPlot").getContext("2d");
  if (window.cpuTempChart) {
    window.cpuTempChart.destroy();
  }
  window.cpuTempChart = new Chart(cpuTempCtx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "CPU Temperature (°C)",
          data: cpuTempValues,
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0, // Hide the points
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "CPU Temperature (°C)",
          },
        },
      },
    },
  });

  // Plot CPU Usage
  const cpuUsageCtx = document.getElementById("cpuUsagePlot").getContext("2d");
  if (window.cpuUsageChart) {
    window.cpuUsageChart.destroy();
  }
  window.cpuUsageChart = new Chart(cpuUsageCtx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "CPU Usage (%)",
          data: cpuUsageValues,
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0, // Hide the points
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "CPU Usage (%)",
          },
        },
      },
    },
  });
}

// Plot Download Speed and Upload Speed
function plotSpeedData() {
  const labels = fetchedData
    .map((item) => new Date(item.time.N * 1000).toLocaleTimeString())
    .reverse(); // Reverse the order so latest values appear on the right;
  const downloadSpeedValues = fetchedData
    .map((item) => parseFloat(item.download_speed.N))
    .reverse(); // Reverse the order;
  const uploadSpeedValues = fetchedData
    .map((item) => parseFloat(item.upload_speed.N))
    .reverse(); // Reverse the order;

  // Plot Download Speed
  const downloadSpeedCtx = document
    .getElementById("downloadSpeedPlot")
    .getContext("2d");
  if (window.downloadSpeedChart) {
    window.downloadSpeedChart.destroy();
  }
  window.downloadSpeedChart = new Chart(downloadSpeedCtx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Download Speed (Mbps)",
          data: downloadSpeedValues,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0, // Hide the points
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Download Speed (Mbps)",
          },
        },
      },
    },
  });

  // Plot Upload Speed
  const uploadSpeedCtx = document
    .getElementById("uploadSpeedPlot")
    .getContext("2d");
  if (window.uploadSpeedChart) {
    window.uploadSpeedChart.destroy();
  }
  window.uploadSpeedChart = new Chart(uploadSpeedCtx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Upload Speed (Mbps)",
          data: uploadSpeedValues,
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0, // Hide the points
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Upload Speed (Mbps)",
          },
        },
      },
    },
  });
}

function plotNumberOfHosts() {
  // Extract labels (time) and values for the number of hosts
  const labels = fetchedData
    .map((item) => new Date(item.time.N * 1000).toLocaleTimeString())
    .reverse(); // Reverse the order so latest values appear on the right;
  const numberOfHostsValues = fetchedData
    .map((item) => parseInt(item.number_of_hosts.N))
    .reverse(); // Reverse the order;

  // Get the context for the devicesPlot canvas
  const devicesPlotCtx = document
    .getElementById("devicesPlot")
    .getContext("2d");

  // Destroy any existing chart instance to prevent duplication
  if (window.devicesPlotChart) {
    window.devicesPlotChart.destroy();
  }

  // Create a new line chart
  window.devicesPlotChart = new Chart(devicesPlotCtx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Number of Hosts",
          data: numberOfHostsValues,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
          pointRadius: 0, // Hide the points
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Number of Hosts",
          },
        },
      },
    },
  });
}

//Plot external temperature
function plotExternalTemperature() {
  // Extract labels (time) and values for the external temperature
  const labels = fetchedData
    .map((item) => new Date(item.time.N * 1000).toLocaleTimeString())
    .reverse(); // Reverse the order so latest values appear on the right;
  const externalTempValues = fetchedData
    .map((item) => parseFloat(item.external_temperature.N))
    .reverse(); // Reverse the order;

  // Get the context for the extTempPlot canvas
  const extTempCtx = document.getElementById("extTempPlot").getContext("2d");

  // Destroy any existing chart instance to prevent duplication
  if (window.extTempChart) {
    window.extTempChart.destroy();
  }

  // Create a new line chart for external temperature
  window.extTempChart = new Chart(extTempCtx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "External Temperature (°C)",
          data: externalTempValues,
          borderColor: "rgba(255, 159, 64, 1)", // Example color
          borderWidth: 2,
          fill: false,
          pointRadius: 0, // Hide the points
        },
      ],
    },
    options: {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "External Temperature (°C)",
          },
        },
      },
    },
  });
}