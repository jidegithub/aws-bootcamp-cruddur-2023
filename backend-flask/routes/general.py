from flask import request

def load(app): 
	@app.route("/api/health-check", methods=["GET"])
	def health_check():
		app.logger.info("health request received")
		data = {"success": True, "message": "healthy", "ver": 1}
		return data, 200