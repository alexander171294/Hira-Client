cd ../hiraClient
ng build --output-path ../electron/www --configuration electron --base-href .
cd ../electron
npm run dist -w --x64