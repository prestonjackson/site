#! /usr/bin/python3

import os
import re
import urllib.parse

# Print required CGI headers
print("Content-type: text/html")
print("", flush=True)  # End of headers

args = urllib.parse.parse_qs(os.environ['QUERY_STRING'])
dir = args["dir"][0]

root = os.environ['DOCUMENT_ROOT']

for filename in sorted(os.listdir(f'{root}/{dir}'), reverse=True):
    if filename.endswith('.md'):
        match = re.search(r'^(.+)_(.+)\.md$', filename)
        if match:
            date_part = match.group(1)
            basename = os.path.splitext(filename)[0]
            title_part = match.group(2).replace('-', ' ').title()
            print(f"<li>{date_part} <a href=\"/{dir}/{basename}\">{title_part}</a></li>")
