#!/bin/bash
set -eu

script_dir=$(cd $(dirname $0); pwd)
project_dir=$(cd ${script_dir}/..; pwd)

cd ${project_dir}

export PROJECT_ID=urth-toy  # プロジェクトIDに書き換える
export REGION=asia-northeast1
export SERVICE_NAME=cloudrun-voicevox
export CONTAINER_PORT=3000

envsubst < service.yaml.template > service.yaml
