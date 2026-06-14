from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gateway")

app = FastAPI(title="News Aggregator API Gateway")

# Enable CORS for React frontend (and general development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SPRING_BOOT_URL = "http://localhost:8081"
NODE_JS_URL = "http://localhost:5000"

async def proxy_request(target_base_url: str, request: Request) -> Response:
    client = httpx.AsyncClient()
    
    # Read the incoming request body
    body = await request.body()
    
    # Prepare headers, removing host to let httpx set it
    headers = {k: v for k, v in request.headers.items() if k.lower() != "host"}
    
    # Construct target url
    path = request.url.path
    target_url = f"{target_base_url}{path}"
    
    logger.info(f"Proxying {request.method} {path} -> {target_url}")
    
    try:
        response = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            params=request.query_params,
            content=body,
            timeout=30.0
        )
        
        # Prepare response headers, excluding content-length and transfer-encoding to avoid mismatches
        resp_headers = {}
        for k, v in response.headers.items():
            if k.lower() not in ["content-length", "transfer-encoding", "content-encoding"]:
                resp_headers[k] = v
                
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=resp_headers
        )
    except httpx.RequestError as exc:
        logger.error(f"Failed to connect to backend: {exc}")
        return Response(
            content=f"Gateway Error: Cannot connect to downstream service. Details: {str(exc)}",
            status_code=502
        )
    finally:
        await client.aclose()

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def route_request(path: str, request: Request):
    # Route based on the prefix of the path
    # Path is like 'api/v1/content' or 'api/v1/semantic-search'
    is_node = (
        path.startswith("api/v1/content") or 
        path.startswith("api/v1/semantic-search") or 
        path.startswith("api/v1/reading-history") or
        path.startswith("api/v1/reading-activity")
    )
    
    target_base = NODE_JS_URL if is_node else SPRING_BOOT_URL
    return await proxy_request(target_base, request)
