#!/usr/bin/env bash

unset REACT_APP_BACKEND_URL
change_cde (){ 
    if [ "$USER" == "codespace" ]; then
        echo "werepe!!" 
        export REACT_APP_BACKEND_URL=https://$CODESPACE_NAME-4567.$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
    fi
}

change_cde