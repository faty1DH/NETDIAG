/**
 * Network Diagnostic Tool - Main JavaScript
 */

// DOM Elements
const diagnosticLog = document.getElementById('diagnosticLog');
const clearLogBtn = document.getElementById('clearLogBtn');
const exportReportBtn = document.getElementById('exportReportBtn');
const runFullDiagnosticBtn = document.getElementById('runFullDiagnosticBtn');
const clearOutputBtn = document.getElementById('clearOutputBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');

// System Info Elements
const refreshSystemInfoBtn = document.getElementById('refreshSystemInfoBtn');

// Ping Test Elements
const pingIpInput = document.getElementById('pingIpInput');
const runPingBtn = document.getElementById('runPingBtn');
const pingResultLoader = document.getElementById('pingResultLoader');
const pingResultCard = document.getElementById('pingResultCard');

// Port Test Elements
const portIpInput = document.getElementById('portIpInput');
const portNumberInput = document.getElementById('portNumberInput');
const runPortTestBtn = document.getElementById('runPortTestBtn');
const portResultLoader = document.getElementById('portResultLoader');
const portResultCard = document.getElementById('portResultCard');

// Speed Test Elements
const runSpeedTestBtn = document.getElementById('runSpeedTestBtn');
const speedResultLoader = document.getElementById('speedResultLoader');
const speedResultCard = document.getElementById('speedResultCard');

// Multi-Ping Test Elements
const multiPingIpsInput = document.getElementById('multiPingIpsInput');
const runMultiPingBtn = document.getElementById('runMultiPingBtn');
const multiPingResultLoader = document.getElementById('multiPingResultLoader');
const multiPingResultCard = document.getElementById('multiPingResultCard');
const multiPingResultsTable = document.getElementById('multiPingResultsTable');

/**
 * Theme handling
 */
// Check for saved theme preference or respect OS preference
const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Apply theme
const applyTheme = (theme) => {
    document.body.setAttribute('data-bs-theme', theme);
    // Update button text
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector('i');
        if (theme === 'dark') {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Mode clair';
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i> Mode sombre';
        }
    }
    localStorage.setItem('theme', theme);
};

// Toggle theme
const toggleTheme = () => {
    const currentTheme = document.body.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
};

// Initialize theme
applyTheme(getPreferredTheme());

// Event Listeners
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}

/**
 * Logging functions
 */
const log = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logItem = document.createElement('div');
    logItem.className = `log-item log-${type}`;
    logItem.innerHTML = `<span class="log-time">[${timestamp}]</span> <span class="log-message">${message}</span>`;
    diagnosticLog.appendChild(logItem);
    diagnosticLog.scrollTop = diagnosticLog.scrollHeight;
    
    // Remove the initial placeholder text if present
    const placeholder = diagnosticLog.querySelector('.text-muted');
    if (placeholder) {
        placeholder.remove();
    }
};

const clearLog = () => {
    diagnosticLog.innerHTML = '<p class="text-muted">Le journal de diagnostic s\'affichera ici...</p>';
};

/**
 * System Information functions
 */
const refreshSystemInfo = async () => {
    const systemInfoLoader = document.getElementById('systemInfoLoader');
    const systemInfoContent = document.getElementById('systemInfoContent');
    
    try {
        systemInfoLoader.classList.remove('d-none');
        systemInfoContent.classList.add('opacity-50');
        
        log('Récupération des informations système...');
        
        const response = await fetch('/api/system-info');
        const data = await response.json();
        
        // Update system info values
        document.getElementById('systemOS').textContent = data.system || 'N/A';
        document.getElementById('systemVersion').textContent = data.version || 'N/A';
        document.getElementById('systemArch').textContent = data.architecture || 'N/A';
        document.getElementById('systemCPU').textContent = data.processor || 'N/A';
        document.getElementById('cpuUsage').textContent = data.cpu_usage || 'N/A';
        document.getElementById('ramUsage').textContent = data.ram_usage || 'N/A';
        
        // Update the charts
        if (window.cpuChart && window.ramChart) {
            // Extract numeric value from percentage string
            const cpuValue = parseFloat(data.cpu_usage);
            const ramValue = parseFloat(data.ram_usage);
            
            updateSystemCharts(cpuValue, ramValue);
        }
        
        log('Informations système mises à jour avec succès', 'success');
    } catch (error) {
        console.error('Error fetching system info:', error);
        log(`Erreur lors de la récupération des informations système: ${error.message}`, 'error');
    } finally {
        systemInfoLoader.classList.add('d-none');
        systemInfoContent.classList.remove('opacity-50');
    }
};

/**
 * Ping Test functions
 */
