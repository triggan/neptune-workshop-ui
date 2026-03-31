TEMPLATE := neptunews-api-lambda.yaml
STACK_NAME ?= neptune-workshop
SAM_REGION := $(if $(AWS_REGION),--region $(AWS_REGION),)

.PHONY: build deploy sync all local-api local-dev clean

# Build Lambda via SAM and React front-end
build:
	sam build --template-file $(TEMPLATE)
	cd website && npm install && npm run build

# Deploy infrastructure (uses samconfig.toml if present, otherwise prompts for params)
deploy: build
	sam deploy --template-file $(TEMPLATE) --stack-name $(STACK_NAME) --capabilities CAPABILITY_IAM --resolve-s3 $(SAM_REGION) --guided

# Write api.json with the deployed API Gateway URL, then sync to S3
sync:
	$(eval API_URL := $(shell aws cloudformation describe-stacks --stack-name $(STACK_NAME) $(SAM_REGION) --query 'Stacks[0].Outputs[?OutputKey==`workshopAPI`].OutputValue' --output text))
	$(eval BUCKET := $(shell aws cloudformation describe-stacks --stack-name $(STACK_NAME) $(SAM_REGION) --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucket`].OutputValue' --output text))
	@echo '{"APIPATH": "$(API_URL)"}' > website/build/api.json
	aws s3 sync website/build/ s3://$(BUCKET)/ $(SAM_REGION)

# Full deploy: infrastructure + website content
all: deploy sync
	$(eval URL := $(shell aws cloudformation describe-stacks --stack-name $(STACK_NAME) $(SAM_REGION) --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' --output text))
	@echo "\nDeployment complete: $(URL)"

# Start local API Gateway for development (port 3001 so React can use 3000)
local-api:
	sam build --template-file $(TEMPLATE)
	sam local start-api --template-file $(TEMPLATE) --port 3001 --env-vars env.json

# Start both the React dev server and SAM local API
local-dev:
	cd website && npm install &
	sam build --template-file $(TEMPLATE)
	sam local start-api --template-file $(TEMPLATE) --port 3001 --env-vars env.json &
	@echo "Waiting for SAM local API to be ready..."
	@until curl -s -o /dev/null http://127.0.0.1:3001 2>/dev/null; do sleep 1; done
	cd website && PORT=3000 npm start

# Clean build artifacts
clean:
	rm -rf .aws-sam website/build website/node_modules
