ng build --prod
docker build -t alexander171294/hira-client:core-v2 .
# docker run -p 9001:80 -it alexander171294/hira-client
docker push alexander171294/hira-client:core-v2
