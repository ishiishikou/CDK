import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Ec2Stack } from '../lib/ec2-stack';

const createTemplate = (): Template => {
  const app = new cdk.App();
  const stack = new Ec2Stack(app, 'TestEc2Stack');

  return Template.fromStack(stack);
};

describe('Ec2Stack', () => {
  test('creates one EC2 instance', () => {
    const template = createTemplate();

    template.resourceCountIs('AWS::EC2::Instance', 1);
  });

  test('creates two subnets', () => {
    const template = createTemplate();

    template.resourceCountIs('AWS::EC2::Subnet', 2);
  });

  test('creates three interface VPC endpoints for SSM access', () => {
    const template = createTemplate();

    template.resourceCountIs('AWS::EC2::VPCEndpoint', 3);
  });

  test('allows HTTPS from the EC2 security group to the endpoint security group', () => {
    const template = createTemplate();

    template.hasResourceProperties('AWS::EC2::SecurityGroupIngress', {
      IpProtocol: 'tcp',
      FromPort: 443,
      ToPort: 443,
    });
  });

  test('does not allow SSH inbound access', () => {
    const template = createTemplate();

    const sshInboundRules = template.findResources('AWS::EC2::SecurityGroupIngress', {
      Properties: {
        IpProtocol: 'tcp',
        FromPort: 22,
        ToPort: 22,
      },
    });

    expect(Object.keys(sshInboundRules)).toHaveLength(0);
  });

  test('attaches the SSM managed policy to the EC2 role', () => {
    const template = createTemplate();

    template.hasResourceProperties('AWS::IAM::Role', {
      ManagedPolicyArns: Match.arrayWith([
        {
          'Fn::Join': [
            '',
            [
              'arn:',
              {
                Ref: 'AWS::Partition',
              },
              ':iam::aws:policy/AmazonSSMManagedInstanceCore',
            ],
          ],
        },
      ]),
    });
  });
});
