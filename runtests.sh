#!/bin/sh
source .env

status() {
    printf "\n=====================================================\n"
    printf "%s\n" "$1"
    printf -- "-----------------------------------------------------\n"
}


status 'POST photos succeeds'
curl -X POST http://localhost:$PORT/photos \
  -F "file=@test.png" \
  -F 'businessId=1' \
  -F 'caption=Ice crem'

status 'POST photos fails with incorrect file type'
curl -X POST http://localhost:$PORT/photos \
  -F "file=@test.txt" \
  -F 'businessId=2' \
  -F 'caption=Fried rice'

# status 'GET businesses/:id succeeds'
# curl -H "$auth" http://localhost:$PORT/businesses/68326ec2bf093aad19bd4f9c
