#!/bin/sh

./protoc-21.12-osx-aarch_64/bin/protoc \
--java_out=$(pwd)/code/java \
--objc_out=$(pwd)/code/objective-c \
--csharp_out=$(pwd)/code/csharp \
./SttMessage.proto
#-I$(pwd) SttMessage.proto

echo "gen code finished."
