"""
backend/scripts/test_security.py
Security testing script for OPEX Manager
Tests various security measures and vulnerabilities
"""
import requests
import time
from typing import Dict, List

BASE_URL = "http://localhost:5000/api"

class SecurityTester:
    """Security testing utility"""
    
    def __init__(self):
        self.results: List[Dict] = []
        self.token = None
    
    def log_result(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        self.results.append({
            "test": test_name,
            "passed": passed,
            "details": details
        })
        print(f"{status} - {test_name}")
        if details:
            print(f"   {details}")
    
    def test_rate_limiting(self):
        """Test login rate limiting"""
        print("\n🔒 Testing Rate Limiting...")
        
        # Try 6 login attempts (limit is 5)
        attempts = 0
        rate_limited = False
        
        for i in range(6):
            try:
                response = requests.post(
                    f"{BASE_URL}/auth/login",
                    json={"email": "test@test.com", "password": "wrong"},
                    timeout=5
                )
                attempts += 1
                
                if response.status_code == 429:
                    rate_limited = True
                    break
                    
            except Exception as e:
                print(f"   Request {i+1} error: {str(e)}")
            
            time.sleep(0.2)  # Small delay between requests
        
        self.log_result(
            "Rate Limiting on Login",
            rate_limited,
            f"Got rate limited after {attempts} attempts (expected <= 5)"
        )
    
    def test_sql_injection(self):
        """Test SQL injection prevention"""
        print("\n🔒 Testing SQL Injection Prevention...")
        
        # Login first to get token
        try:
            response = requests.post(
                f"{BASE_URL}/auth/login",
                json={"email": "admin@example.com", "password": "password123"},
                timeout=5
            )
            
            if response.status_code == 200:
                self.token = response.json().get("token")
            else:
                print("   ⚠️  Could not login - skipping SQL injection tests")
                return
                
        except Exception as e:
            print(f"   ⚠️  Login failed: {str(e)}")
            return
        
        # Test SQL injection in search
        sql_payloads = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "admin'--",
            "' UNION SELECT * FROM users--",
        ]
        
        headers = {"Authorization": f"Bearer {self.token}"}
        all_safe = True
        
        for payload in sql_payloads:
            try:
                response = requests.get(
                    f"{BASE_URL}/budgets/tracker",
                    params={"search": payload},
                    headers=headers,
                    timeout=5
                )
                
                # Should either sanitize or return error, not execute SQL
                if response.status_code in [200, 400]:
                    # Check if payload was sanitized (should not appear in response)
                    if "DROP TABLE" in str(response.text):
                        all_safe = False
                        break
                else:
                    # Unexpected error might indicate vulnerability
                    if response.status_code == 500:
                        all_safe = False
                        break
                        
            except Exception as e:
                print(f"   Error testing payload: {str(e)}")
        
        self.log_result(
            "SQL Injection Prevention",
            all_safe,
            "Search input properly sanitized" if all_safe else "Potential SQL injection vulnerability"
        )
    
    def test_file_upload_validation(self):
        """Test file upload validation"""
        print("\n🔒 Testing File Upload Validation...")
        
        if not self.token:
            print("   ⚠️  No token - skipping file upload tests")
            return
        
        headers = {"Authorization": f"Bearer {self.token}"}
        
        # Test 1: Invalid file extension
        try:
            files = {'file': ('malicious.exe', b'fake content', 'application/octet-stream')}
            response = requests.post(
                f"{BASE_URL}/budgets/import",
                files=files,
                headers=headers,
                timeout=5
            )
            
            # Should reject non-Excel files
            invalid_rejected = response.status_code in [400, 415]
            
            self.log_result(
                "File Extension Validation",
                invalid_rejected,
                "Invalid file extension rejected" if invalid_rejected else "Invalid file accepted!"
            )
            
        except Exception as e:
            print(f"   Error testing file upload: {str(e)}")
    
    def test_authentication(self):
        """Test authentication requirements"""
        print("\n🔒 Testing Authentication...")
        
        # Try to access protected endpoint without token
        try:
            response = requests.get(
                f"{BASE_URL}/budgets/tracker",
                timeout=5
            )
            
            # Should return 401 or 403
            requires_auth = response.status_code in [401, 403]
            
            self.log_result(
                "Authentication Required",
                requires_auth,
                f"Status: {response.status_code}" + 
                (" (correctly requires auth)" if requires_auth else " (no auth required!)")
            )
            
        except Exception as e:
            print(f"   Error testing authentication: {str(e)}")
    
    def test_user_enumeration(self):
        """Test user enumeration prevention"""
        print("\n🔒 Testing User Enumeration Prevention...")
        
        # Try login with non-existent user
        try:
            response1 = requests.post(
                f"{BASE_URL}/auth/login",
                json={"email": "nonexistent@test.com", "password": "wrong"},
                timeout=5
            )
            
            # Try login with existing user but wrong password
            response2 = requests.post(
                f"{BASE_URL}/auth/login",
                json={"email": "admin@example.com", "password": "wrongpassword"},
                timeout=5
            )
            
            # Both should return same error message
            msg1 = response1.json().get("detail", "")
            msg2 = response2.json().get("detail", "")
            
            same_error = msg1 == msg2
            
            self.log_result(
                "User Enumeration Prevention",
                same_error,
                f"Error messages {'match' if same_error else 'differ'} (should match)"
            )
            
        except Exception as e:
            print(f"   Error testing user enumeration: {str(e)}")
    
    def run_all_tests(self):
        """Run all security tests"""
        print("=" * 80)
        print("SECURITY TEST SUITE")
        print("=" * 80)
        
        self.test_authentication()
        self.test_user_enumeration()
        self.test_rate_limiting()
        self.test_sql_injection()
        self.test_file_upload_validation()
        
        # Summary
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for r in self.results if r["passed"])
        total = len(self.results)
        
        print(f"\nPassed: {passed}/{total}")
        
        if passed == total:
            print("\n✅ All security tests passed!")
        else:
            print("\n⚠️  Some security tests failed - review results above")
            print("\nFailed tests:")
            for result in self.results:
                if not result["passed"]:
                    print(f"   - {result['test']}: {result['details']}")
        
        print("=" * 80)

if __name__ == "__main__":
    print("\n⚠️  Make sure the backend server is running on http://localhost:5000")
    print("Press Enter to continue or Ctrl+C to cancel...")
    input()
    
    tester = SecurityTester()
    
    try:
        tester.run_all_tests()
    except KeyboardInterrupt:
        print("\n\nTests cancelled by user")
    except Exception as e:
        print(f"\n\n❌ Error running tests: {str(e)}")
        import traceback
        traceback.print_exc()
