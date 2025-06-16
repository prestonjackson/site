#!/usr/bin/env python3

import http
import logging
import os
import sys

import gateway

log = logging.getLogger(__name__)


def handle_OPTIONS(request, response):
    log.info("handle_OPTIONS")
    ALLOWED_ORIGINS = "null"
    ALLOWED_HEADERS = "Content-Type"
    ALLOWED_METHODS = "OPTIONS, GET, POST"
    
    response.header("Access-Control-Allow-Origin", f"{ALLOWED_ORIGINS}")
    response.header("Access-Control-Allow-Headers", f"{ALLOWED_HEADERS}")
    response.header("Access-Control-Allow-Methods", f"{ALLOWED_METHODS}")

    response.set_status(http.HTTPStatus.NO_CONTENT)


def handle_POST(request, response):
    log.info("handle_POST")
    response.set_status(http.HTTPStatus.OK)


def handle_GET(request, response):
    log.info("handle_GET")
    response.set_header("Access-Control-Allow-Origin", "null")
    response.set_header("Content-Type", "text/html")

    response.append_to_body("<html><body><pre><code>")
    response.append_to_body(request.body)
    response.append_to_body("</code></pre></body></html>")

    response.set_status(http.HTTPStatus.OK)


def main():
    logging.basicConfig(filename="/tmp/api.log", level=logging.INFO)
    log.info("==========NEW REQUEST==========")   
    
    request = gateway.ApacheRequest(os.environ, sys.stdin.read())
    log.info(request)

    response = gateway.ApacheResponse()

    if request.method == "OPTIONS":
        handle_OPTIONS(request, response)
    elif request.method == "GET":
        handle_GET(request, response)
    elif request.method == "POST":
        handle_POST(request, response)
    else:
        log.info(f"Method: {request.method} not found")

    raw_response = response.flush()
    log.info(raw_response)


if __name__ == '__main__':
    main()

