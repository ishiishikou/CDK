# CDK学習リポジトリ

このリポジトリは、AWS CDKを段階的に学習するためのpublicリポジトリです。

CDKのリポジトリ構成、Stack / Construct / IAM / VPC / EC2 などのコード粒度、デプロイ前テスト、GitHub ActionsでのCIを、小さい構成から順番に確認していきます。

## 学習方針

このリポジトリでは、PR単位を学習単位として扱います。

基本的にPRはsquash mergeする想定です。PR内のcommit数ではなく、`main`に取り込まれた後の1 commitが1つの学習ステップとして読めることを重視します。

## 最初に作る予定のAWS構成

最初のCDK構成では、SSHを開けずにSSM Session ManagerでEC2へ接続する構成を作成する予定です。

想定する最小構成は以下です。

```text
VPC
└── Public Subnet
    └── EC2
        ├── SSH inbound rule なし
        ├── EC2用IAM Role
        └── AmazonSSMManagedInstanceCore
```

最初からPrivate Subnet構成にはせず、まずはSSM接続に必要な要素を理解することを優先します。

## テスト方針

GitHub Actionsでは、まずデプロイ前テストだけを行います。

初期段階では、以下のような確認を想定しています。

- CDKコードがビルドできること
- CDK assertionsによるfine-grained assertionsが通ること
- `cdk synth`でCloudFormationテンプレートを生成できること

デプロイ用のAWS認証、OIDC設定、`cdk deploy` は初期段階では入れません。

## publicリポジトリで扱わない情報

このリポジトリはpublicです。実環境の識別情報、認証情報、秘密鍵、`.env`、実環境固有の設定値はコミットしません。

IPアドレスやCIDRが必要な場合は、ドキュメント用の例示値を使用します。

## 学習履歴

学習ステップの履歴は [`docs/learning-log.md`](docs/learning-log.md) に記録します。
