#!/bin/bash

print_tree() {
    local dir="$1"
    local indent="${2:-0}"

    for file in "${dir}"/*; do
        # Check if the current file/directory is in the .gitignore
        if [[ -f "${dir}/.gitignore" ]] && grep -q "$(basename "${file}")" "${dir}/.gitignore"; then
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

