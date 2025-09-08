
# Install required software by installing Xcode Command Line Tools
# This includes git, python3. This is a one-time install.
# xcode-select --install

# Install cmark-gfm
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
/usr/local/bin/brew install cmark-gfm

# Apache is installed by default
#
# Modify /etc/apache2/httpd.conf
#
# Uncomment the following lines:
# 113 LoadModule include_module libexec/apache2/mod_include.so
#
# 174         LoadModule cgi_module libexec/apache2/mod_cgi.so
#

# Download the website from github.com
sudo mkdir -p /Library/WebServer/prestonjackson.com
sudo chown -R $USER:$(id -gn) /Library/WebServer/prestonjackson.com
cd /Library/WebServer/prestonjackson.com
git clone https://github.com/prestonjackson/site.git

# Follow instructions in /Library/WebServer/prestonjackson.com/site/config/apache2/prestonjackson.com.conf

# Test syntax of the config and bounce Apache2
sudo apachectl configtest
sudo sudo launchctl load -w /System/Library/LaunchDaemons/org.apache.httpd.plist

# Later use this to bounce Apache2
sudo apachectl graceful

# Make the data dir
sudo mkdir -p /var/www/prestonjackson.com/site/data
sudo chown -R $USER:$USER /var/www/prestonjackson.com/site/data