const runPingTest = async () => {
    const ipAddress = pingIpInput.value.trim();
    if (!ipAddress) {
        log('Veuillez entrer une adresse IP ou un nom de domaine', 'warning');
        return;
    }
    
    try {
        pingResultLoader.classList.remove('d-none');
        pingResultCard.classList.add('d-none');
        
        log(`Exécution du test de ping vers ${ipAddress}...`);
        
        const response = await fetch(`/api/ping?ip=${encodeURIComponent(ipAddress)}`);
        const data = await response.json();
        
        // Update the ping result card
        document.getElementById('pingTarget').textContent = data.target;
        
        const pingStatusIndicator = document.getElementById('pingStatusIndicator');
        const pingStatusText = document.getElementById('pingStatusText');
        
        if (data.status === 'reachable') {
            pingStatusIndicator.className = 'status-indicator status-success';
            pingStatusText.textContent = 'Accessible';
            pingStatusText.className = 'fw-bold text-success';
            document.getElementById('pingResponseTime').textContent = data.response_time;
        } else {
            pingStatusIndicator.className = 'status-indicator status-error';
            pingStatusText.textContent = 'Non accessible';
            pingStatusText.className = 'fw-bold text-danger';
            document.getElementById('pingResponseTime').textContent = 'N/A';
        }
        
        pingResultCard.classList.remove('d-none');
        log(`Ping vers ${ipAddress} terminé: ${data.status}`, data.status === 'reachable' ? 'success' : 'error');
    } catch (error) {
        console.error('Error running ping test:', error);
        log(`Erreur lors du test de ping: ${error.message}`, 'error');
    } finally {
        pingResultLoader.classList.add('d-none');
    }
};

/**
 * Port Test functions
 */
const runPortTest = async () => {
    const ipAddress = portIpInput.value.trim();
    const portNumber = parseInt(portNumberInput.value);
    
    if (!ipAddress) {
        log('Veuillez entrer une adresse IP', 'warning');
        return;
    }
    
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
        log('Veuillez entrer un numéro de port valide (1-65535)', 'warning');
        return;
    }
    
    try {
        portResultLoader.classList.remove('d-none');
        portResultCard.classList.add('d-none');
        
        log(`Exécution du test de port ${portNumber} sur ${ipAddress}...`);
        
        const response = await fetch(`/api/port-test?ip=${encodeURIComponent(ipAddress)}&port=${portNumber}`);
        const data = await response.json();
        
        // Update the port result card
        document.getElementById('portTarget').textContent = data.target;
        document.getElementById('portNumber').textContent = data.port;
        
        const portStatusIndicator = document.getElementById('portStatusIndicator');
        const portStatusText = document.getElementById('portStatusText');
        
        if (data.status === 'open') {
            portStatusIndicator.className = 'status-indicator status-success';
            portStatusText.textContent = 'Ouvert';
            portStatusText.className = 'fw-bold text-success';
        } else {
            portStatusIndicator.className = 'status-indicator status-error';
            portStatusText.textContent = 'Fermé';
            portStatusText.className = 'fw-bold text-danger';
        }
        
        portResultCard.classList.remove('d-none');
        log(`Test de port ${portNumber} sur ${ipAddress} terminé: ${data.status}`, data.status === 'open' ? 'success' : 'error');
    } catch (error) {
        console.error('Error running port test:', error);
        log(`Erreur lors du test de port: ${error.message}`, 'error');
    } finally {
        portResultLoader.classList.add('d-none');
    }
};

/**
 * Speed Test functions
 */
const runSpeedTest = async () => {
    try {
        speedResultLoader.classList.remove('d-none');
        speedResultCard.classList.add('d-none');
        
        log('Exécution du test de vitesse Internet...');
        log('Le test peut prendre jusqu\'à 30 secondes, veuillez patienter...', 'info');
        
        const response = await fetch('/api/speed-test');
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Update the speed result card
        document.getElementById('downloadSpeed').textContent = data.download;
        document.getElementById('uploadSpeed').textContent = data.upload;
        document.getElementById('pingSpeed').textContent = data.ping;
        
        // Update the speed chart
        if (window.speedChart) {
            updateSpeedChart(
                parseFloat(data.download_raw),
                parseFloat(data.upload_raw)
            );
        }
        
        speedResultCard.classList.remove('d-none');
        log(`Test de vitesse Internet terminé. Téléchargement: ${data.download}, Envoi: ${data.upload}`, 'success');
    } catch (error) {
        console.error('Error running speed test:', error);
        log(`Erreur lors du test de vitesse: ${error.message}`, 'error');
    } finally {
        speedResultLoader.classList.add('d-none');
    }
};

/**
 * Multi-Ping Test functions
 */
