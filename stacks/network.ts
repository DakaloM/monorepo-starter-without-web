import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { StackContext } from 'sst/constructs';

export function Network({ stack, app }: StackContext) {
  const vpc = new ec2.Vpc(stack, 'vpc', {
    ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
    natGateways: 0,
    maxAzs: 3,
    vpcName: app.logicalPrefixedName('vpc'),
    subnetConfiguration: [{ name: 'public', cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC }],
  });

  const securityGroup = new ec2.SecurityGroup(stack, 'security-group', {
    vpc,
    securityGroupName: app.logicalPrefixedName('security-group'),
    allowAllOutbound: true,
  });

  securityGroup.addIngressRule(
    ec2.Peer.anyIpv4(),
    ec2.Port.tcp(80),
    'allow HTTP traffic from anywhere',
  );

  securityGroup.addIngressRule(
    ec2.Peer.anyIpv4(),
    ec2.Port.tcp(443),
    'allow HTTP traffic from anywhere',
  );

  securityGroup.addIngressRule(
    ec2.Peer.anyIpv4(),
    ec2.Port.tcp(22),
    'allow SSH access from anywhere',
  );

  return {
    vpc,
    securityGroup,
  };
}
