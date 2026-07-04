# 学習ログ

このファイルでは、CDK学習リポジトリの学習ステップを記録します。

コードの具体的な差分はPRとcommit履歴で確認し、このファイルでは各ステップの目的、追加内容、確認観点、次に進む前の理解ポイントを整理します。

## Step 0: Repository setup

### 目的

CDK学習用リポジトリの土台を作成する。

PR単位を学習単位として扱い、以降の変更履歴を追いやすくする。

### 追加するもの

- `README.md`
- `docs/learning-log.md`
- `.gitignore`

### 確認すること

- publicリポジトリで扱わない情報が明記されていること
- 今後の学習ステップが見えること
- CDKコードやGitHub Actionsがまだ追加されていないこと

### 次に進む前の理解ポイント

- READMEは現在のリポジトリの概要を示す
- 学習ログは学習の遍歴を示す
- PR単位を学習単位にすると、squash merge後のmain履歴が読みやすくなる

## Step 1: EC2 with SSM access

### 目的

SSHを開けずに、SSM Session ManagerでEC2へ接続する最小構成をCDKで作成する。

### 追加するもの

- TypeScript CDKアプリ
- VPC
- Public Subnet
- EC2 Instance
- EC2用IAM Role
- `AmazonSSMManagedInstanceCore`
- inbound ruleなしのSecurity Group

### 確認すること

- EC2にSSH inbound ruleがないこと
- EC2にSSM用IAM Roleが付いていること
- Amazon Linux 2023など、SSM Agentを利用しやすいAMIを使っていること

### 次に進む前の理解ポイント

- SSH接続とSSM接続の違い
- Security Groupのinbound ruleの意味
- EC2用IAM Roleの役割
- Public Subnetに置く理由と限界

## Step 2: Pre-deploy tests with CDK assertions

### 目的

AWSへデプロイする前に、生成されるCloudFormationテンプレートが意図通りかをテストする。

### 追加するもの

- CDK assertionsを使ったテストコード
- EC2の数を確認するテスト
- SSH inbound ruleがないことを確認するテスト
- SSM用IAMポリシーが付いていることを確認するテスト

### 確認すること

- `npm test` が成功すること
- fine-grained assertionsで守りたい構成を検査できていること
- snapshot testsは初期段階では入れていないこと

### 次に進む前の理解ポイント

- `cdk synth`とCDK assertionsの違い
- fine-grained assertionsの役割
- デプロイ前テストで確認できることと確認できないこと

## Step 3: GitHub Actions CI

### 目的

Pull RequestごとにCDKコードのデプロイ前チェックを自動実行する。

### 追加するもの

- GitHub Actions workflow
- `npm ci`
- `npm run build`
- `npm test`
- `npx cdk synth`

### 確認すること

- PR作成時にCIが実行されること
- AWS認証を使わずにCIが完結していること
- `cdk deploy` が含まれていないこと

### 次に進む前の理解ポイント

- CIとデプロイの違い
- publicリポジトリでAWS認証を扱うリスク
- まずデプロイ前テストだけを自動化する理由

## Step 4: Private Subnet化

### 目的

EC2をPrivate Subnetに配置する構成を学ぶ。

### 追加するもの

- Private Subnet
- EC2のSubnet配置変更
- 必要に応じた外向き通信の設計

### 確認すること

- EC2がPublic SubnetではなくPrivate Subnetに配置されていること
- 直接インターネットから到達できない構成になっていること
- SSM接続に必要な通信経路が確保されていること

### 次に進む前の理解ポイント

- Public SubnetとPrivate Subnetの違い
- NAT Gatewayの役割と課金
- Private Subnet上のEC2を管理する方法

## Step 5: VPC Endpoint追加

### 目的

NAT Gatewayを使わずに、SSM接続に必要なAWSサービスへ到達する構成を学ぶ。

### 追加するもの

- Interface VPC Endpoint
- SSM用Endpoint
- EC2 Messages用Endpoint
- SSM Messages用Endpoint
- Endpoint用Security Group

### 確認すること

- SSM接続に必要なEndpointが作成されていること
- Private Subnet上のEC2からSSM接続できる構成になっていること
- 不要なinbound ruleが増えていないこと

### 次に進む前の理解ポイント

- VPC Endpointの役割
- NAT Gatewayとの違い
- Endpoint用Security Groupの考え方

## Step 6: ECR / ECS on EC2 への拡張

### 目的

EC2単体構成から、コンテナ実行基盤へ拡張する流れを学ぶ。

### 追加するもの

- ECR Repository
- ECS Cluster
- ECS on EC2用Auto Scaling Group
- ECS Task Definition
- ECS Service
- CloudWatch Logs

### 確認すること

- ECRにイメージを置く前提が整理されていること
- ECS on EC2で必要なIAM Roleが分かれていること
- EC2単体構成からECS構成への責務の変化が説明できること

### 次に進む前の理解ポイント

- EC2単体運用とECS運用の違い
- ECRの役割
- ECS Cluster / Task Definition / Serviceの関係
- ECS on EC2でCDKが管理する範囲
