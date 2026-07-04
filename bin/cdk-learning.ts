#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SsmEc2Stack } from '../lib/ssm-ec2-stack';

const app = new cdk.App();

new SsmEc2Stack(app, 'CdkLearningSsmEc2Stack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
