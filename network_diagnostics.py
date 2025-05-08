import platform
import socket
from ping3 import ping
import psutil
import speedtest
import pandas as pd
from concurrent.futures import ThreadPoolExecutor
import datetime
import time
import logging

def get_system_info():
    """Get system information"""
    try:
        info = {
            "system": platform.system(),
            "version": platform.version(),
            "architecture": platform.machine(),
            "processor": platform.processor(),
            "cpu_usage": f"{psutil.cpu_percent()} %",
            "ram_usage": f"{psutil.virtual_memory().percent} %",
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        return info
    except Exception as e:
        logging.error(f"Error getting system info: {str(e)}")
        return {"error": str(e)}

def test_ping(ip="8.8.8.8"):
    """Test ping to a specific IP"""
    try:
        result = ping(ip)
        if result:
            return {
                "target": ip,
                "status": "reachable",
                "response_time": f"{result:.2f} sec",
                "response_time_raw": result
            }
        else:
            return {
                "target": ip,
                "status": "unreachable"
            }
    except Exception as e:
        logging.error(f"Error testing ping to {ip}: {str(e)}")
        return {
            "target": ip,
            "status": "error",
            "error": str(e)
        }

def test_port(ip, port):
    """Test if a port is open on a specific IP"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(1)
        result = sock.connect_ex((ip, port))
        sock.close()
        
        if result == 0:
            return {
                "target": ip,
                "port": port,
                "status": "open"
            }
        else:
            return {
                "target": ip,
                "port": port,
                "status": "closed"
            }
    except Exception as e:
        logging.error(f"Error testing port {port} on {ip}: {str(e)}")
        return {
            "target": ip,
            "port": port,
            "status": "error",
            "error": str(e)
        }

def test_speed():
    """Test internet speed"""
    try:
        st = speedtest.Speedtest()
        st.get_best_server()
        
        # Run download test
        download = st.download() / 1_000_000  # Convert to Mbps
        
        # Run upload test
        upload = st.upload() / 1_000_000  # Convert to Mbps
        
        # Get ping
        ping_ms = st.results.ping
        
        return {
            "download": f"{download:.2f} Mbps",
            "upload": f"{upload:.2f} Mbps",
            "ping": f"{ping_ms:.2f} ms",
            "download_raw": download,
            "upload_raw": upload,
            "ping_raw": ping_ms,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        logging.error(f"Error testing internet speed: {str(e)}")
        return {"error": str(e)}

def ping_multiple(ips):
    """Ping multiple IPs in parallel"""
    try:
        def verify(ip):
            response = ping(ip)
            status = "reachable" if response else "unreachable"
            result = {"ip": ip, "status": status}
            if response:
                result["response_time"] = f"{response:.2f} sec"
                result["response_time_raw"] = response
            return result

        with ThreadPoolExecutor() as executor:
            results = list(executor.map(verify, ips))

        return {
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "results": results
        }
    except Exception as e:
        logging.error(f"Error running parallel ping: {str(e)}")
        return {"error": str(e)}
