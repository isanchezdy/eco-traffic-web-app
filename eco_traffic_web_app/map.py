from flask import Blueprint, render_template, request
from eco_traffic_app_engine.engine.eco_traffic_engine import EcoTrafficEngine
from eco_traffic_app_engine.others.utils import remove_files
from eco_traffic_app_engine.routing.osrm import OSRM
from eco_traffic_app_engine.routing.ors import OpenRouteService
from eco_traffic_app_engine.routing.graphhopper import GraphHopper
from eco_traffic_app_engine.static.constants import CONGESTION_DATA_DIR

import os

map = Blueprint('map', __name__)

# The route for the map is enabled for both get and post methods
@map.route('/map/', methods=('GET', 'POST'))
def index():
    graph_routes = []

    # Processing when form is sent
    if request.method == 'POST':
        # Get points from request
        coords = [[float(i) for i in request.form['origin'].split(',')], [float(i) for i in request.form['destination'].split(',')]]
        osrm = OSRM(params={ "alternatives": 3, "geometries": "geojson", "annotations": "nodes" })

        # Iniciate all router services
        graphHopper = GraphHopper({ "profile": "car", "point": [f"{coord[0]},{coord[1]}" for coord in coords], 
                                   "points_encoded": "false", "algorithm": "alternative_route", "alternative_route.max_share_factor": 0.8,
                                   "alternative_route.max_paths":5,"alternative_route.max_weight_factor":3.0, "key": os.environ.get("GRAPHHOPPER_API_KEY")})
        ors = OpenRouteService({"share_factor": 0.8,"target_count":10,"weight_factor":3.0})

        routing = int(request.form['routing'])

        # Flag to check when to activate filter
        filter = False

        # Check selected router
        if routing == 1:
            routes = ors.get_routes(coords, True)
        elif routing == 2:
            routes = graphHopper.get_routes()
        else:
            routes = osrm.get_routes(coords)
            filter = True

        # Start Eco-Traffic Engine with the given routes
        engine = EcoTrafficEngine(routes)

        # Process the routes
        engine.process_routes(filter)

        # Request, process and store congestion data
        engine.process_congestion_data()

        # Once data is processed, remove congestion data
        remove_files(CONGESTION_DATA_DIR)

        # Extend missing information on graph (maximum speed, number of lanes, ...)
        engine.extend_graph_info()

        ors.params = None

        # Get routes from graph
        graph_routes = engine.get_optimal_routes(coords, ors)

    # The page is loaded using the templates
    return render_template('map.html.j2', graph_routes=graph_routes)