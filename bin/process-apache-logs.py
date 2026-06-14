import re
import sys
import pathlib
import gzip
import datetime

def logGenerator(log_dir, log_prefix, src=None, start=None, end=None, status=None):
    print(locals())

    for path in pathlib.Path(log_dir).glob(f"*{log_prefix}.access*"):

        if path.suffix == ".gz":
            # Temporarily just keep things moving, don't worry about tgzs for now.
            continue
            with gzip.open(path, 'rt') as f:
                for line in f:
                    yield line

        elif path.suffix == ".log":
            with open(path) as f:
                for line in f:
                    parts = line.split(" ")
                    
                    if len(parts) == 1 and parts[0] == '\n':
                        continue
                    
                    # Src
                    if src:
                        src_val = parts[0]

                    if start and end:
                        date_format = "%d/%b/%Y:%H:%M:%S %z"
                        raw_datetime = (parts[3] + " " + parts[4])[1:-1]
                        time = datetime.datetime.strptime(raw_datetime, date_format)
                        start_time = datetime.datetime.strptime(start, date_format)
                        end_time = datetime.datetime.strptime(end, date_format)

                    if status:
                        status_val = parts[7]
                        print(f"{status_val=}")

                    if ((not src or src == src_val) and
                        ((not start or not end) or (time > start_time and time < end_time)) and
                        ((not status or status == status_val))):
                        yield line
      


def processLogs(log_dir, log_prefix, filters):

    log_lines = logGenerator(log_dir, log_prefix, **filters)

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

    #for i, (requester, n) in enumerate(requests.items()):
    #    print(f"{i}: {requester} -> {n}") 

if (__name__ == "__main__"):
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <log_prefix>")
        sys.exit(1)

    filters = {
        "src": "179.43.146.226",
        "start": "20/Apr/2026:04:52:09 +0000",
        #"end": "20/Apr/2026:04:52:11 +0000",
        "status": "200"
    }
    
    log_dir = "/Users/parents/Developer/log/apache2"
    log_prefix = sys.argv[1]

    processLogs(log_dir, log_prefix, filters)
