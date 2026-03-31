import json
import os
import boto3

neptune_endpoint = os.environ['neptunedb']
neptune_port = int(os.environ.get('neptunedb_port', '8182'))
neptune_region = os.environ.get('neptune_region', os.environ.get('AWS_REGION'))

client = boto3.client('neptunedata',
    endpoint_url=f'https://{neptune_endpoint}:{neptune_port}',
    region_name=neptune_region)

def lambda_handler(event, context):
    actor_name = event['queryStringParameters']['actor']

    query = (
        f"g.V().has('name','{actor_name}')"
        f".repeat(in('actor','actress').out('actor','actress').simplePath())"
        f".until(has('name','Kevin Bacon'))"
        f".path().by('name').by('title').limit(10)"
    )

    response = client.execute_gremlin_query(gremlinQuery=query)
    paths = response.get('result', {}).get('data', {}).get('@value', [])

    to_return = {}
    for count, path in enumerate(paths):
        steps = path.get('@value', {}).get('objects', {}).get('@value', [])
        to_return[count] = {
            f'step{i}': step for i, step in enumerate(steps)
        }

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True
        },
        'body': json.dumps(to_return)
    }
