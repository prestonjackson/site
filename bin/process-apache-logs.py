import re
import sys
import pathlib
import gzip 

def logGenerator(log_dir, log_prefix):
    for path in pathlib.Path(log_dir).glob(f"*{log_prefix}.access*"):
        print(f"{path}")

        if path.suffix == ".gz":
            with gzip.open(path, 'rt') as f:
                for line in f:
                    yield line
        elif path.suffix == ".log":
            with open(path) as f:
                for line in f:
                    yield line
      


def processLogs(log_dir, log_prefix):

    log_lines = logGenerator(log_dir, log_prefix)

    LOG_PATTERN = re.compile(r'^(?P<ip>\S+) (?P<identity>\S+) (?P<user>\S+) \[(?P<time>.*?)\] "(?P<request>.*?)" (?P<status>\d+) (?P<bytes>\S+) "(?P<referer>.*?)" "(?P<user_agent>.*?)"$')

    requests = {}

    for i, line in enumerate(log_lines):
        print(f"{i}: {line}")
        match = LOG_PATTERN.match(line)
        if match:
            data = match.groupdict()

            ip = data['ip']
            identity = data ['identity']
            user = data['user']
            time = data['time']
            request = data['request']
            status = data['status']
            size = data['bytes']
            referrer = data['referer']
            user_agent = data['user_agent']

            requests[ip] = requests.get(ip, 0) + 1
        else:
            requests["none"] = requests.get("none", 0) + 1

    for i, (requester, n) in enumerate(requests.items()):
        print(f"{i}: {requester} -> {n}") 

if (__name__ == "__main__"):
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <log_prefix>")
        sys.exit(1)
    
    log_dir = "/Users/parents/Developer/log/apache2"
    log_prefix = sys.argv[1]

    processLogs(log_dir, log_prefix)
