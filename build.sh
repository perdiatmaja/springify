echo "build ts to js"
rm -rf "./dist/js"
tsc --build "./tsconfig.builder.json"