package `in`.jembeeplay.tv

import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.foundation.layout.fillMaxSize

@Composable
internal fun TvLearningScreen() {
    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = false
                settings.allowContentAccess = false
                settings.mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
                isFocusable = true
                isFocusableInTouchMode = true
                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                        val uri = request.url
                        val allowedHost = uri.scheme == "https" && uri.host == "jembeeplay.in"
                        val allowedPath = uri.path == "/learn/school" || uri.path.startsWith("/learn/school/") ||
                            uri.path == "/videos" || uri.path == "/shorts"
                        return !(allowedHost && allowedPath)
                    }
                }
                loadUrl("https://jembeeplay.in/learn/school")
                requestFocus()
            }
        }
    )
}
