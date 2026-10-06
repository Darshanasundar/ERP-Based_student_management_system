# EduManage ERP - AWS Deployment Guide

This guide covers the end-to-end process of deploying the EduManage ERP (Spring Boot Backend + React Frontend) to AWS using EC2, RDS (MySQL), and S3.

## 1. Amazon RDS Configuration (MySQL)

### Database Setup
1. Go to the AWS RDS Console and create a new **MySQL** database instance.
2. Ensure **"Public access" is set to "No"** for enhanced security.
3. Note down the **Endpoint URL**, **Username**, and **Password**.

### RDS Security Group Configuration
To allow your EC2 instance to connect to the RDS database securely without exposing it to the open internet:
1. Identify the **Security Group** attached to your EC2 instance (e.g., `sg-ec2-backend`).
2. Go to the **Security Group** attached to your RDS instance (e.g., `sg-rds-db`).
3. Add a new **Inbound Rule** to the RDS Security Group:
   - **Type**: MySQL/Aurora
   - **Port Range**: 3306
   - **Source**: Select the EC2 Security Group ID (`sg-ec2-backend`).
   *(This ensures only resources with the EC2 security group can reach your database, keeping it completely hidden from the public internet).*

---

## 2. Spring Boot Backend Deployment

### Maven JAR Packaging
Before deploying, package your Spring Boot application into a fat `.jar` file using the `prod` profile:

```bash
# Navigate to the backend directory
cd spring-backend-reference

# Run Maven package, skipping tests if necessary
mvn clean package -DskipTests
```
This generates an executable JAR file in the `target/` folder (e.g., `edumanage-backend-0.0.1-SNAPSHOT.jar`).

### EC2 Setup & Systemd Service
Connect to your Amazon Linux 2023 or Ubuntu EC2 instance and run the following commands:

```bash
# 1. Update packages and install OpenJDK 17
sudo dnf update -y     # Use apt-get for Ubuntu
sudo dnf install java-17-amazon-corretto -y

# 2. Create an application directory
sudo mkdir -p /var/edumanage
sudo chown -R ec2-user:ec2-user /var/edumanage

# (Upload your .jar file to /var/edumanage using scp or sftp)
# Example: scp -i key.pem target/edumanage-backend-0.0.1-SNAPSHOT.jar ec2-user@<EC2-IP>:/var/edumanage/edumanage.jar
```

Create a systemd service file to manage the application:
```bash
sudo nano /etc/systemd/system/edumanage.service
```

Paste the following configuration:
```ini
[Unit]
Description=EduManage ERP Spring Boot Backend
After=syslog.target network.target

[Service]
User=ec2-user
ExecStart=/usr/bin/java -jar /var/edumanage/edumanage.jar --spring.profiles.active=prod
SuccessExitStatus=143
Restart=always
RestartSec=10
Environment="RDS_HOSTNAME=your-rds-endpoint.amazonaws.com"
Environment="RDS_DB_NAME=edumanage"
Environment="RDS_USERNAME=admin"
Environment="RDS_PASSWORD=your_secure_password"
Environment="AWS_ACCESS_KEY_ID=your_aws_key"
Environment="AWS_SECRET_ACCESS_KEY=your_aws_secret"
Environment="AWS_REGION=us-east-1"
Environment="AWS_S3_BUCKET_NAME=your-s3-bucket-name"

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable edumanage
sudo systemctl start edumanage
sudo systemctl status edumanage # Verify it's running
```

---

## 3. React Frontend Deployment & Nginx Reverse Proxy

### React Production Build
Update your Axios base URL in `src/services/api.js` to point to the EC2 domain (e.g., `https://your-domain.com/api` or `/api` if served on the same domain).

```javascript
// src/services/api.js
const api = axios.create({
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:8080/api', // Example dynamic routing
  headers: { 'Content-Type': 'application/json' },
});
```

Build the static assets:
```bash
npm run build
```
Upload the contents of the `dist/` folder to `/var/www/edumanage` on your EC2 instance.

### Nginx Configuration
Install and configure Nginx to serve the React app and proxy API requests to Spring Boot.

```bash
sudo dnf install nginx -y
sudo systemctl enable nginx
```

Edit the Nginx configuration:
```bash
sudo nano /etc/nginx/conf.d/edumanage.conf
```

Paste the following:
```nginx
server {
    listen 80;
    server_name your-ec2-ip-or-domain.com;

    # Serve React Static Files
    location / {
        root /var/www/edumanage;
        index index.html;
        try_files $uri $uri/ /index.html; # crucial for React Router
    }

    # Reverse Proxy /api/ requests to Spring Boot
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        
        # Increase upload limits for large Excel/Image files
        client_max_body_size 10M;
    }
}
```

Test and restart Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

Your full-stack application is now successfully deployed!
