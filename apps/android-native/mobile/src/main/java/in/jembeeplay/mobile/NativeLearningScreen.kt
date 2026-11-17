package `in`.jembeeplay.mobile

import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

private const val LEARNING_URL = "https://jembeeplay.in/learn/school"

@Composable
internal fun NativeLearningScreen() {
    var webView by remember { mutableStateOf<WebView?>(null) }
    var canGoBack by remember { mutableStateOf(false) }

    BackHandler(enabled = canGoBack) {
        webView?.goBack()
        canGoBack = webView?.canGoBack() == true
    }

    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = false
                settings.allowContentAccess = false
                settings.mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                        val uri = request.url
                        val allowedHost = uri.scheme == "https" && uri.host == "jembeeplay.in"
                        val path = uri.path.orEmpty()
                        val allowedPath = path == "/learn/school" || path.startsWith("/learn/school/") ||
                            path == "/videos" || path == "/shorts"
                        return !(allowedHost && allowedPath)
                    }

                    override fun onPageFinished(view: WebView, url: String?) {
                        canGoBack = view.canGoBack()
                    }
                }
                webView = this
                loadUrl(LEARNING_URL)
            }
        },
        update = { webView = it }
    )

    DisposableEffect(Unit) {
        onDispose {
            webView?.stopLoading()
            webView?.destroy()
            webView = null
        }
    }
}
