#!/usr/bin/env bash

webpack build --watch --mode development --config node_modules/dev-tools/internal/modules/app-launcher/webpack.config.js &
npm run server
wait