"""`main` is the top level module for your Flask application."""
# Import the Flask Framework
from flask import Flask
from flask_socketio import SocketIO
from flask import request
import logging
app = Flask(__name__)
socketio = SocketIO(app)
# Note: We don't need to call run() since our application is embedded within
# the App Engine WSGI application server.

# Keep track of how many games in progress
gameNumber = 0

# List of dictionaries containing player IPs and page counts
games = [[]]
# Data structure goes like this:
# [	[{'source':'http:...', 'dest':'http:...'},{Player1: 'pageCount', Player2: 'pageCount'}],   [{},{}]    ,    ...	    ,    ]

# Dictionary containing games that are running
runningGames = {}

# Dictionary mapping player numbers to names
nicknames = [{}]

# On page change, update games with page count so far and get back
# dictionary for that game
@app.route('/update', methods=['GET'])
def update():
	# Get request parameters
	pid = str(request.args.get('pid'))
	id = int(request.args.get('gameID'))
	games[id][1][pid] = str(request.args.get('index'))
	
	gameState = ""
	for key in games[id][1]:
		gameState += str(nicknames[id][key]) + ":" + str(games[id][1][key]) + ","
	return gameState	

@app.route('/c2c', methods=['GET'])
def c2c():
        cookie = str(request.args.get('co'))
        app.logger.info(cookie)

@app.route('/debug', methods=['GET'])
def debug():
	return str(request.environ)
	
# Start a new game and get its ID
@app.route('/register', methods=['GET'])
def register():
	global gameNumber
	# Get request parameters
	pid = str(request.args.get('pid'))
	dest = str(request.args.get('dest'))
	source = str(request.args.get('source'))
	nick = str(request.args.get('nick'))
	
	games.insert(gameNumber,[{},{pid : 0}])
	games[gameNumber][0]['source'] = source
	games[gameNumber][0]['dest'] = dest
	
	nicknames.insert(gameNumber,{pid:nick})
	
	gameNumber += 1
	return str(gameNumber-1)

# Leave a game, if last person leaves, game is {}
@app.route('/unregister', methods=['GET'])
def unregister():
	global gameNumber
	# Get request parameters
	pid = str(request.args.get('pid'))
	logging.info(request.args.get('gameID'))
	id = int(request.args.get('gameID'))
	
	if id == -1:
		return 'Error: Not in a game'
	#logging.info("number of players is " + str(len(games[id][1])))
	nicknames[id].pop(pid)
	if len(games[id][1]) == 1:
		games[id] = []
		if runningGames.has_key(id):
			runningGames.pop(id)
		gameNumber -= 1
	else:
		del games[id][1][pid]
	return 'Success'

# Join a specific gameID
@app.route('/join', methods=['GET'])
def join():
	# Get request parameters
	pid = str(request.args.get('pid'))
	id = int(request.args.get('gameID'))
	nick = str(request.args.get('nick'))
	
	if id <= gameNumber:
		games[id][1][pid] = 0
		result = games[id][0]['source'] + ',' + games[id][0]['dest']
		if nicknames[id].has_key(nick):
			return 'Name already taken'
		nicknames[id][pid] = nick
		return result
	return 'Invalid Game ID'

# Query wait queue of specific game for GO instruction
@app.route('/check', methods=['GET'])
def check():
	# Get request parameters
	id = int(request.args.get('gameID'))
	
	if runningGames.has_key(id):
		return str(1)
	else:
		return str(0)
	
# Player signals for game to start
@app.route('/go', methods=['GET'])
def go():
	# Get request parameters
	id = int(request.args.get('gameID'))
	
	runningGames[id] = 1
	return 'Success'

@app.route('/')
def root():
    return 'HI'
		
	
@app.errorhandler(404)
def page_not_found(e):
    """Return a custom 404 error."""
    return 'Sorry, Nothing at this URL.', 404


@app.errorhandler(500)
def application_error(e):
    """Return a custom 500 error."""
    return 'Sorry, unexpected error: {}'.format(e), 500
