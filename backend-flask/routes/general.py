from flask import request, g

def load(app): 
	@app.route('/api/health-check')
	def health_check():
		app.logger.info('health request received')
		data = {'success': True, 'ver': 1}
		return data, 200

	@app.route('/rollbar/test')
	def rollbar_test():
		g.rollbar.report_message('Hello World!', 'warning')
		return "Hello World!"