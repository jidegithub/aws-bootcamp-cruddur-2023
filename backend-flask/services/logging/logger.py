import watchtower
import logging
import os

# Implenting CloudWatch Log combined with native python logger
def setup_logger():
    # create logging formatter
    logFormatter = logging.Formatter(fmt=' %(name)s :: %(levelname)-8s :: %(message)s')
    # Configuring Logger to Use CloudWatch
    LOGGER = logging.getLogger("cruddur-backend-flask")
    LOGGER.setLevel(logging.DEBUG)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logFormatter)
    cw_handler = watchtower.CloudWatchLogHandler(log_group='cruddur-backend-flask')
    LOGGER.addHandler(console_handler)
    if  os.getenv("ENABLE_CLOUD_WATCH_LOG") and os.getenv("ENABLE_CLOUD_WATCH_LOG").lower() == "true":
    LOGGER.addHandler(cw_handler)
    LOGGER.info("Cloud watch logger enabled")