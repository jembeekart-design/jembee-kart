package `in`.jembeeplay.mobile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.google.firebase.auth.FirebaseAuth
import org.json.JSONObject

private data class NativeSavedVideo(val id: String, val caption: String, val creator: String)

@Composable
internal fun NativeSavedVideosPanel(auth: FirebaseAuth) {
    var items by remember { mutableStateOf<List<NativeSavedVideo>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf("Loading saved videos…") }
    var reload by remember { mutableStateOf(0) }

    LaunchedEffect(auth.currentUser?.uid, reload) {
        val user = auth.currentUser
        if (user == null) {
            items = emptyList()
            message = "Sign in to see your saved videos."
            loading = false
        } else {
            loading = true
            message = "Loading saved videos…"
            user.getIdToken(false).addOnCompleteListener { tokenTask ->
                val token = tokenTask.result?.token
                if (!tokenTask.isSuccessful || token.isNullOrBlank()) {
                    loading = false
                    message = "Please sign in again, then retry."
                } else {
                    Thread {
                        val result = runCatching {
                            val connection = java.net.URL("https://jembeeplay.in/api/app/library/saved").openConnection() as java.net.HttpURLConnection
                            try {
                                connection.requestMethod = "GET"
                                connection.connectTimeout = 7000
                                connection.readTimeout = 10000
                                connection.setRequestProperty("Authorization", "Bearer $token")
                                connection.setRequestProperty("Accept", "application/json")
                                check(connection.responseCode in 200..299) { "Request failed" }
                                val body = connection.inputStream.bufferedReader().use { it.readText() }
                                check(body.length <= 512 * 1024) { "Response too large" }
                                val root = JSONObject(body)
                                check(root.optBoolean("success")) { "Saved videos unavailable" }
                                val array = root.optJSONArray("videos") ?: org.json.JSONArray()
                                (0 until array.length()).mapNotNull { index ->
                                    val video = array.optJSONObject(index) ?: return@mapNotNull null
                                    val id = video.optString("id")
                                    if (id.isBlank()) null else NativeSavedVideo(
                                        id.take(160),
                                        video.optString("caption").take(300).ifBlank { "Saved video" },
                                        video.optString("displayName").take(120).ifBlank { video.optString("username").take(80) }
                                    )
                                }
                            } finally {
                                connection.disconnect()
                            }
                        }
                        android.os.Handler(android.os.Looper.getMainLooper()).post {
                            result.onSuccess {
                                items = it
                                message = if (it.isEmpty()) "No saved videos yet." else ""
                            }.onFailure {
                                message = "Saved videos could not load. Tap retry."
                            }
                            loading = false
                        }
                    }.start()
                }
            }
        }
    }

    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text("Saved videos")
        if (loading) CircularProgressIndicator()
        else if (message.isNotBlank()) {
            Text(message)
            if (message.contains("retry", ignoreCase = true)) {
                TextButton(onClick = { reload++ }) { Text("Retry") }
            }
        } else {
            LazyColumn {
                items(items, key = { it.id }) { video ->
                    Column(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)) {
                        Text(video.caption)
                        if (video.creator.isNotBlank()) Text(video.creator)
                    }
                }
            }
        }
    }
}


@Composable
internal fun NativeSaveVideoButton(videoId: String) {
    var busy by remember(videoId) { mutableStateOf(false) }
    var saved by remember(videoId) { mutableStateOf(false) }
    var message by remember(videoId) { mutableStateOf<String?>(null) }
    TextButton(
        enabled = !busy && !saved,
        onClick = {
            val user = FirebaseAuth.getInstance().currentUser
            if (user == null) {
                message = "Sign in to save this video."
            } else {
                busy = true
                user.getIdToken(false).addOnCompleteListener { tokenTask ->
                    val token = tokenTask.result?.token
                    if (!tokenTask.isSuccessful || token.isNullOrBlank()) {
                        busy = false
                        message = "Please sign in again."
                    } else {
                        Thread {
                            val result = runCatching {
                                val connection = java.net.URL("https://jembeeplay.in/api/app/library/saved").openConnection() as java.net.HttpURLConnection
                                try {
                                    connection.requestMethod = "POST"
                                    connection.connectTimeout = 7000
                                    connection.readTimeout = 10000
                                    connection.doOutput = true
                                    connection.setRequestProperty("Authorization", "Bearer $token")
                                    connection.setRequestProperty("Content-Type", "application/json")
                                    connection.outputStream.use { it.write(JSONObject().put("videoId", videoId).toString().toByteArray(Charsets.UTF_8)) }
                                    check(connection.responseCode in 200..299) { "Save failed" }
                                    JSONObject(connection.inputStream.bufferedReader().use { it.readText() }).optBoolean("saved")
                                } finally {
                                    connection.disconnect()
                                }
                            }
                            android.os.Handler(android.os.Looper.getMainLooper()).post {
                                result.onSuccess {
                                    saved = it
                                    message = if (it) "Saved to Library" else "Could not save. Retry."
                                }.onFailure {
                                    message = "Could not save. Please retry."
                                }
                                busy = false
                            }
                        }.start()
                    }
                }
            }
        }
    ) {
        Text(when { busy -> "Saving…"; saved -> "Saved ✓"; else -> "＋ Save" })
    }
    message?.let { Text(it, color = androidx.compose.ui.graphics.Color.Gray) }
}
