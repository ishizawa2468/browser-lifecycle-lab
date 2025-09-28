# Android WebView サンプル

## プロジェクト構成

```
android/
└── app/
    └── src/
        └── main/
            └── java/
                └── com/
                    └── example/
                        └── lifecyclelab/
                            └── LifecycleLabActivity.kt
```

Android Studio で新規プロジェクトを作成し、この `LifecycleLabActivity.kt` を配置すれば、docs の手順通りに Lifecycle Lab を WebView で読み込めます。

## 必要な設定

`AndroidManifest.xml` に以下の Activity を追加し、インターネットアクセスのパーミッションを忘れずに付与してください。

```xml
<manifest ...>
    <uses-permission android:name="android.permission.INTERNET" />

    <application ...>
        <activity android:name=".LifecycleLabActivity">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

必要に応じて `setDomStorageEnabled(true)` などの設定を `WebSettings` に追加してください。
