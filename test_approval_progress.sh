#!/bin/bash

# Approval Progress API Test Script
# Tests the new approval progress endpoints

API_BASE="http://localhost:3000/api"
AUTH_TOKEN="${AUTH_TOKEN:-your_bearer_token_here}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}================================================${NC}"
echo -e "${YELLOW}Approval Progress API - Test Suite${NC}"
echo -e "${YELLOW}================================================${NC}\n"

# Test 1: Get approval progress for a ticket
echo -e "${YELLOW}Test 1: Get Approval Progress for Ticket${NC}"
echo "Endpoint: GET /api/approvals/progress/ticket/1"
echo "Command:"
echo "curl -X GET \"${API_BASE}/approvals/progress/ticket/1\" \\"
echo "  -H \"Authorization: Bearer ${AUTH_TOKEN}\""
echo ""

RESPONSE=$(curl -s -X GET "${API_BASE}/approvals/progress/ticket/1" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Success${NC}"
  echo "Response sample:"
  echo "$RESPONSE" | head -20
else
  echo -e "${RED}✗ Failed${NC}"
  echo "$RESPONSE"
fi

echo -e "\n---\n"

# Test 2: Get approval progress for a reprint request
echo -e "${YELLOW}Test 2: Get Approval Progress for Reprint Request${NC}"
echo "Endpoint: GET /api/approvals/progress/reprint-request/1"
echo "Command:"
echo "curl -X GET \"${API_BASE}/approvals/progress/reprint-request/1\" \\"
echo "  -H \"Authorization: Bearer ${AUTH_TOKEN}\""
echo ""

RESPONSE=$(curl -s -X GET "${API_BASE}/approvals/progress/reprint-request/1" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Success${NC}"
  echo "Response sample:"
  echo "$RESPONSE" | head -20
else
  echo -e "${RED}✗ Failed or no data${NC}"
  echo "$RESPONSE"
fi

echo -e "\n---\n"

# Test 3: Get approval progress summary (tickets)
echo -e "${YELLOW}Test 3: Get Approval Progress Summary (Tickets)${NC}"
echo "Endpoint: GET /api/approvals/progress/summary?type=ticket&limit=5"
echo "Command:"
echo "curl -X GET \"${API_BASE}/approvals/progress/summary?type=ticket&limit=5\" \\"
echo "  -H \"Authorization: Bearer ${AUTH_TOKEN}\""
echo ""

RESPONSE=$(curl -s -X GET "${API_BASE}/approvals/progress/summary?type=ticket&limit=5" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Success${NC}"
  echo "Response sample:"
  echo "$RESPONSE" | head -30
else
  echo -e "${RED}✗ Failed${NC}"
  echo "$RESPONSE"
fi

echo -e "\n---\n"

# Test 4: Get approval progress summary (reprint requests)
echo -e "${YELLOW}Test 4: Get Approval Progress Summary (Reprint Requests)${NC}"
echo "Endpoint: GET /api/approvals/progress/summary?type=reprint-request&limit=5"
echo "Command:"
echo "curl -X GET \"${API_BASE}/approvals/progress/summary?type=reprint-request&limit=5\" \\"
echo "  -H \"Authorization: Bearer ${AUTH_TOKEN}\""
echo ""

RESPONSE=$(curl -s -X GET "${API_BASE}/approvals/progress/summary?type=reprint-request&limit=5" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Success${NC}"
  echo "Response sample:"
  echo "$RESPONSE" | head -30
else
  echo -e "${RED}✗ Failed or no data${NC}"
  echo "$RESPONSE"
fi

echo -e "\n---\n"

# Test 5: Test with pagination
echo -e "${YELLOW}Test 5: Get Approval Progress Summary with Pagination${NC}"
echo "Endpoint: GET /api/approvals/progress/summary?type=ticket&limit=10&offset=0"
echo "Command:"
echo "curl -X GET \"${API_BASE}/approvals/progress/summary?type=ticket&limit=10&offset=0\" \\"
echo "  -H \"Authorization: Bearer ${AUTH_TOKEN}\""
echo ""

RESPONSE=$(curl -s -X GET "${API_BASE}/approvals/progress/summary?type=ticket&limit=10&offset=0" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | grep -q '"pagination"'; then
  echo -e "${GREEN}✓ Success - Pagination working${NC}"
  PAGINATION=$(echo "$RESPONSE" | grep -o '"pagination":[^}]*}')
  echo "Pagination info: $PAGINATION"
else
  echo -e "${YELLOW}⚠ No pagination info${NC}"
fi

echo -e "\n---\n"

# Test 6: Error case - invalid type
echo -e "${YELLOW}Test 6: Error Case - Invalid Type${NC}"
echo "Endpoint: GET /api/approvals/progress/summary?type=invalid"
echo ""

RESPONSE=$(curl -s -X GET "${API_BASE}/approvals/progress/summary?type=invalid" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | grep -q '"error"'; then
  echo -e "${GREEN}✓ Correctly returned error${NC}"
  echo "Error response: $RESPONSE"
else
  echo -e "${RED}✗ Should have returned error${NC}"
  echo "$RESPONSE"
fi

echo -e "\n---\n"

# Test 7: Error case - ticket not found
echo -e "${YELLOW}Test 7: Error Case - Ticket Not Found${NC}"
echo "Endpoint: GET /api/approvals/progress/ticket/99999"
echo ""

RESPONSE=$(curl -s -X GET "${API_BASE}/approvals/progress/ticket/99999" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json")

if echo "$RESPONSE" | grep -q '"error"'; then
  echo -e "${GREEN}✓ Correctly returned error${NC}"
  echo "Error response: $RESPONSE"
else
  echo -e "${RED}✗ Should have returned error${NC}"
  echo "$RESPONSE"
fi

echo -e "\n${YELLOW}================================================${NC}"
echo -e "${YELLOW}Test Suite Complete${NC}"
echo -e "${YELLOW}================================================${NC}\n"

echo -e "${YELLOW}Notes:${NC}"
echo "1. Replace YOUR_AUTH_TOKEN with a valid bearer token"
echo "2. Ensure the API server is running on localhost:3000"
echo "3. Replace ticket/request IDs with existing IDs in your database"
echo "4. For ticket IDs that have no workflow, expect 'Item does not have a workflow assigned'"
echo ""
echo -e "${YELLOW}Usage:${NC}"
echo "  bash test_approval_progress.sh"
echo "  AUTH_TOKEN='your_token' bash test_approval_progress.sh"
