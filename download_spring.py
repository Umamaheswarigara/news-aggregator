import urllib.request
import zipfile
import io
import os

# Omit bootVersion to let it use the default latest stable release
url = (
    "https://start.spring.io/starter.zip"
    "?type=maven-project"
    "&language=java"
    "&groupId=com.newsaggregator"
    "&artifactId=backend"
    "&name=backend"
    "&packageName=com.newsaggregator"
    "&packaging=jar"
    "&javaVersion=21"
    "&dependencies=web,data-jpa,postgresql,validation,security"
)

dest_dir = "c:\\Users\\Dell\\Desktop\\DBMS\\backend-spring"
os.makedirs(dest_dir, exist_ok=True)

print("Downloading Spring Boot project from Spring Initializr...")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        zip_data = response.read()
    print("Download complete. Extracting files...")
    with zipfile.ZipFile(io.BytesIO(zip_data)) as zip_ref:
        zip_ref.extractall(dest_dir)
    print(f"Spring Boot project extracted successfully to {dest_dir}!")
except Exception as e:
    print(f"Error occurred: {e}")
