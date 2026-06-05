#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080/api}"
CURL_TIMEOUT="${CURL_TIMEOUT:-10}"
AUTH_TOKEN=""
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

json_value() {
  python3 -c "import json,sys; data=json.load(sys.stdin); print($1)"
}

assert_status() {
  local method="$1"
  local path="$2"
  local expected="$3"
  local body="${4:-}"
  local tmp_body
  local status
  local curl_args

  tmp_body="$(mktemp)"
  curl_args=(-sS --max-time "$CURL_TIMEOUT" -o "$tmp_body" -w "%{http_code}" -X "$method" "$BASE_URL$path")
  if [ -n "$AUTH_TOKEN" ]; then
    curl_args+=(-H "Authorization: Bearer $AUTH_TOKEN")
  fi

  if [ -n "$body" ]; then
    if ! status="$(curl "${curl_args[@]}" -H "Content-Type: application/json" -d "$body")"; then
      echo "FAIL $method $path could not reach $BASE_URL$path"
      echo "Make sure the Spring Boot app is running and was restarted after the JWT changes."
      rm -f "$tmp_body"
      exit 1
    fi
  else
    if ! status="$(curl "${curl_args[@]}")"; then
      echo "FAIL $method $path could not reach $BASE_URL$path"
      echo "Make sure the Spring Boot app is running and was restarted after the JWT changes."
      rm -f "$tmp_body"
      exit 1
    fi
  fi

  if [ "$status" != "$expected" ]; then
    echo "FAIL $method $path expected $expected got $status"
    cat "$tmp_body"
    echo
    rm -f "$tmp_body"
    exit 1
  fi

  cat "$tmp_body"
  rm -f "$tmp_body"
}

print_step() {
  echo
  echo "==> $1"
}

require_command curl
require_command python3

print_step "Checking protected endpoint rejects missing token"
assert_status GET "/offers" "401" >/dev/null
echo "PASS protected endpoint returned 401 without token"

print_step "Checking protected endpoint rejects invalid token"
AUTH_TOKEN="bad-token"
assert_status GET "/offers" "401" >/dev/null
AUTH_TOKEN=""
echo "PASS protected endpoint returned 401 with invalid token"

print_step "Logging in"
LOGIN_BODY='{"username":"admin","password":"admin123"}'
LOGIN_RESPONSE="$(assert_status POST "/auth/login" "200" "$LOGIN_BODY")"
AUTH_TOKEN="$(printf '%s' "$LOGIN_RESPONSE" | json_value 'data["token"]')"
LOGIN_USERNAME="$(printf '%s' "$LOGIN_RESPONSE" | json_value 'data["username"]')"

if [ -z "$AUTH_TOKEN" ] || [ "$LOGIN_USERNAME" != "admin" ]; then
  echo "FAIL login did not return expected token and username"
  echo "$LOGIN_RESPONSE"
  exit 1
fi
echo "PASS logged in as $LOGIN_USERNAME"

print_step "Checking invalid login returns 401"
SAVED_AUTH_TOKEN="$AUTH_TOKEN"
AUTH_TOKEN=""
assert_status POST "/auth/login" "401" '{"username":"admin","password":"wrong"}' >/dev/null
AUTH_TOKEN="$SAVED_AUTH_TOKEN"
echo "PASS invalid credentials returned 401"

print_step "Checking offers endpoint with JWT"
OFFERS_FILE="$TMP_DIR/gym_offers.json"
assert_status GET "/offers" "200" >"$OFFERS_FILE"

OFFER_COUNT="$(python3 -c "import json; print(len(json.load(open('$OFFERS_FILE'))))")"
if [ "$OFFER_COUNT" -lt 3 ]; then
  echo "FAIL expected at least 3 seeded offers, got $OFFER_COUNT"
  cat "$OFFERS_FILE"
  exit 1
fi

OFFER_1_ID="$(python3 -c "import json; data=json.load(open('$OFFERS_FILE')); print(data[0]['id'])")"
OFFER_2_ID="$(python3 -c "import json; data=json.load(open('$OFFERS_FILE')); print(data[1]['id'])")"
SIX_MONTH_PRICE="$(python3 -c "import json; data=json.load(open('$OFFERS_FILE')); print(next(x['priceIqd'] for x in data if x['name'] == '6 Months'))")"

if [ "$SIX_MONTH_PRICE" != "160000.0" ] && [ "$SIX_MONTH_PRICE" != "160000" ]; then
  echo "FAIL expected 6 Months price to be 160000 IQD, got $SIX_MONTH_PRICE"
  exit 1
fi
echo "PASS offers seeded and 6 Months price is $SIX_MONTH_PRICE IQD"

print_step "Creating member with initial offer"
CREATE_BODY="{\"fullName\":\"API Test Member\",\"phone\":\"07700000001\",\"offerId\":$OFFER_1_ID}"
CREATE_RESPONSE="$(assert_status POST "/members" "200" "$CREATE_BODY")"
MEMBER_ID="$(printf '%s' "$CREATE_RESPONSE" | json_value 'data["id"]')"
CREATE_SUB_STATUS="$(printf '%s' "$CREATE_RESPONSE" | json_value 'data["latestSubscriptionStatus"]')"

if [ "$CREATE_SUB_STATUS" != "ACTIVE" ]; then
  echo "FAIL expected created member latest subscription status ACTIVE, got $CREATE_SUB_STATUS"
  echo "$CREATE_RESPONSE"
  exit 1
fi
echo "PASS created member id $MEMBER_ID"

