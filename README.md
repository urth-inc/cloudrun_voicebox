# CloudRun VOICEVOX

GCP CloudRunで[VOICEVOX](https://voicevox.hiroshiba.jp/)を実行させてみるサンプルプロジェクトです。

## ローカルで試してみる

```sh
docker compose build
docker compose up
```

http://localhost:3000/ にアクセスしてください。


## ソフトウェア構成
* 音声合成
  * [VOICEVOX Engine(Docker)](https://hub.docker.com/r/voicevox/voicevox_engine)
* アプリケーション
  * Node.js 20

