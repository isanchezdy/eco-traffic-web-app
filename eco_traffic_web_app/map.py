from flask import Blueprint, render_template, request

map = Blueprint('map', __name__)

# The route for the map is enabled for both get and post methods
@map.route('/map/', methods=('GET', 'POST'))
def index():
    # Processing when form is sent
    # if request.method == 'POST':
        # TODO Process information of the routes to show 

    # The page is loaded using the templates
    return render_template('map.html.j2')