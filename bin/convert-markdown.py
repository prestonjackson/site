#! /usr/bin/python3

import os
import subprocess

# Print required CGI headers
print("Content-type: text/html")
print("", flush=True)  # End of headers

root = os.environ['DOCUMENT_ROOT']
request = os.environ['REQUEST_URI']

subprocess.run(['cmark-gfm',
                '-t', 'html',
                '--smart',
                '--validate-utf8',
                '-e', 'footnotes',
                '-e', 'table',
                '-e', 'strikethrough',
                '-e', 'tasklist',
                f"{root}{request}"], check=True)
