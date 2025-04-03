# Apache is installed by default

# Install required software by installing Xcode Command Line Tools
# This includes git, python3. This is a one-time install.
# xcode-select --install

# Enable required modules in Apache2
# Modify /etc/apache2/httpd.conf
# Uncomment the following lines:
#
# 174         LoadModule cgi_module libexec/apache2/mod_cgi.so
#
# 231 ServerName localhost:80
#
# 255 DocumentRoot "/Library/WebServer/prestonjackson.com/site/doc"
# 256 <Directory "/Library/WebServer/prestonjackson.com/site/doc">
#
# Comment this out out:
# 383     #ScriptAliasMatch ^/cgi-bin/((?!(?i:webobjects)).*$) "/Library/WebServer/CGI-Executables/$1"
# new     ScriptAlais /api/ /Library/WebServer/prestonjackson.com/site/api/
#
# 399 <Directory "/Library/WebServer/prestonjackson.com/site/api">
# 400     AllowOverride None
# 401     Options ExecCGI
# new     AddHandler cgi-script
# 402     Require all granted
# 403 </Directory>
#
# 557 AddDefaultCharset UTF-8


# Download the website from github.com
sudo mkdir -p /Library/WebServer/prestonjackson.com
sudo chown -R $USER:$(id -gn) /Library/WebServer/prestonjackson.com
cd /Library/WebServer/prestonjackson.com
git clone https://github.com/prestonjackson/site.git

# Test syntax of the config and bounce Apache2
sudo apachectl configtest
sudo sudo launchctl load -w /System/Library/LaunchDaemons/org.apache.httpd.plist

# Later use this to bounce Apache2
sudo apachectl graceful

# Make the data dir
sudo mkdir -p /var/www/prestonjackson.com/site/data
sudo chown -R $USER:$USER /var/www/prestonjackson.com/site/data
