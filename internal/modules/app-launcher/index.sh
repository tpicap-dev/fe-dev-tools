#!/bin/bash

source "./../../constants.sh"

arg="$1"

cd "$PROJECT_PATH"
mkdir -p "$PROJECT_PATH/dev-tools/extensions"
git config core.excludesFile "$DEV_TOOLS_PATH"/external/dist/.gitignore
cat "${DEV_TOOLS_PATH}"/internal/modules/app-launcher/webpack.config.template.js | sed "s#%DEV_TOOLS_PATH%#$DEV_TOOLS_PATH#" > './webpack.config.dev-tools-local.js'
npx webpack build --watch --mode development --config webpack.config.dev-tools-local.js &
if [ "$1" = "qa" ]; then
  npm run server-qa
else
  npm run server
fi
wait