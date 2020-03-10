from flask import Flask, render_template
from flask_restplus import Resource, Api
from flask_pymongo import PyMongo
from bson.json_util import dumps

app = Flask(__name__, static_folder ='web-app', template_folder ='web-app')
app.config["MONGO_URI"] = "mongodb://localhost:27017/test"
mongo = PyMongo(app)
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

@app.route('/users')
def users():
    users = mongo.db.user.find()
    res = dumps(users)
    print(res)
    return res

if __name__ == '__main__':
    app.run(host = '0.0.0.0',port=5000, debug="true")