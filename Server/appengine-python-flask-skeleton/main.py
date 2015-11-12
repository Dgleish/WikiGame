"""`main` is the top level module for your Flask application."""
# Import the Flask Framework
from flask import Flask
from flask import request
app = Flask(__name__)
# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.

# Keep track of how many games in progress
gameNumber = 0

# List of dictionaries containing player IPs and page counts
games = [[]]

# Dictionary containing games that are running
runningGames = {}

# On page change, update games with page count so far and get back
# dictionary for that game
@app.route('/update', methods=['GET'])
def update():
	pid = str(request.args.get('pid'))
	id = int(request.args.get('gameID'))
	games[id][1][pid] = str(request.args.get('index'))
	gameState = str(games[id][1])
	return gameState	

@app.route('/debug', methods=['GET'])
def debug():
	return str(request.environ)
	
# Start a new game and get its ID
@app.route('/register', methods=['GET'])
def register():
	global gameNumber
	pid = str(request.args.get('pid'))
	dest = str(request.args.get('dest'))
	source = str(request.args.get('source'))
	games.insert(gameNumber,[{},{pid : 0}])
	games[gameNumber][0]['source'] = source
	games[gameNumber][0]['dest'] = dest
	gameNumber += 1
	return str(gameNumber-1)

# Leave a game, if last person leaves, game is {}
@app.route('/unregister', methods=['GET'])
def unregister():
	global gameNumber
	pid = str(request.args.get('pid'))
	id = int(request.args.get('gameID'))
	if id == -1:
		return 'Error: Not in a game'
	if len(games[id][1]) == 1:
		games[id] = []
		runningGames.pop(id)
		gameNumber -= 1
	else:
		del games[id][1][pid]
	return 'Success'

# Join a specific gameID
@app.route('/join', methods=['GET'])
def join():
	pid = str(request.args.get('pid'))
	id = int(request.args.get('gameID'))
	if id <= gameNumber:
		games[id][1][pid] = 0
		result = games[id][0]['source'] + ',' + games[id][0]['dest']
		return result
	return 'Invalid Game ID'

# Query wait queue of specific game for GO instruction
@app.route('/check', methods=['GET'])
def check():
	id = int(request.args.get('gameID'))
	if runningGames.has_key(id):
		return str(1)
	else:
		return str(0)
	
# Player signals for game to start
@app.route('/go', methods=['GET'])
def go():
	id = int(request.args.get('gameID'))
	runningGames[id] = 1
	return 'Success'
		
	
@app.errorhandler(404)
def page_not_found(e):
    """Return a custom 404 error."""
    return 'Sorry, Nothing at this URL.', 404


@app.errorhandler(500)
def application_error(e):
    """Return a custom 500 error."""
    return 'Sorry, unexpected error: {}'.format(e), 500