const runMultiPingTest = async () => {
    const ipsText = multiPingIpsInput.value.trim();
    if (!ipsText) {
        log('Veuillez entrer au moins une adresse IP', 'warning');
        return;
    }
    
    try {
        multiPingResultLoader.classList.remove('d-none');
        multiPingResultCard.classList.add('d-none');
        
        log(`Exécution des tests de ping multiples...`);
        
        const response = await fetch(`/api/ping-multiple?ips=${encodeURIComponent(ipsText)}`);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Clear the table
        multiPingResultsTable.innerHTML = '';
        
        // Populate the table with results
        const resultData = [];
        
        data.results.forEach(result => {
            const row = document.createElement('tr');
            
            // Create IP cell
            const ipCell = document.createElement('td');
            ipCell.textContent = result.ip;
            row.appendChild(ipCell);
            
            // Create status cell
            const statusCell = document.createElement('td');
            const statusIndicator = document.createElement('div');
            statusIndicator.className = 'status-indicator me-2 d-inline-block ' + 
                (result.status === 'reachable' ? 'status-success' : 'status-error');
            
            const statusText = document.createElement('span');
            statusText.textContent = result.status === 'reachable' ? 'Accessible' : 'Non accessible';
            statusText.className = 'fw-bold ' + 
                (result.status === 'reachable' ? 'text-success' : 'text-danger');
            
            statusCell.appendChild(statusIndicator);
            statusCell.appendChild(statusText);
            row.appendChild(statusCell);
            
            // Create response time cell
            const timeCell = document.createElement('td');
            timeCell.textContent = result.response_time || 'N/A';
            row.appendChild(timeCell);
            
            multiPingResultsTable.appendChild(row);
            
            // Collect data for the chart
            resultData.push({
                ip: result.ip,
                status: result.status,
                responseTime: result.response_time_raw || 0
            });
        });
        
        // Update the multi-ping chart
        if (window.multiPingChart) {
            updateMultiPingChart(resultData);
        }
        
        multiPingResultCard.classList.remove('d-none');
        log(`Tests de ping multiples terminés avec succès`, 'success');
    } catch (error) {
        console.error('Error running multi-ping test:', error);
        log(`Erreur lors des tests de ping multiples: ${error.message}`, 'error');
    } finally {
        multiPingResultLoader.classList.add('d-none');
    }
};

/**
 * Full Diagnostic function
 */
const runFullDiagnostic = async () => {
    try {
        log('Démarrage du diagnostic réseau complet...', 'info');
        
        // Clear the log
        clearLog();
        
        // Run system info
        log('1. Récupération des informations système...', 'info');
        await refreshSystemInfo();
        
        // Run ping test
        log('2. Test de ping vers 8.8.8.8...', 'info');
        pingIpInput.value = '8.8.8.8';
        await runPingTest();
        
        // Run port test
        log('3. Test du port 80 sur 192.168.1.1...', 'info');
        portIpInput.value = '192.168.1.1';
        portNumberInput.value = '80';
        await runPortTest();
        
        // Run multi-ping test
        log('4. Tests de ping multiples...', 'info');
        multiPingIpsInput.value = '8.8.8.8,1.1.1.1,192.168.1.1';
        await runMultiPingTest();
        
        // Run speed test (optionally, since it takes longer)
        log('5. Test de vitesse Internet...', 'info');
        await runSpeedTest();
        
        log('Diagnostic réseau complet terminé avec succès', 'success');
    } catch (error) {
        console.error('Error running full diagnostic:', error);
        log(`Erreur lors du diagnostic complet: ${error.message}`, 'error');
    }
};

/**
 * Export Report function
 */
const exportReport = () => {
    try {
        log('Exportation du rapport de diagnostic...', 'info');
        
        // Trigger file download
        window.location.href = '/api/export-report';
        
        log('Rapport exporté avec succès', 'success');
    } catch (error) {
        console.error('Error exporting report:', error);
        log(`Erreur lors de l'exportation du rapport: ${error.message}`, 'error');
    }
};

/**
 * Add event listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // System Info
    if (refreshSystemInfoBtn) refreshSystemInfoBtn.addEventListener('click', refreshSystemInfo);
    
    // Ping Test
    if (runPingBtn) runPingBtn.addEventListener('click', runPingTest);
    
    // Port Test
    if (runPortTestBtn) runPortTestBtn.addEventListener('click', runPortTest);
    
    // Speed Test
    if (runSpeedTestBtn) runSpeedTestBtn.addEventListener('click', runSpeedTest);
    
    // Multi-Ping Test
    if (runMultiPingBtn) runMultiPingBtn.addEventListener('click', runMultiPingTest);
    
    // Full Diagnostic
    if (runFullDiagnosticBtn) runFullDiagnosticBtn.addEventListener('click', runFullDiagnostic);
    
    // Export Report
    if (exportReportBtn) exportReportBtn.addEventListener('click', exportReport);
    
    // Clear Log
    if (clearLogBtn) clearLogBtn.addEventListener('click', clearLog);
    
    // Clear Output
    if (clearOutputBtn) clearOutputBtn.addEventListener('click', () => {
        // Hide all result cards
        pingResultCard.classList.add('d-none');
        portResultCard.classList.add('d-none');
        speedResultCard.classList.add('d-none');
        multiPingResultCard.classList.add('d-none');
        
        // Clear log
        clearLog();
        
        log('Affichage effacé', 'info');
    });
    
    // Add enter key handler for input fields
    if (pingIpInput) {
        pingIpInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') runPingTest();
        });
    }
    
    if (portNumberInput) {
        portNumberInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') runPortTest();
        });
    }
    
    if (multiPingIpsInput) {
        multiPingIpsInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') runMultiPingTest();
        });
    }
});
