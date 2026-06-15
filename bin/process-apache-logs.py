import re
import sys
import pathlib
import gzip 
import functools
import time
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import ProcessPoolExecutor

#import psutil

class ProfilerDecorator():
    def __init__(self, func):
        functools.update_wrapper(self, func)
        self.func = func
        #self.proc = psutil.Procese(os.getpid())


    def __call__(self, *args, **kwargs):
        #mem_before = self.proc.memory_info().rss
        #cpu_before = self.proc.cpu_times()

        wall_clock_start = time.perf_counter()
        cpu_clock_start = time.process_time()

        result = self.func(*args, **kwargs)

        cpu_clock_end = time.process_time()
        wall_clock_end = time.perf_counter()

        #cpu_after = self.proc.cpu_times()
        #mem_after = self.proc.memory_info().rss
        
        cpu_diff = cpu_clock_end - cpu_clock_start
        wall_clock_diff = wall_clock_end - wall_clock_start
       
        #mem_diff = (mem_after - mem_before) * (1024 * 1024)
        #user_time = cpu_after.user - cpu_before.user
        #sys_time = cpu_after.system - cpu_before.system

        print(f"process time: {cpu_diff:.3f} s")
        print(f"wall clock time: {wall_clock_diff:.3f} s")
        #print(f"memory diff: {mem_diff:.3f} MB")
        #print(f"user time: {user_time:.3f} s")
        #print(f"sys time: {sys_time:.3f} s")
        return result

class ProfilerManager():
    def __enter__(self):
        self.start_wall_clock = time.perf_counter()
        self.start_cpu_timer = time.process_time()

    def __exit__(self, exc_type, exc_value, traceback):
        end_wall_clock = time.perf_counter()
        end_cpu_timer = time.process_time()

        wall_clock_diff = end_wall_clock - self.start_wall_clock
        cpu_timer_diff = end_cpu_timer - self.start_cpu_timer

        print(f"process time: {cpu_timer_diff:.3f} s")
        print(f"wall clock time: {wall_clock_diff:.3f} s")

        if exc_type is not None:
            print(f"Exception occurred: {exc_type}: {exc_value}")
            return True
        return True


def logNameGenerator(log_dir, log_prefix):
    for path in pathlib.Path(log_dir).glob(f"*{log_prefix}.access*"):
        yield path

def logLineGenerator(path):
    if path.suffix == ".gz":
        with gzip.open(path, 'rt') as f:
            for line in f:
                yield line
    elif path.suffix == ".log":
        with open(path) as f:
            for line in f:
                yield line

    for path in pathlib.Path(log_dir).glob(f"*{log_prefix}.access*"):
        #print(f"{path}")

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
      
def processLogs(log_path):

    log_lines = logLineGenerator(log_path)

    LOG_PATTERN = re.compile(r'^(?P<ip>\S+) (?P<identity>\S+) (?P<user>\S+) \[(?P<time>.*?)\] "(?P<request>.*?)" (?P<status>\d+) (?P<bytes>\S+) "(?P<referer>.*?)" "(?P<user_agent>.*?)"$')

    requests = {}

    for i, line in enumerate(log_lines):
        #print(f"{i}: {line}")
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

        raise ValueError("test exception")

    return requests

@ProfilerDecorator
def processLogsSingleThreaded(log_dir, log_prefix):
    results = []
    for log_path in logNameGenerator(log_dir, log_prefix):
        results.append(processLogs(log_path))

    return results
    

@ProfilerDecorator
def processLogsThreaded(log_dir, log_prefix):
    requests = {}
    with ThreadPoolExecutor() as executor:
        log_paths = logNameGenerator(log_dir, log_prefix)
        results = list(executor.map(processLogs, log_paths))

    return results

@ProfilerDecorator
def processLogsMultiprocessed(log_dir, log_prefix):
    requests = {}
    with ProcessPoolExecutor() as executor:
        log_paths = logNameGenerator(log_dir, log_prefix)
        results = list(executor.map(processLogs, log_paths))

    return results 

if (__name__ == "__main__"):
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <log_prefix>")
        sys.exit(1)

    log_dir = "/Users/parents/Developer/log/apache2"
    log_prefix = sys.argv[1]
    
    with ProfilerManager() as p:
        print("Processing logs single-threaded...")
        try:
            requests1 = processLogsSingleThreaded(log_dir, log_prefix)
        except Exception as e:
            print(f"Caught exception during single-threaded processing: {e}")
            sys.exit(1)[

    #with ProfilerManager() as p:
    #    requests2 = processLogsThreaded(log_dir, log_prefix)
    
    #with ProfilerManager() as p:
    #    requests3 = processLogsMultiprocessed(log_dir, log_prefix)

    for i, (requester, n) in enumerate(requests1.items()):
        print(f"{i}: {requester} -> {n}") 

