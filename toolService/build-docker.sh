docker build -t alexander171294/hira-client:tools .
docker run -p 3030:3030 -it alexander171294/hira-client:tools
docker push alexander171294/hira-client:tools
