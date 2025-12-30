"""
backend/app/middleware/rate_limiter.py
Rate limiting middleware for API endpoints
"""
from fastapi import Request, HTTPException, status
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, Tuple
import asyncio

class RateLimiter:
    """
    Simple in-memory rate limiter
    For production, use Redis-based solution like slowapi
    """
    
    def __init__(self):
        # Store: {ip: [(timestamp, count), ...]}
        self.requests: Dict[str, list] = defaultdict(list)
        self.cleanup_task = None
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request"""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    
    def _cleanup_old_requests(self):
        """Remove requests older than 1 hour"""
        cutoff = datetime.now() - timedelta(hours=1)
        for ip in list(self.requests.keys()):
            self.requests[ip] = [
                (ts, count) for ts, count in self.requests[ip]
                if ts > cutoff
            ]
            if not self.requests[ip]:
                del self.requests[ip]
    
    async def check_rate_limit(
        self, 
        request: Request, 
        max_requests: int = 5, 
        window_minutes: int = 1
    ) -> Tuple[bool, int]:
        """
        Check if request is within rate limit
        
        Args:
            request: FastAPI request object
            max_requests: Maximum requests allowed in window
            window_minutes: Time window in minutes
            
        Returns:
            (is_allowed, remaining_requests)
        """
        client_ip = self._get_client_ip(request)
        now = datetime.now()
        window_start = now - timedelta(minutes=window_minutes)
        
        # Clean up old requests periodically
        if len(self.requests) > 1000:
            self._cleanup_old_requests()
        
        # Get requests in current window
        recent_requests = [
            (ts, count) for ts, count in self.requests[client_ip]
            if ts > window_start
        ]
        
        # Count total requests
        total_requests = sum(count for _, count in recent_requests)
        
        if total_requests >= max_requests:
            return False, 0
        
        # Add current request
        self.requests[client_ip] = recent_requests + [(now, 1)]
        remaining = max_requests - total_requests - 1
        
        return True, remaining

# Global rate limiter instance
rate_limiter = RateLimiter()

async def login_rate_limit(request: Request):
    """
    Rate limit middleware for login endpoint
    5 requests per minute per IP
    """
    is_allowed, remaining = await rate_limiter.check_rate_limit(
        request, 
        max_requests=5, 
        window_minutes=1
    )
    
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later.",
            headers={"Retry-After": "60"}
        )
    
    # Add rate limit headers
    request.state.rate_limit_remaining = remaining
    return True

async def api_rate_limit(request: Request):
    """
    Rate limit middleware for general API endpoints
    100 requests per minute per IP
    """
    is_allowed, remaining = await rate_limiter.check_rate_limit(
        request, 
        max_requests=100, 
        window_minutes=1
    )
    
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please slow down.",
            headers={"Retry-After": "60"}
        )
    
    request.state.rate_limit_remaining = remaining
    return True
