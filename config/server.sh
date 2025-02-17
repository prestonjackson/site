# Create a new project in GCP (if necessary)
# Create a new VM e2-micro, Debian, SSD persistent disk, HTTP and HTTPS
# Update DNS records at squarespace to point to static IP of server

# Update apt-get database and installed software. Be patient, it takes forever.
sudo apt-get update
sudo apt-get upgrade
sudo apt-get autoremove

# Install required software
sudo apt-get install git
# These are installed on the default image
# sudo apt-get install apache2
# sudo apt-get install python3

# Enable required modules in Apache2
sudo a2enmod ssl
sudo a2enmod cgi

# Download the website from github.com
sudo mkdir -p /var/www/prestonjackson.com
sudo chown -R $USER:$USER /var/www/prestonjackson.com
cd /var/www/prestonjackson.com
git clone https://github.com/prestonjackson/site.git
sudo cp site/config/sites-enabled/prestonjackson.com.conf /etc/apache2/sites-enabled/prestonjackson.com.conf
# Enable CGI support in Apache2
sudo cp site/config/apache2/conf-enabled/serve-cgi-bin.conf /etc/apache2/conf-enabled/serve-cgi-bin.conf
# Enable UTF-8 support in Apache2
sudo cp site/config/apache2/conf-enabled/charset.conf /etc/apache2/conf-enabled/charset.conf


# Enable the site and disable the default site
sudo a2ensite prestonjackson.com.conf
sudo a2dissite 000-default.conf

# Bounce apache to pick up changes
# sudo systemctl status apache2
sudo systemctl restart apache2

# Set up the SSL/TLS certificate management with certbot, including refresh cron
# Ref: https://certbot.eff.org/instructions?ws=apache&os=snap&tab=standard
# Notes: Creates sites-enabled/prestonjackson.com-le-ssl.conf automatically
sudo apt-get install snapd  # Yes, a package manager for one package
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot  # Classic mode lets snap read/write files
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --apache
#systemctl list-timers  # This is where the cron is installed

# Test syntax of the config and bounce Apache2
sudo apache2ctl configtest
sudo systemctl restart apache2

