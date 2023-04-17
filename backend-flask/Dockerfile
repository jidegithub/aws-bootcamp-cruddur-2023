FROM 924351343865.dkr.ecr.us-east-1.amazonaws.com/cruddur-python:3.10-slim-buster
ENV PYTHONUNBUFFERED=1
WORKDIR /backend-flask

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .

EXPOSE ${PORT}
CMD [ "python3", "-m", "flask", "run", "--host=0.0.0.0", "--port=4567", "--debug"]