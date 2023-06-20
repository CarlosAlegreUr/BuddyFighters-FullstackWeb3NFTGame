#!/bin/bash

# Array of directories to ignore
declare -a ignore_dirs=(
    ".gitignore"
    "node_modules"
    "artifacts"
    "cache"
    "deployments"
)

print_tree() {
    local dir="$1"
    local indent="${2:-0}"

    for file in "${dir}"/*; do
        # Check if the current file/directory should be ignored
        local filename="$(basename "${file}")"
        if [[ "${ignore_dirs[*]}" =~ "${filename}" ]]; then
            continue
        fi

        if [ -d "${file}" ]; then
            printf "%*s- %s\n" $((indent * 2)) '' "$(basename "${file}")"
            print_tree "${file}" $((indent + 1))
        else
            printf "%*s- %s\n" $((indent * 2)) '' "$(basename "${file}")"
        fi
    done
}

print_tree .
