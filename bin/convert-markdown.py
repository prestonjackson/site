#! /usr/bin/python3

import glob
import os
import subprocess
import urllib.parse

# Print required CGI headers
print("Content-type: text/html")
print("", flush=True)  # End of headers

args = urllib.parse.parse_qs(os.environ['QUERY_STRING'])
dir = args["dir"][0]

root = os.environ['DOCUMENT_ROOT']
filename = os.environ['REQUEST_URI']

filepath = f"{root}{filename}.md"

# If the file doesn't exist, use the latest Markdown file in the directory
if not os.path.isfile(filepath):
    filepath = sorted(glob.glob(f'{root}/{dir}/*.md'), reverse=True)[0]

subprocess.run(['cmark-gfm',
                '-t', 'html',  # Output format is HTML
                '--smart',  # Enable smart punctuation
                '--validate-utf8',
                '-e', 'footnotes',
                '-e', 'table',
                '-e', 'strikethrough',
                '-e', 'tasklist',
                filepath],
                check=True)
