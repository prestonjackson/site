# Some helpful commands for debugging
curl -v -X OPTIONS -H "Origin: null" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" https://api.prestonjackson.com/api/echo
curl -v -H "Content-Type: application/json" -d '{"hello": "world" }' https://api.prestonjackson.com/api/echo
curl -v https://api.prestonjackson.com/api/echo
curl -v http://localhost/api/echo
sudo less /tmp/systemd-private-d837d0d6a62f40c29c03075596af569d-apache2.service-L0WpL1/tmp/api.log
sudo rm /tmp/systemd-private-d837d0d6a62f40c29c03075596af569d-apache2.service-L0WpL1/tmp/api.log


request:
api/v1/documents GET
headers:
  auth: token 
response:
{

}

request
api/v1/documents POST
headers:
  auth: token
{
  name: "Untitled"
}

response
{
  id: "guid"
  name: "Untitiled"
}

/data/



request:
api/v1/connections GET
response:
{

}
request:
api/vi/connections POST
{
  offer:blah
}
response:
{
  id:abcd,
  offer:blah
}

request:
api/vi/connection/{abcd} PUT
{
  id:abcd,
  ice: {offer-ice}
}

request