#!/bin/bash

# API Endpoint Test Script
# Tests all mock server endpoints to ensure they're working correctly

echo "🧪 Testing ShopMindAI Mock Server Endpoints"
echo "=========================================="

BASE_URL="http://localhost:3080"
FAILED_TESTS=0

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    
    echo -n "Testing $method $endpoint... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "%{http_code}" -o /dev/null -X "$method" "$BASE_URL$endpoint")
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo "✅ PASS"
    else
        echo "❌ FAIL (Expected: $expected_status, Got: $response)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Test GET endpoints
test_endpoint "GET" "/api/health" "200" "Health check"
test_endpoint "GET" "/api/config" "200" "Configuration"
test_endpoint "GET" "/api/banner" "200" "Banner settings"
test_endpoint "GET" "/api/endpoints" "200" "AI endpoints"
test_endpoint "GET" "/api/user" "200" "User data"
test_endpoint "GET" "/api/conversations" "200" "Conversations list"
test_endpoint "GET" "/api/presets" "200" "Presets list"
test_endpoint "GET" "/api/files" "200" "Files list"

# Test POST endpoints
test_endpoint "POST" "/api/auth/refresh" "200" "Auth refresh"
test_endpoint "POST" "/api/auth/logout" "200" "Auth logout"

# Test login with valid credentials
echo -n "Testing POST /api/auth/login with valid credentials... "
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"demo@shopmindai.com","password":"demo123"}')
if echo "$login_response" | grep -q "success.*true"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test login with invalid credentials
echo -n "Testing POST /api/auth/login with invalid credentials... "
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"invalid@example.com","password":"wrong"}')
if echo "$login_response" | grep -q "success.*false"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test chat completions endpoint
echo -n "Testing POST /api/chat/completions... "
chat_response=$(curl -s -X POST "$BASE_URL/api/chat/completions" \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"Hello"}],"model":"gpt-4","stream":false}')
if echo "$chat_response" | grep -q "choices"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test file upload
echo -n "Testing POST /api/files/upload... "
upload_response=$(curl -s -X POST "$BASE_URL/api/files/upload")
if echo "$upload_response" | grep -q "success.*true"; then
    echo "✅ PASS"
else
    echo "❌ FAIL"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi

# Test non-existent endpoint
test_endpoint "GET" "/api/nonexistent" "404" "Non-existent endpoint"

echo ""
echo "=========================================="
if [ $FAILED_TESTS -eq 0 ]; then
    echo "🎉 All tests passed! Mock server is working correctly."
else
    echo "❌ $FAILED_TESTS test(s) failed. Check the mock server configuration."
fi
echo "=========================================="
