ng build --prod
docker build -t alexander171294/hira-client .
docker run -p 9001 -it alexander171294/hira-client
docker push alexander171294/hira-client
