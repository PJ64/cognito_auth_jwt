## Example
This example deploys a microservice with an API Gateway which uses an Amazon Cognito user pool as an authoriser. The POST method on the API Gateway allows authenticated requests only. 

1. The first script is the json formatter, it is used to render json in a readable format.

2. The second script creates a new Cognito user, the user will need to be confirmed.

3. The login in script authenticates the new user and cognito will return a json web token (jwt)

4. The jwt IdToken is passed to the API Gateway when called the post method. The API Gateway will validate the IdToken against the Cognito user pool that generated it. This is done using an 'Authorizer'.

5. The final script calls an unauthenticated GET method to retrieve the item.


![architecture](./images/architecture_1.png "Architecture")

## Setup

1. The following prerequisities are required for this example
  
```bash
npm install -g typescript
npm install -g aws-cdk
```

Install Jupyter Notebook following instructions on this ['site'](https://jupyter.org/install).

2. Since this CDK project uses ['Assests'](https://docs.aws.amazon.com/cdk/latest/guide/assets.html), you might need to run the following command to provision resources the AWS CDK will need to perform the deployment.

```bash 
cdk bootstrap
```

2. Install the dependencies

```bash
npm install
```

3. Execute **cdk synth** to synthesize as AWS CloudFormation template

```bash
cdk synth
```

4. Execute **cdk deploy** to deploy the template and build the stack

```bash
cdk deploy
```
1. Open the Jupyter Notebook in the **jupyter_notebook directory** follow the instructions.

## Cleanup Commands
1. Execute command: **cdk destroy**