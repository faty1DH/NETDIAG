import os
import logging
from flask import Flask, render_template, request, jsonify, send_file
import io
import csv
from network_diagnostics import (
    get_system_info, 
    test_ping, 
    test_port, 
    test_speed, 
    ping_multiple
)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")

@app.route('/')
def index():
    """Render the main application page"""
    return render_template('index.html')

@app.route('/api/system-info')
def api_system_info():
    """API endpoint to get system information"""
    info = get_system_info()
    return jsonify(info)

@app.route('/api/ping')
def api_ping():
    """API endpoint to test ping to a specific IP"""
    ip = request.args.get('ip', '8.8.8.8')
    result = test_ping(ip)
    return jsonify(result)

@app.route('/api/port-test')
def api_port_test():
    """API endpoint to test if a port is open on a specific IP"""
    ip = request.args.get('ip', '192.168.1.1')
    port = int(request.args.get('port', 80))
    result = test_port(ip, port)
    return jsonify(result)

@app.route('/api/speed-test')
def api_speed_test():
    """API endpoint to test internet speed"""
    result = test_speed()
    return jsonify(result)

@app.route('/api/ping-multiple')
def api_ping_multiple():
    """API endpoint to ping multiple IPs in parallel"""
    ips = request.args.get('ips', '8.8.8.8,1.1.1.1')
    ip_list = [ip.strip() for ip in ips.split(',')]
    results = ping_multiple(ip_list)
    return jsonify(results)

@app.route('/api/full-diagnostic')
def api_full_diagnostic():
    """API endpoint to run a complete diagnostic"""
    system_info = get_system_info()
    ping_result = test_ping('8.8.8.8')
    port_result = test_port('192.168.1.1', 80)
    
    # Speed test can take time, so include it only if requested
    include_speed = request.args.get('include_speed', 'false').lower() == 'true'
    speed_result = test_speed() if include_speed else {"message": "Speed test skipped"}
    
    ip_list = ["192.168.1.1", "8.8.8.8", "1.1.1.1"]
    ping_multiple_results = ping_multiple(ip_list)
    
    return jsonify({
        "system_info": system_info,
        "ping_result": ping_result,
        "port_result": port_result,
        "speed_result": speed_result,
        "ping_multiple_results": ping_multiple_results
    })

@app.route('/api/export-report')
def api_export_report():
    """API endpoint to export diagnostic results as CSV"""
    # Get all diagnostic data
    system_info = get_system_info()
    ping_result = test_ping('8.8.8.8')
    port_result = test_port('192.168.1.1', 80)
    speed_result = test_speed()
    ip_list = ["192.168.1.1", "8.8.8.8", "1.1.1.1"]
    ping_multiple_results = ping_multiple(ip_list)
    
    # Create a CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    
    # Write system info
    writer.writerow(["=== System Information ==="])
    for key, value in system_info.items():
        writer.writerow([key, value])
    
    # Write ping result
    writer.writerow([])  # empty row for separation
    writer.writerow(["=== Ping Test ==="])
    writer.writerow(["Target", ping_result["target"]])
    writer.writerow(["Status", ping_result["status"]])
    writer.writerow(["Response Time", ping_result.get("response_time", "N/A")])
    
    # Write port test result
    writer.writerow([])
    writer.writerow(["=== Port Test ==="])
    writer.writerow(["Target", port_result["target"]])
    writer.writerow(["Port", port_result["port"]])
    writer.writerow(["Status", port_result["status"]])
    
    # Write speed test result
    writer.writerow([])
    writer.writerow(["=== Speed Test ==="])
    writer.writerow(["Download", speed_result.get("download", "N/A")])
    writer.writerow(["Upload", speed_result.get("upload", "N/A")])
    writer.writerow(["Ping", speed_result.get("ping", "N/A")])
    
    # Write multiple ping results
    writer.writerow([])
    writer.writerow(["=== Multiple Ping Test ==="])
    writer.writerow(["IP", "Status", "Response Time"])
    for result in ping_multiple_results["results"]:
        writer.writerow([
            result["ip"],
            result["status"],
            result.get("response_time", "N/A")
        ])
    
    # Create a response with the CSV
    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name='network_diagnostic_report.csv'
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
