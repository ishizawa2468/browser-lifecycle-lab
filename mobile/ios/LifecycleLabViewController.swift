import UIKit
import WebKit

/// docs/webview-testing-1.md の WKWebView サンプルをベースにした ViewController。
/// http://<開発PCのIP>:3000 で動作する Vite 開発サーバーにアクセスします。
final class LifecycleLabViewController: UIViewController {
    private let webView = WKWebView(frame: .zero)

    override func loadView() {
        view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        guard let url = URL(string: "http://<開発PCのIP>:3000") else {
            assertionFailure("開発サーバーの URL が不正です")
            return
        }

        webView.load(URLRequest(url: url))
    }
}
