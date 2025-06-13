#!/usr/bin/env python3

import http
import json
import logging
import os
import sys

import gateway

log = logging.getLogger(__name__)

class Signal:

    @staticmethod
    def handle_OPTIONS(request, response):
        log.info("handle_OPTIONS")
        
        ALLOWED_ORIGINS = "null"
        ALLOWED_HEADERS = "Content-Type"
        ALLOWED_METHODS = "OPTIONS, GET, POST"
        
        response.set_header("Access-Control-Allow-Origin", f"{ALLOWED_ORIGINS}")
        response.set_header("Access-Control-Allow-Headers", f"{ALLOWED_HEADERS}")
        response.set_header("Access-Control-Allow-Methods", f"{ALLOWED_METHODS}")

        response.set_status(http.HTTPStatus.NO_CONTENT)

    @staticmethod
    def handle_POST(request, response):
        log.info(f"handle_POST: {request.body}")

        requestdata = json.loads(request.body)
        log.info(f"request data: {requestdata}")
        id = requestdata["id"]
        path = request.system["DOCUMENT_ROOT"] + "/../../data/" + id + ".metadata"

        # Start with empty metadata
        metadata = {}

        # Read in the metadata if we already have a file
        if os.path.exists(path):
            with open(path, "r") as file:
                try:
                    metadata = json.load(file)
                except json.JSONDecodeError:
                    log.info("could not parse metadata file")

        # Update the offer or answer metadata
        for key in requestdata.keys():
            metadata[key] = requestdata[key]

        # Open file for writing with truncation (using "a+" above does not allow overwriting)
        with open(path, "w") as file:
            # Format the dump to reduce deltas when diffing between versions
            json.dump(metadata, file, indent=2, sort_keys=True)
        
        response.set_status(http.HTTPStatus.OK)

    @staticmethod
    def handle_GET(request, response):
        log.info("handle_GET")

        id = "abcd"
        path = request.system["DOCUMENT_ROOT"] + "/../../data/" + id + ".metadata"

        response.set_header("Access-Control-Allow-Origin", "null")
        response.set_header("Content-Type", "application/json")

        # Read in the metadata if we already have a file
        if os.path.exists(path):
            with open(path, "r") as file:
                try:
                    metadata = json.load(file)
                except json.JSONDecodeError:
                    log.info("could not parse metadata file")
            
            metadata["id"] = id
            formatted_metadata = json.dumps(metadata, indent=2, sort_keys=True)
            response.append_to_body(formatted_metadata)

        response.set_status(http.HTTPStatus.OK)

def main():
    # Should write some test code
    yield

if __name__ == '__main__':
    main()