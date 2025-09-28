# iOS WKWebView サンプル

## プロジェクト構成

```
ios/
├── LifecycleLabViewController.swift
└── README.md
```

Xcode で Single View App を作成し、この `LifecycleLabViewController.swift` をプロジェクトに追加したうえでルート ViewController として利用してください。

## 必要な設定

- `Info.plist` に `NSAppTransportSecurity` > `NSAllowsArbitraryLoads` を追加するか、HTTPS でアクセスできるようにします。
- 実機デバッグ時は Mac の Safari で **開発** メニューを開き、デバイス配下の WKWebView を選択してデバッグできます。
