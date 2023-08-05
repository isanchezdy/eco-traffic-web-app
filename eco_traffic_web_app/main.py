from flask import Flask, send_from_directory
import os
from map import map

app=Flask(__name__)
app.register_blueprint(map) # The map page is registered for the app

# Route for the icon of the page
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static', 'ico'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/leaflet/<path:path>')
def send_library(path):
    return send_from_directory('leaflet', path)

if __name__ == '__main__':
   app.run(host="localhost", port=8080, debug=True)