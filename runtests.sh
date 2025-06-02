#!/bin/sh
source .env

status() {
    printf "\n=====================================================\n"
    printf "%s\n" "$1"
    printf -- "-----------------------------------------------------\n"
}


# status 'POST photos succeeds'
# curl -X POST http://localhost:$PORT/photos \
#   -F "file=@test.png" \
#   -F 'businessId=683bb3c2e262e2b242506f30' \
#   -F 'caption=Ice crem'

# status 'POST photos fails with incorrect file type'
# curl -X POST http://localhost:$PORT/photos \
#   -F "file=@test.txt" \
#   -F 'businessId=2' \
#   -F 'caption=Fried rice'

status 'GET photo/:id succeeds'
curl http://localhost:$PORT/photos/683d127a0df33323089eabfe

status 'GET businesses/:id succeeds'
curl -H "$auth" http://localhost:$PORT/businesses/683d127a0df33323089eabfe
