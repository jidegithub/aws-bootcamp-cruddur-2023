import watchtower
import logging
import os

# Implenting CloudWatch Log combined with native python logger
def setup_logger():
    # create logging formatter
    logFormatter = logging.Formatter(fmt=" %(name)s :: %(levelname)-8s :: %(message)s")
    # Configuring Logger to Use CloudWatch
    LOGGER = logging.getLogger("cruddur")
    LOGGER.setLevel(logging.DEBUG)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(logFormatter)
    LOGGER.addHandler(console_handler)
    if (
        os.getenv("ENABLE_CLOUD_WATCH_LOG")
        and os.getenv("ENABLE_CLOUD_WATCH_LOG").lower() == "true"
    ):
        cw_handler = watchtower.CloudWatchLogHandler(log_group="cruddur")
        LOGGER.addHandler(cw_handler)
        LOGGER.info("Cloud watch logger enabled")