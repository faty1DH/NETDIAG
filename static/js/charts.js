/**
 * Network Diagnostic Tool - Charts
 * This file contains chart initialization and update functions using Chart.js
 */

// Chart objects
let cpuChart = null;
let ramChart = null;
let speedChart = null;
let multiPingChart = null;

// Chart colors
const chartColors = {
    cpu: {
        primary: 'rgba(54, 162, 235, 0.8)',
        secondary: 'rgba(54, 162, 235, 0.2)'
    },
    ram: {
        primary: 'rgba(255, 99, 132, 0.8)',
        secondary: 'rgba(255, 99, 132, 0.2)'
    },
    download: {
        primary: 'rgba(75, 192, 192, 0.8)',
        secondary: 'rgba(75, 192, 192, 0.2)'
    },
    upload: {
        primary: 'rgba(153, 102, 255, 0.8)',
        secondary: 'rgba(153, 102, 255, 0.2)'
    },
    ping: {
        primary: 'rgba(255, 159, 64, 0.8)',
        secondary: 'rgba(255, 159, 64, 0.2)'
    }
};

/**
 * Initialize and set up all charts
 */
function setupCharts() {
    setupSystemCharts();
    setupSpeedChart();
    setupMultiPingChart();
}

/**
 * Set up the CPU and RAM usage gauge charts
 */
function setupSystemCharts() {
    const cpuCtx = document.getElementById('cpuChart');
    const ramCtx = document.getElementById('ramChart');
    
    if (!cpuCtx || !ramCtx) return;
    
    // CPU Usage Chart
    cpuChart = new Chart(cpuCtx, {
        type: 'doughnut',
        data: {
            labels: ['Utilisé', 'Libre'],
            datasets: [{
                data: [0, 100],
                backgroundColor: [
                    chartColors.cpu.primary,
                    chartColors.cpu.secondary
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });
    
    // RAM Usage Chart
    ramChart = new Chart(ramCtx, {
        type: 'doughnut',
        data: {
            labels: ['Utilisé', 'Libre'],
            datasets: [{
                data: [0, 100],
                backgroundColor: [
                    chartColors.ram.primary,
                    chartColors.ram.secondary
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Set up the internet speed comparison chart
 */
function setupSpeedChart() {
    const speedCtx = document.getElementById('speedChart');
    
    if (!speedCtx) return;
    
    speedChart = new Chart(speedCtx, {
        type: 'bar',
        data: {
            labels: ['Téléchargement', 'Envoi'],
            datasets: [{
                label: 'Mbps',
                data: [0, 0],
                backgroundColor: [
                    chartColors.download.primary,
                    chartColors.upload.primary
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Vitesse (Mbps)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Set up the multi-ping results chart
 */
function setupMultiPingChart() {
    const multiPingCtx = document.getElementById('multiPingChart');
    
    if (!multiPingCtx) return;
    
    multiPingChart = new Chart(multiPingCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Temps de réponse (ms)',
                data: [],
                backgroundColor: chartColors.ping.primary,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Temps de réponse (ms)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

/**
 * Update the CPU and RAM usage charts
 * @param {number} cpuValue - CPU usage percentage
 * @param {number} ramValue - RAM usage percentage
 */
function updateSystemCharts(cpuValue, ramValue) {
    if (cpuChart) {
        cpuChart.data.datasets[0].data = [cpuValue, 100 - cpuValue];
        cpuChart.update();
    }
    
    if (ramChart) {
        ramChart.data.datasets[0].data = [ramValue, 100 - ramValue];
        ramChart.update();
    }
}

/**
 * Update the internet speed chart
 * @param {number} downloadSpeed - Download speed in Mbps
 * @param {number} uploadSpeed - Upload speed in Mbps
 */
function updateSpeedChart(downloadSpeed, uploadSpeed) {
    if (speedChart) {
        speedChart.data.datasets[0].data = [downloadSpeed, uploadSpeed];
        speedChart.update();
    }
}

/**
 * Update the multi-ping results chart
 * @param {Array} resultData - Array of ping test results
 */
function updateMultiPingChart(resultData) {
    if (!multiPingChart) return;
    
    // Filter only reachable hosts with response time
    const reachableHosts = resultData.filter(item => 
        item.status === 'reachable' && item.responseTime > 0
    );
    
    const labels = reachableHosts.map(item => item.ip);
    const responseTimes = reachableHosts.map(item => item.responseTime * 1000); // Convert to ms
    
    multiPingChart.data.labels = labels;
    multiPingChart.data.datasets[0].data = responseTimes;
    multiPingChart.update();
}

// Make chart functions globally available
window.setupCharts = setupCharts;
window.updateSystemCharts = updateSystemCharts;
window.updateSpeedChart = updateSpeedChart;
window.updateMultiPingChart = updateMultiPingChart;
