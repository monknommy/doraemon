#!/usr/bin/env bash
set -e

docker run \
  -it --rm \
  --name doraemon \
  --mount type=bind,source="$(pwd)",target=/bot \
  --mount type=bind,source="$(pwd)",target=/wechaty/bot \
  zixia/wechaty \
  bash
