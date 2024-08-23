#!/bin/bash
set -eu

script_dir=$(cd $(dirname $0); pwd)
project_dir=$(cd ${script_dir}/..; pwd)

cd ${project_dir}

gcloud builds submit --config cloudbuild.yaml .
gcloud run services set-iam-policy ${_SERVICE} policy.yaml --quiet
