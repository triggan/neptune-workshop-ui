
# Create a Web Front-End for Your Graph Application

## Description

The following guide takes you through deploying a static website that leverages an API to make graph traversals against a graph hosted in an Amazon Neptune cluster.  This portion of the workshop will leverage S3 as the store for the static web content.  It will also use API Gateway and Lambda to create an API to query Neptune.  The Lambda function will reside in the same VPC as the Amazon Neptune cluster, allowing the Gremlin client within Lambda to access the graph.

## Prep Work

This web application will be deployed in high level tasks:
- Collecting some configurables from the previously deployed CloudFormation templates used in the earlier portions of the workshop.
- Deploying the API Gateway and Lambda function using a CloudFormation template.
- Launching a React.js based application hosted on S3 that uses the backend API to query Neptune.

### Data Collection - Previous CloudFormation Templates

Before we proceed with launching the API Gateway and Lambda function used to query Neptune, we need to collect some information regarding the existing configuration.  Follow these steps:

1.  While logged into the same AWS account used in the earlier portions of the workshop, browse to the CloudFormation Console.  Find the Launched CloudFormation Template that includes "NeptuneBaseStack" in its name.
2. Highlight the row associated with the "NeptuneBaseStack" deployment.  Then click on the Outputs tab at the bottom half of the screen.  Find the following resources and note their values (copy and paste into a text doc):
a.  VPC
b.  DBClusterEndpoint
c.  PublicSubnet1
d.  PublicSubnet2
e.  PublicSubnet3
f.  NeptuneSG
Each of these will be used as inputs or configurables when we launch the CloudFormation stack to deploy an API Gateway and Lambda function.

### Deploy API Gateway and Lambda Function

We will use a CloudFormation template to create an API Gateway deployment and Lambda function to query our Neptune graph database.  Click on the link below to deploy the template.  Be sure to deploy the template into the same region used in the earlier portions of the workshop (eu-central-1).

1. Click on the following link to deploy the CloudFormation template:  [Graph App Backend](https://eu-central-1.console.aws.amazon.com/cloudformation/home?region=eu-central-1#/stacks/create/review?templateURL=https://s3.eu-central-1.amazonaws.com/cloudwreck-neptunews-content/artifacts/neptunews-api-lambda.yaml)
2. Use the a-e configurables from above to fill out the parameters to deploy the stack.  NOTE:  All three subnets will go in the same field, just select all three that were previously used.
3. After the stack has deployed, click on the Resources tab at the bottom half of the CloudFormation console (while highlighting the row associated with your new API Gateway/Lambda stack).  Find the Resource called workshopAPI.  Note the value next to this resource (to be used in next section).

### Create a Static Website

Lastly, we will deploy a static website to Amazon S3 to complete the front end for this application.  This application was built using the Facebook create-react-app library.  The code for the application can be found [here](https://github.com/triggan/neptune-workshop-ui/tree/master/website).  However, we are only going to deploy the compiled version (webpack'd version) of the application in the sake of time.  Complete the following steps to complete this deployment:

1. Download the website content files from the link here: [Graph Front-End Content](https://github.com/triggan/neptune-workshop-ui/blob/master/website.zip)
2. Create an S3 bucket in the EU Frankfurt region (eu-central-1).  (Be sure to use a globally unique name.)
3. Configure this bucket to host a static S3 website.
a. Open the bucket settings by clicking on the bucket name in the S3 console.
b. Click on the Properties tab.
c. Click on the Static Website Hosting settings.
d. Choose to 'Use this bucket to host a website.'
e. In the Index Document field, type 'index.html'
f. Note the S3 website URL at the top of the dialog box (save this for later.)
g. Click Save
4. As of a few weeks ago, AWS has added some additional features to make sure customers are aware when they are making an S3 bucket (or its content) available via public access.  We'll need to turn off these settings before we can make the content of this bucket public.
a. In the S3 console for your S3 bucket, click on the Permissions tab.  
b. The first section that should load will be the Public Access Settings.  Click on the Edit link on the right side of the page.  
c. Under the 'Manage public access control lists (ACLs) for this bucket' settings, remove the check boxes for both 'Block new public ACLs and uploading public objects' and 'Remove public access granted through public ACLs'.
d. Click on the Save button on the right hand side of the page.
5. Unzip the content from the zip file that you downloaded in step 1.  
6. Find the file called api.json from the unzipped files.
7. Open the api.json file with a text editor.
8. In the section where you should enter your API Gateway URL, enter a URL in the following format (using the API Gateway ID that was noted in the previous section):
```
Example:  API Gateway ID of qrqz67ab15

Be sure your api.json file looks like:
{
    "APIPATH": "http://qrqz67ab15.execute-api.eu-central-1.amazonaws.com/Prod"
}
```
9. Save the changes to this file.
10. Upload the entire contents from the zip file to your S3 bucket.  Either during the upload or after upload, mark all of the objects to be publically readable.
11. Using the S3 website URL noted in step 3f, browse to this URL.  You should see your new application.
12. Attempt to enter actors such as 'Jack Nicholson', 'Tom Cruise', or 'Robert Dinero' in the actor field.  You should see both the graph travrersal that is being used and the results of the traversal (An array of paths from this particular actor to Kevin Bacon in the form of actor->movie->actor->(movie->actor) ).

## Review

In review, we deployed a new API Gateway and Lambda function that has direct access to the graph database hosted in Amazon Neptune.  We also deployed a React.js web front-end that leverages this API Gateway and Lambda.

## Next Steps

Attempt to use the example here to build new functionality into this application or other use cases.  Many applciations may have dozens of API calls with many different Lambda functions with different graph traversals in each Lambda function.  You can also use Lambda to load data into the graph database using g.addV(), g.addE(), or g.V().property() traversals.

