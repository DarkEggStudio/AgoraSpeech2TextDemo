# Add pbjs path
export "PATH=$PATH:{Project path}/node_modules/protobufjs-cli/bin"
# gen javascript code
pbjs -t json-module  -w es6 ./SttMessage.proto > ./SttMessage_es6.js
