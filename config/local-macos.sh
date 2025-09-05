# Apache is installed by default

# Install required software by installing Xcode Command Line Tools
# This includes git, python3. This is a one-time install.
# xcode-select --install

# Modify /etc/apache2/httpd.conf
#
# Uncomment the following lines:
# 113 LoadModule include_module libexec/apache2/mod_include.so
#
# 174         LoadModule cgi_module libexec/apache2/mod_cgi.so
#
# Add this line right before "Include /private/etc/apache2/other/*.conf"
# Define SITE_ROOT /Library/Webserver

# Download the website from github.com
sudo mkdir -p /Library/WebServer/prestonjackson.com
sudo chown -R $USER:$(id -gn) /Library/WebServer/prestonjackson.com
cd /Library/WebServer/prestonjackson.com
git clone https://github.com/prestonjackson/site.git

# Add the configuration for the site
sudo ln -s /Library/WebServer/prestonjackson.com/site/config/apache2/sites-available/prestonjackson.com.conf /etc/apache2/other/prestonjackson.com.conf

# Test syntax of the config and bounce Apache2
sudo apachectl configtest
sudo sudo launchctl load -w /System/Library/LaunchDaemons/org.apache.httpd.plist

# Later use this to bounce Apache2
sudo apachectl graceful

# Make the data dir
sudo mkdir -p /var/www/prestonjackson.com/site/data
sudo chown -R $USER:$USER /var/www/prestonjackson.com/site/data
