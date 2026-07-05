import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Ec2Stack } from '../lib/ec2-stack';

type TemplateResource = {
  Type?: string;
  Properties?: {
    Tags?: Array<{
      Key?: string;
      Value?: string;
    }>;
  };
};

const createTemplate = (): Template => {
  const app = new cdk.App();
  const stack = new Ec2Stack(app, 'TestEc2Stack');

  return Template.fromStack(stack);
};

const findSubnetLogicalIdsByName = (template: Template, subnetName: string): string[] => {
  const resources = template.toJSON().Resources as Record<string, TemplateResource>;

  return Object.entries(resources)
    .filter(([, resource]) => {
      return (
        resource.Type === 'AWS::EC2::Subnet' &&
        resource.Properties?.Tags?.some((tag) => {
          return tag.Key === 'aws-cdk:subnet-name' && tag.Value === subnetName;
        })
      );
    })
    .map(([logicalId]) => logicalId);
};

describe('Ec2Stack', () => {
  test('creates one EC2 instance', () => {
    const template = createTemplate();

    template.resourceCountIs('AWS::EC2::Instance', 1);
  });

  test('creates one public subnet and one private subnet', () => {
    const template = createTemplate();

    expect(findSubnetLogicalIdsByName(template, 'public')).toHaveLength(1);
    expect(findSubnetLogicalIdsByName(template, 'private')).toHaveLength(1);
  });

  test('places the EC2 instance in the private subnet', () => {
    const template = createTemplate();
    const privateSubnetLogicalIds = findSubnetLogicalIdsByName(template, 'private');

    expect(privateSubnetLogicalIds).toHaveLength(1);
    template.hasResourceProperties('AWS::EC2::Instance', {
      SubnetId: {
        Ref: privateSubnetLogicalIds[0],
      },
    });
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
