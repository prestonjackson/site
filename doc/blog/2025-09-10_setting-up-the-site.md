# Setting up the Site

## Guiding Principles

* Build simply. Start with the basics. Use stock sofware, only install software when it hurts me or the reader
* Learn existing web technologies deeply. Don't prevent learning the fundamentals (like HTML, JavaScript, and CSS) by masking them in a framework prematurely
* Keep it cheap. This is a hobby. This is for learning. 

## Co-Developing

I develop on my trusty MacBook Pro (Retina, 13-inch, Early-2015). Yes, the battery life is down to two hours. Yes, the rubber feet are missing. And yes, the system software is stuck at macOS Monterey (last updated in July of 2024). But I love this machine, and even if it is past its pull date, it still does the job.

What is great is this MacBook comes pre-installed with Apache2, making it simple to develop locally, then move the configuration to my cloud server. The Xcode command line tools also provide a similar installation to the machine I'll be developing on.

For the coding editor: Vim on the server, and Visual Studio Code locally. I've fussed about enough with Vim to know it is cool and useful, but Visual Studio Code welcomes me back each time I've been away with its easy inteface, mouse support, and visual integration with Git and the filesystem.

For source control, I'm using Git. It's the most pervasive distributed version control system, has excellent documentation, a huge following, integration into GitHub, and a really cumbersome UX. However, it just works. And after manually editing CVS files, restoring corrupted SVN databases, and paying Perforce fees, the killer features for me are "it works" and "it's free."

Required Software: Visual Studio Code, Xcode Command Line Tools, Vim, Git

## Settig up on GCP

This is a personal project. I don't expect a lot of traffic for the site, but if there ever is, it can be rehosted somewhere more exotic. Until then, I will need the mimimum set of features for a legitimatey hosted side. It needs:

* Static IP for stable DNS entries
* Offsite hosting with hardware redundancy
* Lock-down to three ports: 22-ssh, 80-http, 443-https

The prestonjackson.com mail and calendar are already hosted on GCP. It makes sense to just consolidate my expertise in my existing cloud provider. Amazon, Azure, or Digital Ocean all would be fine.  

The cheapest virtual machine on GCP is the e2-micro. The installation of Debian was simple, and with the built in Apache, I was able to get an HTTP website running quickly.

Required Software: Debian, Apache2

## Getting the Domain

I finally splurged and purchased my vanity domain. It was parked on [sedo.com](https://sedo.com). After making the payment, the directions provided in the online-chat were clear enough, but not simple. It took a few days for the payment and domain to transfer successfully and for me to configure. In the end everything worked out fine.

Once the DNS mappings were complete, I was able to finally display a simple webpage from my server, visible on the web!

But Chrome was not happy. It warned me that the site was unsafe, that it was not hosted on a website that encrypted traffice between client and server via HTTPS.

Required Software: Chrome

## Serving via HTTPS

Getting an TLS certificate signed by a root authority that is recognized by Chrome turns out to be expensive, except for a free, non-profit solution provided by [Let's Encrypt](https://letsencrypt.org/). This service will

* generate a TLS certificate, signed by a Chrome-recognized root authority for free,
* sets up automated refresh of the certificate via cron
* modifies the Apache configuration to support HTTPS
* be supported by a legitimate sounding (and sponsored by Google and Mozilla) organization, the [Internet Security Research Group](https://www.abetterinternet.org/)

To get this working we needed to install certbot, which required its own package manager, snap. But certbot takes care of the installation, configuraiton, and automation of the certificate, Apache, and cron. It's worth the installation.

Required Software: Snap, Certbot

## Generating Web Content

Apache does a lot for me out of the box. It provides:

* server-side includes, to replace common HTML fragments (e.g. headers and footers)
* provides command execution via CGI
* and rewrites URLs to make the external face prettier than the internal implementation

However, HTML is still pretty verbose, and it would be great to author content in a format that is simpler to write and feels less cluttered. [Markdown](https://markdownguide.org) provides enough expressiveness for my web content (i.e. my blog and my research review) and has a simple syntax. I decided to include another dependency on the GitHub parser/generator callsed [cmark-gfm](https://github.com/github/cmark-gfm).

In order to inject the Markdown-converted-to-HTML into each webpage, we need to some serverside processing. It is insecure to execute commands on the server based on data entered by the user, and URLs are essentially data from the user. Instead, we provide a few convienice scripts, written in python, to generate the web-paged based on HTML template files and the markdown-formatted content.

Required Software: Python, cmark-gfm

## Conclusion

This represents what I consider the minimal set of software I can use in order to serve a reasonable website. I'm not using anything beyond the stock installs of the tools listed above, but I do use the standard modules for Apache and libraries in Python. 
