## Example
This example deploys a microservice with an API Gateway which uses an Amazon Cognito user pool as an authoriser. 

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
5. Open the Jupyter Notebook in the **client directory** follow the instructions and execute the query.

6. Check the dynamoDB table to view the records

## Cleanup Commands
1. Execute command: **cdk destroy**