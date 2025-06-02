#!/bin/sh
source .env

status() {
    printf "\n=====================================================\n"
    printf "%s\n" "$1"
    printf -- "-----------------------------------------------------\n"
}

printf "\n!!!!!!!!!!!!!!!!!!!!!!!\n"
printf "Note you will need to run this script once to post a new business, and then copy the id -\n"
printf "to paste into the POST photos, as well as the GET business:id. Run again -\n"
printf "And then copy and paste the resulting photo id into GET photos:id\n"
printf "!!!!!!!!!!!!!!!!!!!!!!!\n\n"

status 'POST businesses succeeds'
curl -X POST http://localhost:$PORT/businesses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Business",
    "address": "123 Main St",
    "city": "Portland",
    "state": "OR",
    "zip": "97201",
    "category": "Retail",
    "subcategory": "Clothing",
    "website": "https://testbusiness.com",
    "email": "info@testbusiness.com"
  }'


# Change businessId to match previously created business
status 'POST photos succeeds'
curl -X POST http://localhost:$PORT/photos \
  -F "file=@test.png" \
  -F 'businessId=683df138a9b1f74a58046c20' \
  -F 'caption=Ice crem'

status 'POST photos fails with incorrect file type'
curl -X POST http://localhost:$PORT/photos \
  -F "file=@test.txt" \
  -F 'businessId=2' \
  -F 'caption=Fried rice'

# Change id to match previously created photo
status 'GET photo/:id succeeds'
curl http://localhost:$PORT/photos/683df1c1a9b1f74a58046c2a

# Change businessId to match previously created business
status 'GET businesses/:id succeeds'
curl -H "$auth" http://localhost:$PORT/businesses/683df138a9b1f74a58046c20