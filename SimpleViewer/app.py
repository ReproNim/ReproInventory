import pandas as pd
from flask import Flask, jsonify, render_template

app = Flask(__name__)

# Load the CSV data
csv_file = 'SimpleTest.csv'
data = pd.read_csv(csv_file)

@app.route('/api/data')
def get_data():
    return jsonify(data.to_dict(orient='records'))

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)

