#!/bin/sh
source .env

status() {
    printf "\n=====================================================\n"
    printf "%s\n" "$1"
    printf -- "-----------------------------------------------------\n"
}


status 'GET businesses/:id succeeds'
curl -H "$auth" http://localhost:$PORT/businesses/68326ec2bf093aad19bd4f9c

