import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class SsmEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    const securityGroup = new ec2.SecurityGroup(this, 'InstanceSecurityGroup', {
      vpc,
      allowAllOutbound: true,
      description: 'Security group for SSM-only EC2 access. No inbound rules are added.',
    });

    const role = new iam.Role(this, 'InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'IAM role for EC2 access through AWS Systems Manager Session Manager.',
    });

    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
    );

    const instance = new ec2.Instance(this, 'Instance', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      instanceType: new ec2.InstanceType('t3.micro'),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup,
      role,
    });

    cdk.Tags.of(instance).add('Name', 'cdk-learning-ssm-ec2');

    new cdk.CfnOutput(this, 'InstanceId', {
      value: instance.instanceId,
      description: 'EC2 instance ID for Session Manager connection.',
    });
  }
}
