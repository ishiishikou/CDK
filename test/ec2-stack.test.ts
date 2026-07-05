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

  test('does not add inbound rules to the security group', () => {
    const template = createTemplate();

    template.resourceCountIs('AWS::EC2::SecurityGroupIngress', 0);
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupIngress: Match.absent(),
    });
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
