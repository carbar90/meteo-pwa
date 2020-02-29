from flask import Flask, render_template
from flask_restplus import Resource, Api

app = Flask(__name__, static_folder ='web-app', template_folder ='web-app')
api = Api(app)

@app.route("/home")
def index():
    return render_template("index.html")

@app.route("/admin")
def get():
    return render_template("admin.html")

""" @app.route("/test")
def test():
    return render_template("service-worker.js") """



if __name__ == '__main__':
    app.run(host = '0.0.0.0',port=5000)