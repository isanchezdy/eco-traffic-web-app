# Eco-Traffic Web APP
This is my Software Engineer Degree thesis for Escuela Politécnica de Cáceres, and it is also a direct contribution for the Eco-Traffic APP National Project. It consists of a Web APP that can be used to request routes in a map selecting the source and destination points, retrieving the best ones based on distance, travel time and fuel consumption.

## File structure
This component contains volume folders for some containers and a Flask Python Web Project:
- **congestion_data**: it stores the XLSX congestion files retrieved by the "GoogleTraffic" library. 
- **eco_traffic_web_app**: it contains the main Python project to execute.
- **neo4j**: it is the volume for the neo4j container.
- **openrouteservice**: it is the volume for the openrouteservice container.
- **opentopodata-master**: it is the volume for the opentopodata container.
- **docker-compose.yml**: it is a file that allows deploying the architecture.

## Deployment
Before deploying, it is necessary to add the file **spain-latest.osm.pbf** inside the openrouteservice folder. The file can be obtained from [Geofabrik](https://download.geofabrik.de/europe/spain-latest.osm.pbf).

The architecture can be deployed on the main folder using:

~~~
docker compose up
~~~

## Execution command
After deploying the architecture, we can execute the following command, on the "eco_traffic_web_app" 
folder:
~~~
python main.py
~~~