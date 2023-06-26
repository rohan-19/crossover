import requests
import concurrent.futures
import json

def make_request(payload):
    # Replace with your API Gateway URL
    url = 'https://e2vkze71o8.execute-api.us-east-1.amazonaws.com/prod/charge-request-redis' 
    headers = {'Content-Type': 'application/json'}
    
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    
    return response.json()


# Define your payloads here
payloads = [ 
    {"serviceType": "voice",  "unit": 2},
    {"serviceType": "voice",  "unit": 3},
    {"serviceType": "voice",  "unit": 4},
    {"serviceType": "voice",  "unit": 5},
    {"serviceType": "voice",  "unit": 2},
    {"serviceType": "voice",  "unit": 4},
    {"serviceType": "voice",  "unit": 4},
    {"serviceType": "voice",  "unit": 2},
    # more payloads...
]

with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
    futures = {executor.submit(make_request, payload): payload for payload in payloads}

    for future in concurrent.futures.as_completed(futures):
        payload = futures[future]
        try:
            data = future.result()
            print(f"Payload: {payload}, Result: {data}")
        except Exception as exc:
            print(f"Payload: {payload}, generated an exception: {exc}")
