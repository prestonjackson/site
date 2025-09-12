#! /usr/bin/python3

import os
import re
import urllib.parse

# Print required CGI headers
print("Content-type: text/html")
print("")  # End of headers

args = urllib.parse.parse_qs(os.environ['QUERY_STRING'])
dir = args["dir"][0]
doc_root = os.environ['DOCUMENT_ROOT']

for filename in sorted(os.listdir(f'{doc_root}/{dir}'), reverse=True):
    if filename.endswith('.md'):
        match = re.search(r'^(.+)_(.+)\.md$', filename)
        if match:
            date_part = match.group(1)
            title_part = match.group(2).replace('-', ' ').title()
            print(f"<li><a href=\"/{dir}/{filename}\">{date_part} {title_part}</a></li>")
