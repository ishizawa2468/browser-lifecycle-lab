package com.example.lifecyclelab

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

/**
 * docs/webview-testing-1.md の最小実装例を元にしたサンプル Activity。
 * Vite の開発サーバー (http://<PCのIP>:3000) を読み込むことを想定しています。
 */
class LifecycleLabActivity : AppCompatActivity() {
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val webView = WebView(this)
        setContentView(webView)

        val settings: WebSettings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true

        webView.webViewClient = WebViewClient()
        webView.loadUrl("http://<開発PCのIP>:3000")
    }
}
