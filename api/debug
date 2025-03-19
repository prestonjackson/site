#!/usr/bin/env python3

import io
import logging
import os
import sys

log = logging.getLogger(__name__)

def main():
  logging.basicConfig(filename="/tmp/api.log", level=logging.INFO)
  buffer = io.StringIO()

  print("Access-Control-Allow-Origin: null\n", file=buffer)
  print("Content-Type: text/html\n", file=buffer)

  print("<html><body>", file=buffer)

  print("<h1>Request Data</h1>", file=buffer)

  # Printing environment variables
  print("--Headers--", file=buffer)
  for key, value in os.environ.items():
    print(f"{key}: {value}<br/>", file=buffer)

  # Printing stdin
  print("--Body--", file=buffer)
  body = sys.stdin.read()
  print(body)

  print("</body></html>", file=buffer)

  content = buffer.getvalue()
  buffer.close()

  print(content)
  log.info(content)


if __name__ == '__main__':
  print("Hello Error!", file=sys.stderr) 
  main()