print_step "Reading all members and member by id"
MEMBERS_FILE="$TMP_DIR/gym_members.json"
assert_status GET "/members" "200" >"$MEMBERS_FILE"
python3 - "$MEMBER_ID" "$MEMBERS_FILE" <<'PY'
import json, sys
member_id = int(sys.argv[1])
members_file = sys.argv[2]
data = json.load(open(members_file))
if not any(item["id"] == member_id for item in data):
    raise SystemExit(f"FAIL member {member_id} not found in /members")
print("PASS member appears in /members")
PY

GET_MEMBER_RESPONSE="$(assert_status GET "/members/$MEMBER_ID" "200")"
GET_MEMBER_NAME="$(printf '%s' "$GET_MEMBER_RESPONSE" | json_value 'data["fullName"]')"
if [ "$GET_MEMBER_NAME" != "API Test Member" ]; then
  echo "FAIL expected member name API Test Member, got $GET_MEMBER_NAME"
  exit 1
fi
echo "PASS fetched member by id"

print_step "Updating member"
UPDATE_BODY="{\"fullName\":\"API Test Member Updated\",\"phone\":\"07700000002\",\"offerId\":$OFFER_1_ID}"
UPDATE_RESPONSE="$(assert_status PUT "/members/$MEMBER_ID" "200" "$UPDATE_BODY")"
UPDATED_NAME="$(printf '%s' "$UPDATE_RESPONSE" | json_value 'data["fullName"]')"
UPDATED_PHONE="$(printf '%s' "$UPDATE_RESPONSE" | json_value 'data["phone"]')"

if [ "$UPDATED_NAME" != "API Test Member Updated" ] || [ "$UPDATED_PHONE" != "07700000002" ]; then
  echo "FAIL update did not persist expected fields"
  echo "$UPDATE_RESPONSE"
  exit 1
fi
echo "PASS updated member fields"

print_step "Assigning another offer"
ASSIGN_BODY="{\"memberId\":$MEMBER_ID,\"offerId\":$OFFER_2_ID}"
ASSIGN_RESPONSE="$(assert_status POST "/subscriptions/assign" "200" "$ASSIGN_BODY")"
ASSIGN_STATUS="$(printf '%s' "$ASSIGN_RESPONSE" | json_value 'data["status"]')"
if [ "$ASSIGN_STATUS" != "ACTIVE" ]; then
  echo "FAIL expected assigned subscription ACTIVE, got $ASSIGN_STATUS"
  exit 1
fi
echo "PASS assigned offer"

print_step "Renewing subscription"
RENEW_RESPONSE="$(assert_status POST "/subscriptions/renew" "200" "$ASSIGN_BODY")"
RENEW_STATUS="$(printf '%s' "$RENEW_RESPONSE" | json_value 'data["status"]')"
if [ "$RENEW_STATUS" != "ACTIVE" ]; then
  echo "FAIL expected renewed subscription ACTIVE, got $RENEW_STATUS"
  exit 1
fi
echo "PASS renewed subscription"

print_step "Listing member subscriptions"
SUBSCRIPTIONS_RESPONSE="$(assert_status GET "/subscriptions/member/$MEMBER_ID" "200")"
SUBSCRIPTION_COUNT="$(printf '%s' "$SUBSCRIPTIONS_RESPONSE" | json_value 'len(data)')"
if [ "$SUBSCRIPTION_COUNT" -lt 3 ]; then
  echo "FAIL expected at least 3 subscriptions after create, assign, renew; got $SUBSCRIPTION_COUNT"
  echo "$SUBSCRIPTIONS_RESPONSE"
  exit 1
fi
echo "PASS member has $SUBSCRIPTION_COUNT subscriptions"

print_step "Reading logs"
ALL_LOGS_RESPONSE="$(assert_status GET "/logs" "200")"
ALL_LOGS_COUNT="$(printf '%s' "$ALL_LOGS_RESPONSE" | json_value 'len(data)')"
MEMBER_LOGS_RESPONSE="$(assert_status GET "/logs/member/$MEMBER_ID" "200")"
MEMBER_LOGS_COUNT="$(printf '%s' "$MEMBER_LOGS_RESPONSE" | json_value 'len(data)')"

if [ "$ALL_LOGS_COUNT" -lt 1 ] || [ "$MEMBER_LOGS_COUNT" -lt 1 ]; then
  echo "FAIL expected activity logs to exist"
  exit 1
fi
echo "PASS logs exist, all logs: $ALL_LOGS_COUNT, member logs: $MEMBER_LOGS_COUNT"

print_step "Stopping member"
STOP_RESPONSE="$(assert_status PUT "/members/$MEMBER_ID/stop" "200")"
STOP_STATUS="$(printf '%s' "$STOP_RESPONSE" | json_value 'data["status"]')"
STOP_SUB_STATUS="$(printf '%s' "$STOP_RESPONSE" | json_value 'data["latestSubscriptionStatus"]')"

if [ "$STOP_STATUS" != "STOPPED" ] || [ "$STOP_SUB_STATUS" != "STOPPED" ]; then
  echo "FAIL expected member and latest subscription to be STOPPED"
  echo "$STOP_RESPONSE"
  exit 1
fi
echo "PASS stopped member"

print_step "Deleting member"
assert_status DELETE "/members/$MEMBER_ID" "204" >/dev/null
echo "PASS deleted member"

print_step "Confirming deleted member returns 404"
assert_status GET "/members/$MEMBER_ID" "404" >/dev/null
echo "PASS deleted member returns 404"

echo
echo "All API endpoint tests passed."
