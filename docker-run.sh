#!/usr/bin/env bash
set -e

BOT=$1


docker run \
  -it --rm \
  --name doraemon \
  --mount type=bind,source="$(pwd)",target=/bot \
  zixia/wechaty \
  "$BOT"
