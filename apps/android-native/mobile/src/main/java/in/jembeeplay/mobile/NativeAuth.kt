package `in`.jembeeplay.mobile

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser

@Composable
internal fun NativeAuthPanel() {
    val auth = remember { FirebaseAuth.getInstance() }
    var user by remember { mutableStateOf<FirebaseUser?>(auth.currentUser) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var createAccount by remember { mutableStateOf(false) }
    var busy by remember { mutableStateOf(false) }
    var message by remember { mutableStateOf<String?>(null) }

    DisposableEffect(auth) {
        val listener = FirebaseAuth.AuthStateListener { user = it.currentUser }
        auth.addAuthStateListener(listener)
        onDispose { auth.removeAuthStateListener(listener) }
    }

    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 18.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("JEMBEE PLAY account")
        if (user != null) {
            Text("Signed in as ${user?.email ?: "JEMBEE PLAY user"}")
            Button(
                onClick = { auth.signOut(); message = "Signed out successfully." },
                enabled = !busy
            ) { Text("Sign out") }
            NativeSavedVideosPanel(auth)
            NativeWatchHistoryPanel(auth)
        } else {
            Text(if (createAccount) "Create your account with email" else "Sign in with email")
            OutlinedTextField(
                value = email,
                onValueChange = { email = it; message = null },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Email") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
            )
            OutlinedTextField(
                value = password,
                onValueChange = { password = it; message = null },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Password (minimum 6 characters)") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
            )
            Button(
                onClick = {
                    val cleanEmail = email.trim()
                    if (cleanEmail.isBlank() || password.length < 6) {
                        message = "Enter a valid email and a password with at least 6 characters."
                    } else {
                        busy = true
                        message = null
                        val task = if (createAccount) {
                            auth.createUserWithEmailAndPassword(cleanEmail, password)
                        } else {
                            auth.signInWithEmailAndPassword(cleanEmail, password)
                        }
                        task.addOnCompleteListener { result ->
                            if (result.isSuccessful && createAccount) {
                                val newUser = auth.currentUser
                                if (newUser != null) {
                                    newUser.sendEmailVerification().addOnCompleteListener { verification ->
                                        busy = false
                                        message = if (verification.isSuccessful) {
                                            "Account created. Please check your email to verify your address."
                                        } else {
                                            "Account created, but verification email could not be sent. You can request it after signing in."
                                        }
                                    }
                                } else {
                                    busy = false
                                    message = "Account created successfully."
                                }
                            } else {
                                busy = false
                                message = if (result.isSuccessful) "Signed in successfully."
                                else result.exception?.localizedMessage ?: "Authentication failed. Please try again."
                            }
                        }
                    }
                },
                enabled = !busy,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (busy) "Please wait…" else if (createAccount) "Create account" else "Sign in")
            }
            TextButton(onClick = { createAccount = !createAccount; message = null }) {
                Text(if (createAccount) "Already have an account? Sign in" else "New to JEMBEE PLAY? Create account")
            }
            if (!createAccount) {
                TextButton(onClick = {
                    val cleanEmail = email.trim()
                    if (cleanEmail.isBlank()) {
                        message = "Enter your email first to receive a password reset link."
                    } else {
                        busy = true
                        auth.sendPasswordResetEmail(cleanEmail).addOnCompleteListener { result ->
                            busy = false
                            message = if (result.isSuccessful) "Password reset email sent. Check your inbox."
                            else result.exception?.localizedMessage ?: "Could not send password reset email."
                        }
                    }
                }, enabled = !busy) { Text("Forgot password?") }
            }
            Text("Google sign-in will be enabled after Android signing fingerprints are added.")
        }
        if (message != null) Text(message!!)
        Spacer(Modifier.height(4.dp))
    }
}
