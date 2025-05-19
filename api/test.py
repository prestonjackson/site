import json
import os

requestdata = {'id': "abcd",
               'answer': "bcde"}

# Path to the doc metadata
path = requestdata['id'] + ".metadata"

# Start with empty metadata
metadata = {}

# Read in the metadata if we already have a file
if os.path.exists(path):
    with open(path, "r") as file:
        #try:
        metadata = json.load(file)
        print(f"read contents: {json.dumps(metadata)}")
        #except json.JSONDecodeError:
        #log.info("could not parse metadata file")

# Update the offer or answer metadata
if "offer" in requestdata.keys():
    metadata["offer"] = requestdata["offer"]
elif "answer" in requestdata.keys():
    metadata["answer"] = requestdata["answer"]

# Open file for writing with truncation (using "a+" above does not allow overwriting)
with open(path, "w") as file:
    print(f"write contents: {json.dumps(metadata)}")
    json.dump(metadata, file, indent=2, sort_keys=True)
    print(f"size = {file.tell()}")
   