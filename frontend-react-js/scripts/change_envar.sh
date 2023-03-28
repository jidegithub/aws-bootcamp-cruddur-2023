#!/usr/bin/env bash

change_cde(){ 
    if [ "$USERNAME" == "" ]; then
        echo "werepe!!" 
        # export REACT_APP_BACKEND_URL=https://$CODESPACE_NAME-4567.$GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN
        export REACT_APP_BACKEND_URL="https://magento.com/userprofile/373husu2r37hf2uhu2feq2f"
    fi
}
change_cde
































# echo $APPEND >>~/.bashrc  ~/.zshrc
echo $REACT_APP_BACKEND_URL >>~/.zshrc
# source ~/.zshrc