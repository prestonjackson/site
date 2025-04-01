import sys

class Request(object):
    def __init__(self, env, body):
        self.method = env["REQUEST_METHOD"]
        self.protocol = env["SERVER_PROTOCOL"]
        self.uri = env["REQUEST_URI"]
        self.headers = {}
        self.env = {}
        for key, value in context.items():
            if key not in ["REQUEST_METHOD", "SERVER_PROTOCOL", "REQUEST_URI"] \
                # Strip off HTTP_, convert to standard HTTP header names
                header_name = key[5:].lower().title().replace('_', '-')
                self.headers[header_name] = value
         
            else:
                # Collect other env vars
                self.env[key] =  value
    
        self.body = sys.stdin.read()

class Response(object):
    def __init__(self):
        self.headers = {}
        self.cookies = {}
        self.body = ""
        self.status = 0
    


