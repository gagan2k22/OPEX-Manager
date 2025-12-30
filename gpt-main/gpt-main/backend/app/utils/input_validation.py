"""
backend/app/utils/input_validation.py
Input validation and sanitization utilities
"""
from pydantic import BaseModel, validator, constr, Field
from typing import Optional
import re

class SearchRequest(BaseModel):
    """Validated search request with sanitization"""
    search: constr(max_length=100) = ""
    
    @validator('search')
    def sanitize_search(cls, v):
        """Remove special SQL characters to prevent injection"""
        if not v:
            return ""
        # Remove SQL special characters
        sanitized = re.sub(r'[%_\\;\'\"--]', '', v)
        return sanitized.strip()

class PaginationParams(BaseModel):
    """Validated pagination parameters"""
    page: int = Field(default=0, ge=0, description="Page number (0-indexed)")
    pageSize: int = Field(default=100, ge=1, le=1000, description="Items per page")
    
class BudgetSearchRequest(PaginationParams):
    """Budget tracker search with validation"""
    search: str = Field(default="", max_length=100)
    fy: str = Field(default="FY2024", pattern=r"^FY\d{4}$")
    
    @validator('search')
    def sanitize_search(cls, v):
        """Sanitize search input"""
        if not v:
            return ""
        # Remove SQL special characters
        sanitized = re.sub(r'[%_\\;\'\"--]', '', v)
        return sanitized.strip()

class FileUploadValidator:
    """Validate file uploads"""
    
    ALLOWED_EXTENSIONS = {'.xlsx', '.xls'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    @staticmethod
    def validate_excel_file(filename: str, file_size: int) -> tuple[bool, str]:
        """
        Validate Excel file upload
        Returns: (is_valid, error_message)
        """
        # Check extension
        import os
        ext = os.path.splitext(filename)[1].lower()
        if ext not in FileUploadValidator.ALLOWED_EXTENSIONS:
            return False, f"Invalid file type. Allowed: {', '.join(FileUploadValidator.ALLOWED_EXTENSIONS)}"
        
        # Check size
        if file_size > FileUploadValidator.MAX_FILE_SIZE:
            return False, f"File too large. Maximum size: {FileUploadValidator.MAX_FILE_SIZE / 1024 / 1024}MB"
        
        # Sanitize filename to prevent path traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            return False, "Invalid filename"
        
        return True, ""

class StringSanitizer:
    """Utility class for string sanitization"""
    
    @staticmethod
    def sanitize_sql_input(value: str) -> str:
        """Remove SQL injection characters"""
        if not value:
            return ""
        # Remove dangerous SQL characters
        sanitized = re.sub(r'[;\'\"\\--]', '', value)
        return sanitized.strip()
    
    @staticmethod
    def sanitize_html(value: str) -> str:
        """Remove HTML/XSS characters"""
        if not value:
            return ""
        # Remove HTML tags and script content
        sanitized = re.sub(r'<[^>]*>', '', value)
        sanitized = re.sub(r'javascript:', '', sanitized, flags=re.IGNORECASE)
        return sanitized.strip()
