#!/bin/sh
source .env

status() {
    printf "\n=====================================================\n"
    printf "%s\n" "$1"
    printf -- "-----------------------------------------------------\n"
}

# status 'POST businesses succeeds'
# curl -X POST http://localhost:$PORT/businesses \
#   -H "Content-Type: application/json" \
#   -d '{
#     "name": "Test Business",
#     "address": "123 Main St",
#     "city": "Portland",
#     "state": "OR",
#     "zip": "97201",
#     "category": "Retail",
#     "subcategory": "Clothing",
#     "website": "https://testbusiness.com",
#     "email": "info@testbusiness.com"
#   }'

# status 'POST photos succeeds'
# curl -X POST http://localhost:$PORT/photos \
#   -F "file=@test.png" \
#   -F 'businessId=683df138a9b1f74a58046c20' \
#   -F 'caption=Ice crem'

# status 'POST photos fails with incorrect file type'
# curl -X POST http://localhost:$PORT/photos \
#   -F "file=@test.txt" \
#   -F 'businessId=2' \
#   -F 'caption=Fried rice'

status 'GET photo/:id succeeds'
curl http://localhost:$PORT/photos/683df1c1a9b1f74a58046c2a

status 'GET businesses/:id succeeds'
curl -H "$auth" http://localhost:$PORT/businesses/683df138a9b1f74a58046c20