#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CognitoAuthJwtStack } from '../lib/cognito_auth_jwt-stack';

const app = new cdk.App();
new CognitoAuthJwtStack(app, 'CognitoAuthJwtStack');
