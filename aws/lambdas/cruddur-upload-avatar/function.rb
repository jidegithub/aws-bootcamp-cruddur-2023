require 'aws-sdk-s3'
require 'json'

def handler(event:, context:)
	puts event
	s3 = Aws::S3::Resource.new
	bucket_name = ENV["UPLOADS_BUCKET_NAME"]
	object_key = 'mock.jpg'

	obj = s3.bucket(bucket_name).object(object_key)
	url = obj.presigned_url(:put, expires_in: 60 * 5)
	body = {url: url}.to_json #will be returned
	{ 
      headers: {
        "Access-Control-Allow-Headers": "*, Authorization",
        "Access-Control-Allow-Origin": "https://jidegithub-fantastic-giggle-g7qrxgj55rgh9r77-4567.preview.app.github.dev",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST"
      },
      statusCode: 200,
	  body: body
    }
end