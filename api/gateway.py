import http
import io

def _parse_apache_environment(env):
    method = http.HTTPMethod[env["REQUEST_METHOD"]]
    protocol = env["SERVER_PROTOCOL"]
    uri = env["REQUEST_URI"]
        
    headers = {}
    system = {}
    for key, value in env.items():
        if key not in ["REQUEST_METHOD", "SERVER_PROTOCOL", "REQUEST_URI"] \
            and key.startswith("HTTP_"):
            # Strip off HTTP_, convert to standard HTTP header names
            header_name = key[5:].lower().title().replace('_', '-')
            headers[header_name] = value
         
        else:
            # Collect other env vars
            system[key] =  value
        
    return (method, protocol, uri, headers, system)


class ApacheRequest(object):
    def __init__(self, env, body):
        (method, protocol, uri, headers, system) = _parse_apache_environment(env)
        self.method = method
        self.protocol = protocol
        self.uri = uri
        self.headers = headers
        self.system = system
        self.body = body    
  
    
    def __str__(self):
        buffer = io.StringIO()
        buffer.write(f"{self.method} {self.uri} {self.protocol}\n")
        buffer.write("-----HEADERS-----\n")
        for key, value in self.headers.items():
            buffer.write(f"{key}: {value}\n")

        buffer.write("-----SYSTEM------\n")
        for key, value in self.system.items():
            buffer.write(f"{key}: {value}\n")

        buffer.write("-----BODY-----\n")
        buffer.write(f"{self.body}\n")

        buffer_value = buffer.getvalue()
        buffer.close()
        return buffer_value



def _send_apache_response(response):
    print(response)

class ApacheResponse(object):
    def __init__(self):
        self.headers = {}
        self.cookies = {}
        self.body = []
        self.status = http.HTTPStatus.NOT_IMPLEMENTED

 
    def set_status(self, status):
        self.status = status
     

    def append_to_body(self, message):
        self.body.append(message)


    def set_header(self, name, value):
        self.headers[name] = value


    def flush(self):
        buffer = io.StringIO()
        buffer.write(f"Status: {self.status.value} {self.status.phrase}\n")
        for key,value in self.headers.items():
            buffer.write(f"{key}: {value}\n")
        
        # HTTP specification requires an empty line between headers and body
        for line in self.body:
            buffer.write("\n")
            buffer.write(f"{line}")
        
        buffer_value = buffer.getvalue()
        buffer.close()

        # Apache uses stdout as the response.
        _send_apache_response(buffer_value)

        return buffer_value



