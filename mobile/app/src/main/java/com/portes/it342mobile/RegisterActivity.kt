package com.portes.it342mobile

import android.content.Intent
import android.os.Bundle
import android.util.Log // Added for debugging
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        val etUsername = findViewById<com.google.android.material.textfield.TextInputEditText>(R.id.etUsername)
        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnRegister = findViewById<Button>(R.id.btnRegister)

        btnRegister.setOnClickListener {
            val username = etUsername.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()

            if (username.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Fill in all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            // Creating request with 'username' to match DB/Backend
            val registerRequest = RegisterRequest(username, email, password)

            RetrofitClient.instance.register(registerRequest)
                .enqueue(object : Callback<AuthResponse> {
                    override fun onResponse(call: Call<AuthResponse>, response: Response<AuthResponse>) {
                        val body = response.body()

                        if (response.isSuccessful && body?.status == "success") {
                            Toast.makeText(this@RegisterActivity, "Registered Successfully", Toast.LENGTH_SHORT).show()
                            startActivity(Intent(this@RegisterActivity, LoginActivity::class.java))
                            finish()
                        } else {
                            // If backend returns an error (e.g., email already exists)
                            val errorMsg = body?.message ?: "Registration failed: ${response.code()}"
                            Toast.makeText(this@RegisterActivity, errorMsg, Toast.LENGTH_SHORT).show()
                        }
                    }

                    override fun onFailure(call: Call<AuthResponse>, t: Throwable) {
                        // This will print the actual reason for connection failure in Logcat
                        Log.e("API_DEBUG", "Connection Failed: ${t.message}")
                        Toast.makeText(this@RegisterActivity, "Network Error: ${t.localizedMessage}", Toast.LENGTH_LONG).show()
                    }
                })
        }
    }
}