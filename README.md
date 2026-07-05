# CDK学習リポジトリ

このリポジトリは、AWS CDKを段階的に学習するためのpublicリポジトリです。

CDKのリポジトリ構成、Stack / Construct / IAM / VPC / EC2 などのコード粒度、デプロイ前テスト、GitHub ActionsでのCIを、小さい構成から順番に確認していきます。

## 学習方針

このリポジトリでは、PR単位を学習単位として扱います。

基本的にPRはsquash mergeする想定です。PR内のcommit数ではなく、`main`に取り込まれた後の1 commitが1つの学習ステップとして読めることを重視します。

## 現在のAWS構成

EC2をPrivate Isolated Subnetに配置する構成です。

```text
VPC
├── Public Subnet
└── Private Isolated Subnet
    └── EC2
        ├── inbound ruleなしのSecurity Group
        ├── EC2用IAM Role
        └── AmazonSSMManagedInstanceCore
```

Step 4では、EC2の配置先をPrivate Subnetへ変更します。

この時点ではAWS認証なしのデプロイ前チェックまでを対象とし、実際のSSM接続に必要な通信経路は次のStepでVPC Endpointとして追加します。

## 命名方針

CDKコード上の名前は、主要リソースを基準に短くします。

- Stackクラス名: `Ec2Stack`
- Stack ID: `Ec2Stack`
- Stackファイル名: `lib/ec2-stack.ts`
- EC2のNameタグ: `cdk-learning-ec2`

## リポジトリ構成

```text
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── bin/
│   └── cdk-learning.ts
├── lib/
│   └── ec2-stack.ts
├── test/
│   └── ec2-stack.test.ts
├── docs/
│   └── learning-log.md
├── cdk.json
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## CDK構成

`lib/ec2-stack.ts` では、以下を定義しています。

- VPC
- Public Subnet
- Private Isolated Subnet
- EC2 Instance
- inbound ruleなしのSecurity Group
- EC2用IAM Role
- `AmazonSSMManagedInstanceCore`
- Amazon Linux 2023 AMI
- `t3.micro`

## デプロイ前テスト

`test/ec2-stack.test.ts` では、CDK assertionsを使って生成されるCloudFormationテンプレートを検査します。

確認する主な内容は以下です。

- EC2 Instanceが1つ作成されること
- Subnetが2つ作成されること
- Security Groupにinbound ruleを追加していないこと
- EC2用IAM RoleにSSM用Managed Policyが付いていること

EC2の配置先は、`lib/ec2-stack.ts` の `vpcSubnets` で確認します。

## ローカル確認コマンド

依存関係をインストールします。

```bash
npm install
```

TypeScriptをビルドします。

```bash
npm run build
```

CDK assertionsのテストを実行します。

```bash
npm test
```

CloudFormationテンプレートを生成します。

```bash
npx cdk synth
```

## CI

GitHub Actionsで、Pull Request作成時とmainへのpush時にデプロイ前チェックを実行します。

実行するコマンドは以下です。

```text
npm install
npm run build
npm test
npx cdk synth
```

このCIではAWS認証情報を使わず、`cdk deploy` も実行しません。

## publicリポジトリで扱わない情報

このリポジトリはpublicです。実環境の識別情報、認証情報、秘密鍵、環境変数ファイル、実環境固有の設定値はコミットしません。

IPアドレスやCIDRが必要な場合は、ドキュメント用の例示値を使用します。

## 学習履歴

学習ステップの履歴は [`docs/learning-log.md`](docs/learning-log.md) に記録します。
