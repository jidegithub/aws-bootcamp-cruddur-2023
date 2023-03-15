#!/usr/bin/env bash

change_cde (){ 
    if [ "$USER" == "codespace" ]; then 
        $REACT_APP_BACKEND_URL = "https://$CODESPACE_NAME-4567.$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN" 
    fi
}

# change_cde