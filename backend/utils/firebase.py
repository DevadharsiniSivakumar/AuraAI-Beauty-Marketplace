import os
import json
import logging
import firebase_admin
from firebase_admin import credentials, auth, firestore
from utils.config import settings

logger = logging.getLogger("aura_backend")

_firebase_initialized = False

def initialize_firebase():
    global _firebase_initialized
    if _firebase_initialized:
        return firebase_admin.get_app()
    
    if firebase_admin._apps:
        _firebase_initialized = True
        return firebase_admin.get_app()

    # Read service account key from environment if provided
    service_account_env = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY")
    
    # 1. Try local service account file path or raw JSON string
    if service_account_env:
        try:
            if service_account_env.strip().startswith("{"):
                # Parse raw service account JSON string
                cred_dict = json.loads(service_account_env)
                cred = credentials.Certificate(cred_dict)
                app = firebase_admin.initialize_app(cred)
                _firebase_initialized = True
                logger.info("Firebase Admin initialized via raw service account JSON env.")
                return app
            else:
                # Path to file
                if os.path.exists(service_account_env):
                    cred = credentials.Certificate(service_account_env)
                    app = firebase_admin.initialize_app(cred)
                    _firebase_initialized = True
                    logger.info(f"Firebase Admin initialized via service account path: {service_account_env}")
                    return app
                else:
                    logger.warning(f"FIREBASE_SERVICE_ACCOUNT_KEY path does not exist: {service_account_env}")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin with service account key: {e}")

    # 2. Try Application Default Credentials (ADC)
    try:
        cred = credentials.ApplicationDefault()
        app = firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        logger.info("Firebase Admin initialized via Application Default Credentials (ADC).")
        return app
    except Exception as e:
        logger.debug(f"Application Default Credentials not available: {e}")

    # 3. Fallback: Initialize with Project ID only
    project_id = os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID")
    if project_id:
        try:
            app = firebase_admin.initialize_app(options={"projectId": project_id})
            _firebase_initialized = True
            logger.info(f"Firebase Admin initialized with Project ID fallback: {project_id}")
            return app
        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin with project ID option: {e}")

    # 4. Fallback to default credentials
    try:
        app = firebase_admin.initialize_app()
        _firebase_initialized = True
        logger.info("Firebase Admin initialized via default credentials.")
        return app
    except Exception as e:
        logger.warning(f"Default Firebase Admin initialization failed: {e}")
        return None

def get_firestore_client():
    app = initialize_firebase()
    if app:
        try:
            return firestore.client()
        except Exception as e:
            logger.error(f"Failed to get Firestore client: {e}")
    return None

def verify_firebase_token(id_token: str):
    initialize_firebase()
    try:
        # verify ID token cryptographically
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        logger.warning(f"Firebase ID token verification failed: {e}")
        return None

def should_use_mock() -> bool:
    allow_fallback = os.getenv("ALLOW_MOCK_AI_DATA_FALLBACK", "false").lower() == "true"
    if get_firestore_client() is None:
        if not allow_fallback:
            # Raise exception if fallback is disabled and firestore is unavailable
            raise RuntimeError("Firestore is unavailable and ALLOW_MOCK_AI_DATA_FALLBACK is disabled.")
        return True
    return False
